import express from 'express';
import dbJson from '../database/db-json.js';

const router = express.Router();

// Listar todos os alunos
router.get('/', (req, res) => {
  try {
    const { turma_id } = req.query;
    const data = dbJson.loadData();
    let alunos = data.alunos || [];

    // Filtrar por turma se especificado
    if (turma_id) {
      alunos = alunos.filter(a => a.turma_id === parseInt(turma_id));
    }

    // Enriquecer com dados da turma e usuário
    alunos = alunos.map(aluno => {
      const turma = data.turmas.find(t => t.id === aluno.turma_id);
      const user = data.users.find(u => u.id === aluno.user_id);
      return {
        ...aluno,
        turma_nome: turma?.nome || null,
        user_name: user?.name || null,
        user_email: user?.email || null
      };
    });

    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// Buscar aluno por ID
router.get('/:id', (req, res) => {
  try {
    const alunoId = parseInt(req.params.id);
    const data = dbJson.loadData();
    const aluno = data.alunos.find(a => a.id === alunoId);

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Enriquecer com dados relacionados
    const turma = data.turmas.find(t => t.id === aluno.turma_id);
    const user = data.users.find(u => u.id === aluno.user_id);

    res.json({
      ...aluno,
      turma_nome: turma?.nome || null,
      user_name: user?.name || null,
      user_email: user?.email || null
    });
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// Criar novo aluno
router.post('/', (req, res) => {
  try {
    const { name, email, password, phone, whatsapp, turma_id, matricula, data_ingresso } = req.body;

    // Validações
    if (!name || !email || !turma_id) {
      return res.status(400).json({ error: 'Nome, email e turma são obrigatórios' });
    }

    const data = dbJson.loadData();

    // Verificar se email já existe
    const emailExists = data.users.find(u => u.email === email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Verificar se turma existe
    const turmaExists = data.turmas.find(t => t.id === turma_id);
    if (!turmaExists) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Criar usuário primeiro
    const novoUser = {
      id: dbJson.generateId('users'),
      name,
      email,
      password: password || '123456', // Senha padrão
      role: 'aluno',
      phone: phone || null,
      is_active: true
    };
    data.users.push(novoUser);

    // Criar aluno
    const novoAluno = {
      id: dbJson.generateId('alunos'),
      user_id: novoUser.id,
      turma_id,
      matricula: matricula || `MAT${Date.now()}`,
      whatsapp: whatsapp || phone || null,
      data_ingresso: data_ingresso || new Date().toISOString().split('T')[0],
      status: 'ativo'
    };
    data.alunos.push(novoAluno);

    dbJson.saveData(data);

    res.status(201).json({
      message: 'Aluno criado com sucesso',
      aluno: {
        ...novoAluno,
        user_name: novoUser.name,
        user_email: novoUser.email,
        turma_nome: turmaExists.nome
      }
    });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// Atualizar aluno
router.put('/:id', (req, res) => {
  try {
    const alunoId = parseInt(req.params.id);
    const { name, email, phone, whatsapp, turma_id, matricula, status } = req.body;

    const data = dbJson.loadData();
    const alunoIndex = data.alunos.findIndex(a => a.id === alunoId);

    if (alunoIndex === -1) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const aluno = data.alunos[alunoIndex];

    // Atualizar dados do usuário
    if (aluno.user_id) {
      const userIndex = data.users.findIndex(u => u.id === aluno.user_id);
      if (userIndex !== -1) {
        if (name) data.users[userIndex].name = name;
        if (email) {
          // Verificar se email já existe em outro usuário
          const emailExists = data.users.find(u => u.email === email && u.id !== aluno.user_id);
          if (emailExists) {
            return res.status(400).json({ error: 'Email já cadastrado' });
          }
          data.users[userIndex].email = email;
        }
        if (phone !== undefined) data.users[userIndex].phone = phone;
      }
    }

    // Atualizar dados do aluno
    if (whatsapp !== undefined) aluno.whatsapp = whatsapp;
    if (turma_id !== undefined) {
      const turmaExists = data.turmas.find(t => t.id === turma_id);
      if (!turmaExists) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }
      aluno.turma_id = turma_id;
    }
    if (matricula) aluno.matricula = matricula;
    if (status) aluno.status = status;

    data.alunos[alunoIndex] = aluno;
    dbJson.saveData(data);

    res.json({
      message: 'Aluno atualizado com sucesso',
      aluno
    });
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// Deletar aluno
router.delete('/:id', (req, res) => {
  try {
    const alunoId = parseInt(req.params.id);
    const data = dbJson.loadData();
    const alunoIndex = data.alunos.findIndex(a => a.id === alunoId);

    if (alunoIndex === -1) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const aluno = data.alunos[alunoIndex];

    // Desativar usuário em vez de deletar (melhor para histórico)
    if (aluno.user_id) {
      const userIndex = data.users.findIndex(u => u.id === aluno.user_id);
      if (userIndex !== -1) {
        data.users[userIndex].is_active = false;
      }
    }

    // Remover aluno
    data.alunos.splice(alunoIndex, 1);
    dbJson.saveData(data);

    res.json({ message: 'Aluno removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: 'Erro ao deletar aluno' });
  }
});

export default router;
