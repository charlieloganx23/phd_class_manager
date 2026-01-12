import express from 'express';
import { loadData } from '../database/db-json.js';
import AulaModel from '../models/Aula.js';

const router = express.Router();

// Dashboard geral
router.get('/', (req, res) => {
  try {
    const data = loadData();
    const hoje = new Date().toISOString().split('T')[0];
    
    const stats = {
      totalTurmas: data.turmas.filter(t => t.is_active).length,
      totalProfessores: data.professores.length,
      totalAlunos: data.alunos.length,
      totalAulas: data.aulas.length,
      aulasHoje: data.aulas.filter(a => a.data_aula === hoje).length,
      proximasAulas: AulaModel.getProximasAulas(5),
      notificacoesPendentes: data.notificacoes.filter(n => n.status === 'pendente').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

export default router;
