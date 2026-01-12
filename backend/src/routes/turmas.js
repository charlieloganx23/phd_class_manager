import express from 'express';
import { loadData, saveData, generateId } from '../database/db-json.js';

const router = express.Router();

// Listar todas as turmas
router.get('/', (req, res) => {
  try {
    const data = loadData();
    const turmas = data.turmas.map(t => ({
      ...t,
      total_alunos: data.alunos.filter(a => a.turma_id === t.id).length
    }));
    res.json(turmas);
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

// Buscar turma por ID
router.get('/:id', (req, res) => {
  try {
    const data = loadData();
    const turma = data.turmas.find(t => t.id === parseInt(req.params.id));
    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    turma.total_alunos = data.alunos.filter(a => a.turma_id === turma.id).length;
    res.json(turma);
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    res.status(500).json({ error: 'Erro ao buscar turma' });
  }
});

// Buscar alunos de uma turma
router.get('/:id/alunos', (req, res) => {
  try {
    const data = loadData();
    const alunos = data.alunos
      .filter(a => a.turma_id === parseInt(req.params.id))
      .map(aluno => {
        const user = data.users.find(u => u.id === aluno.user_id);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          whatsapp: aluno.whatsapp
        };
      });
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// Criar nova turma
router.post('/', (req, res) => {
  try {
    const data = loadData();
    const id = generateId('turmas');
    data.turmas.push({
      id,
      ...req.body,
      is_active: req.body.is_active ?? true,
      created_at: new Date().toISOString()
    });
    saveData(data);
    res.status(201).json({ message: 'Turma criada com sucesso', id });
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
});

// Atualizar turma
router.put('/:id', (req, res) => {
  try {
    const data = loadData();
    const index = data.turmas.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    data.turmas[index] = { ...data.turmas[index], ...req.body };
    saveData(data);
    res.json({ message: 'Turma atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json({ error: 'Erro ao atualizar turma' });
  }
});

// Deletar turma
router.delete('/:id', (req, res) => {
  try {
    const data = loadData();
    data.turmas = data.turmas.filter(t => t.id !== parseInt(req.params.id));
    saveData(data);
    res.json({ message: 'Turma deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    res.status(500).json({ error: 'Erro ao deletar turma' });
  }
});

export default router;
