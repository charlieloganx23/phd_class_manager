import express from 'express';
import { loadData, saveData, generateId } from '../database/db-json.js';

const router = express.Router();

// Login simples
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const data = loadData();

    const user = data.users.find(u => u.email === email && u.is_active);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha (simplificado)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Buscar dados adicionais baseado no role
    let userData = { ...user };
    delete userData.password;

    if (user.role === 'professor') {
      const professor = data.professores.find(p => p.user_id === user.id);
      userData.professor = professor;
    } else if (user.role === 'aluno') {
      const aluno = data.alunos.find(a => a.user_id === user.id);
      if (aluno) {
        const turma = data.turmas.find(t => t.id === aluno.turma_id);
        userData.aluno = { ...aluno, turma_nome: turma?.nome, periodo: turma?.periodo };
      }
    }

    res.json({
      message: 'Login realizado com sucesso',
      user: userData,
      token: 'fake-jwt-token-' + user.id
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Registro de novo usuário
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const data = loadData();

    // Verificar se email já existe
    if (data.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const userId = generateId('users');
    data.users.push({
      id: userId,
      name,
      email,
      password,
      role,
      phone: phone || null,
      is_active: true
    });

    saveData(data);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      userId
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

export default router;
