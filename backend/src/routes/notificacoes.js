import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Listar notificações
router.get('/', (req, res) => {
  try {
    const { status, tipo } = req.query;
    let query = 'SELECT * FROM notificacoes WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY created_at DESC';

    const notificacoes = db.prepare(query).all(...params);
    res.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// Criar notificação
router.post('/', (req, res) => {
  try {
    const { tipo, titulo, mensagem, destinatario_tipo, turma_id, user_id, aula_id } = req.body;

    const stmt = db.prepare(`
      INSERT INTO notificacoes (tipo, titulo, mensagem, destinatario_tipo, turma_id, user_id, aula_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(tipo, titulo, mensagem, destinatario_tipo, turma_id || null, user_id || null, aula_id || null);

    res.status(201).json({
      message: 'Notificação criada com sucesso',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ error: 'Erro ao criar notificação' });
  }
});

// Enviar notificação (simula envio por WhatsApp)
router.post('/:id/enviar', async (req, res) => {
  try {
    const notificacaoId = req.params.id;

    const notificacao = db.prepare('SELECT * FROM notificacoes WHERE id = ?').get(notificacaoId);

    if (!notificacao) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    // Buscar destinatários
    let destinatarios = [];
    if (notificacao.destinatario_tipo === 'turma' && notificacao.turma_id) {
      destinatarios = db.prepare(`
        SELECT u.name, u.phone, a.whatsapp
        FROM alunos a
        JOIN users u ON a.user_id = u.id
        WHERE a.turma_id = ? AND u.is_active = 1
      `).all(notificacao.turma_id);
    } else if (notificacao.destinatario_tipo === 'individual' && notificacao.user_id) {
      const user = db.prepare('SELECT name, phone FROM users WHERE id = ?').get(notificacao.user_id);
      if (user) destinatarios = [user];
    }

    // Simular envio (em produção, usar Twilio)
    let enviados = 0;
    for (const dest of destinatarios) {
      const telefone = dest.whatsapp || dest.phone;
      if (telefone) {
        // Log do envio
        db.prepare(`
          INSERT INTO whatsapp_logs (notificacao_id, destinatario, mensagem, status)
          VALUES (?, ?, ?, ?)
        `).run(notificacaoId, telefone, notificacao.mensagem, 'enviada');
        enviados++;
      }
    }

    // Atualizar status da notificação
    db.prepare(`
      UPDATE notificacoes 
      SET status = 'enviada', enviada_em = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(notificacaoId);

    res.json({
      message: 'Notificação enviada com sucesso',
      destinatarios: enviados,
      detalhes: `${enviados} mensagens enviadas via WhatsApp`
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

export default router;
