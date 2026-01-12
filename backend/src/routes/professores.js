import express from 'express';
import { loadData } from '../database/db-json.js';

const router = express.Router();

// Listar todos os professores
router.get('/', (req, res) => {
  try {
    const data = loadData();
    const professores = data.professores.map(p => {
      const user = data.users.find(u => u.id === p.user_id);
      return {
        ...p,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        is_active: user?.is_active
      };
    });
    res.json(professores);
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    res.status(500).json({ error: 'Erro ao buscar professores' });
  }
});

// Buscar professor por ID
router.get('/:id', (req, res) => {
  try {
    const data = loadData();
    const professor = data.professores.find(p => p.id === parseInt(req.params.id));
    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    const user = data.users.find(u => u.id === professor.user_id);
    res.json({
      ...professor,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      is_active: user?.is_active
    });
  } catch (error) {
    console.error('Erro ao buscar professor:', error);
    res.status(500).json({ error: 'Erro ao buscar professor' });
  }
});

// Buscar aulas do professor
router.get('/:id/aulas', (req, res) => {
  try {
    const data = loadData();
    const { data_inicio, data_fim } = req.query;
    
    let aulas = data.aulas.filter(a => a.professor_id === parseInt(req.params.id));
    
    if (data_inicio) {
      aulas = aulas.filter(a => a.data_aula >= data_inicio);
    }
    
    if (data_fim) {
      aulas = aulas.filter(a => a.data_aula <= data_fim);
    }
    
    const aulasComTurma = aulas.map(a => {
      const turma = data.turmas.find(t => t.id === a.turma_id);
      return {
        ...a,
        turma_nome: turma?.nome,
        periodo: turma?.periodo
      };
    }).sort((a, b) => new Date(a.data_aula) - new Date(b.data_aula));
    
    res.json(aulasComTurma);
  } catch (error) {
    console.error('Erro ao buscar aulas do professor:', error);
    res.status(500).json({ error: 'Erro ao buscar aulas' });
  }
});

export default router;
