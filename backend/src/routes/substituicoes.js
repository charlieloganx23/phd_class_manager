import express from 'express';
import dbJson from '../database/db-json.js';

const router = express.Router();

// Listar todas as substituições
router.get('/', (req, res) => {
  try {
    const { aula_id, professor_substituto_id, status } = req.query;
    const data = dbJson.loadData();
    let substituicoes = data.substituicoes || [];

    // Filtros
    if (aula_id) {
      substituicoes = substituicoes.filter(s => s.aula_id === parseInt(aula_id));
    }
    if (professor_substituto_id) {
      substituicoes = substituicoes.filter(s => s.professor_substituto_id === parseInt(professor_substituto_id));
    }
    if (status) {
      substituicoes = substituicoes.filter(s => s.status === status);
    }

    // Enriquecer com dados relacionados
    substituicoes = substituicoes.map(sub => {
      const aula = data.aulas.find(a => a.id === sub.aula_id);
      const profOriginal = data.professores.find(p => p.id === aula?.professor_id);
      const profSubstituto = data.professores.find(p => p.id === sub.professor_substituto_id);
      
      return {
        ...sub,
        aula_disciplina: aula?.disciplina || null,
        aula_data: aula?.data || null,
        aula_horario: aula?.horario || null,
        professor_original_nome: profOriginal?.nome || null,
        professor_substituto_nome: profSubstituto?.nome || null
      };
    });

    // Ordenar por data (mais recentes primeiro)
    substituicoes.sort((a, b) => new Date(b.aula_data || 0) - new Date(a.aula_data || 0));

    res.json(substituicoes);
  } catch (error) {
    console.error('Erro ao buscar substituições:', error);
    res.status(500).json({ error: 'Erro ao buscar substituições' });
  }
});

// Buscar substituição por ID
router.get('/:id', (req, res) => {
  try {
    const subId = parseInt(req.params.id);
    const data = dbJson.loadData();
    const substituicao = data.substituicoes.find(s => s.id === subId);

    if (!substituicao) {
      return res.status(404).json({ error: 'Substituição não encontrada' });
    }

    // Enriquecer com dados relacionados
    const aula = data.aulas.find(a => a.id === substituicao.aula_id);
    const profOriginal = data.professores.find(p => p.id === aula?.professor_id);
    const profSubstituto = data.professores.find(p => p.id === substituicao.professor_substituto_id);

    res.json({
      ...substituicao,
      aula,
      professor_original: profOriginal,
      professor_substituto: profSubstituto
    });
  } catch (error) {
    console.error('Erro ao buscar substituição:', error);
    res.status(500).json({ error: 'Erro ao buscar substituição' });
  }
});

// Criar nova substituição
router.post('/', (req, res) => {
  try {
    const { aula_id, professor_substituto_id, motivo, observacoes } = req.body;

    // Validações
    if (!aula_id || !professor_substituto_id) {
      return res.status(400).json({ error: 'Aula e professor substituto são obrigatórios' });
    }

    const data = dbJson.loadData();

    // Verificar se aula existe
    const aula = data.aulas.find(a => a.id === aula_id);
    if (!aula) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }

    // Verificar se professor substituto existe
    const profSubstituto = data.professores.find(p => p.id === professor_substituto_id);
    if (!profSubstituto) {
      return res.status(404).json({ error: 'Professor substituto não encontrado' });
    }

    // Verificar se já existe substituição para esta aula
    const subExistente = data.substituicoes.find(s => s.aula_id === aula_id && s.status === 'confirmada');
    if (subExistente) {
      return res.status(400).json({ error: 'Já existe uma substituição confirmada para esta aula' });
    }

    // Criar substituição
    const novaSubstituicao = {
      id: dbJson.generateId('substituicoes'),
      aula_id,
      professor_original_id: aula.professor_id,
      professor_substituto_id,
      motivo: motivo || null,
      observacoes: observacoes || null,
      status: 'pendente',
      data_solicitacao: new Date().toISOString(),
      data_confirmacao: null
    };

    data.substituicoes.push(novaSubstituicao);
    dbJson.saveData(data);

    res.status(201).json({
      message: 'Substituição criada com sucesso',
      substituicao: {
        ...novaSubstituicao,
        aula_disciplina: aula.disciplina,
        professor_substituto_nome: profSubstituto.nome
      }
    });
  } catch (error) {
    console.error('Erro ao criar substituição:', error);
    res.status(500).json({ error: 'Erro ao criar substituição' });
  }
});

// Confirmar/Cancelar substituição
router.patch('/:id/status', (req, res) => {
  try {
    const subId = parseInt(req.params.id);
    const { status, observacoes } = req.body;

    // Validar status
    if (!['confirmada', 'cancelada', 'pendente'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const data = dbJson.loadData();
    const subIndex = data.substituicoes.findIndex(s => s.id === subId);

    if (subIndex === -1) {
      return res.status(404).json({ error: 'Substituição não encontrada' });
    }

    // Atualizar substituição
    data.substituicoes[subIndex].status = status;
    if (observacoes) {
      data.substituicoes[subIndex].observacoes = observacoes;
    }
    if (status === 'confirmada') {
      data.substituicoes[subIndex].data_confirmacao = new Date().toISOString();
      
      // Atualizar a aula com o professor substituto
      const aulaIndex = data.aulas.findIndex(a => a.id === data.substituicoes[subIndex].aula_id);
      if (aulaIndex !== -1) {
        data.aulas[aulaIndex].professor_id = data.substituicoes[subIndex].professor_substituto_id;
        data.aulas[aulaIndex].substituicao_id = subId;
      }
    }

    dbJson.saveData(data);

    res.json({
      message: `Substituição ${status} com sucesso`,
      substituicao: data.substituicoes[subIndex]
    });
  } catch (error) {
    console.error('Erro ao atualizar status da substituição:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da substituição' });
  }
});

// Deletar substituição
router.delete('/:id', (req, res) => {
  try {
    const subId = parseInt(req.params.id);
    const data = dbJson.loadData();
    const subIndex = data.substituicoes.findIndex(s => s.id === subId);

    if (subIndex === -1) {
      return res.status(404).json({ error: 'Substituição não encontrada' });
    }

    const substituicao = data.substituicoes[subIndex];

    // Se estava confirmada, reverter a aula
    if (substituicao.status === 'confirmada') {
      const aulaIndex = data.aulas.findIndex(a => a.id === substituicao.aula_id);
      if (aulaIndex !== -1 && data.aulas[aulaIndex].substituicao_id === subId) {
        data.aulas[aulaIndex].professor_id = substituicao.professor_original_id;
        data.aulas[aulaIndex].substituicao_id = null;
      }
    }

    // Remover substituição
    data.substituicoes.splice(subIndex, 1);
    dbJson.saveData(data);

    res.json({ message: 'Substituição removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar substituição:', error);
    res.status(500).json({ error: 'Erro ao deletar substituição' });
  }
});

export default router;
