import express from 'express';
import AulaModel from '../models/Aula.js';

const router = express.Router();

// Listar todas as aulas
router.get('/', (req, res) => {
  try {
    const { turma_id, professor_id } = req.query;

    let aulas;
    if (turma_id) {
      aulas = AulaModel.getByTurma(turma_id);
    } else if (professor_id) {
      aulas = AulaModel.getByProfessor(professor_id);
    } else {
      aulas = AulaModel.getAll();
    }

    res.json(aulas);
  } catch (error) {
    console.error('Erro ao buscar aulas:', error);
    res.status(500).json({ error: 'Erro ao buscar aulas' });
  }
});

// Próximas aulas
router.get('/proximas', (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const aulas = AulaModel.getProximasAulas(limit);
    res.json(aulas);
  } catch (error) {
    console.error('Erro ao buscar próximas aulas:', error);
    res.status(500).json({ error: 'Erro ao buscar próximas aulas' });
  }
});

// Buscar aula por ID
router.get('/:id', (req, res) => {
  try {
    const aula = AulaModel.getById(req.params.id);
    if (!aula) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    res.json(aula);
  } catch (error) {
    console.error('Erro ao buscar aula:', error);
    res.status(500).json({ error: 'Erro ao buscar aula' });
  }
});

// Criar nova aula
router.post('/', (req, res) => {
  try {
    const id = AulaModel.create(req.body);
    res.status(201).json({ message: 'Aula criada com sucesso', id });
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(500).json({ error: 'Erro ao criar aula' });
  }
});

// Atualizar aula
router.put('/:id', (req, res) => {
  try {
    AulaModel.update(req.params.id, req.body);
    res.json({ message: 'Aula atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar aula:', error);
    res.status(500).json({ error: 'Erro ao atualizar aula' });
  }
});

// Atualizar status da aula
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    AulaModel.updateStatus(req.params.id, status);
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Deletar aula
router.delete('/:id', (req, res) => {
  try {
    AulaModel.delete(req.params.id);
    res.json({ message: 'Aula deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aula:', error);
    res.status(500).json({ error: 'Erro ao deletar aula' });
  }
});

export default router;
