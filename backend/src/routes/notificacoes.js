import express from 'express';
import dbJson from '../database/db-json.js';

const router = express.Router();

// Listar notificações
router.get('/', (req, res) => {
  try {
    const { status, tipo } = req.query;
    const data = dbJson.loadData();
    let notificacoes = data.notificacoes || [];

    // Filtrar por status
    if (status) {
      notificacoes = notificacoes.filter(n => n.status === status);
    }

    // Filtrar por tipo
    if (tipo) {
      notificacoes = notificacoes.filter(n => n.tipo === tipo);
    }

    // Ordenar por data (mais recentes primeiro)
    notificacoes.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

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

    const data = dbJson.loadData();
    const novaNotificacao = {
      id: dbJson.generateId('notificacoes'),
      tipo,
      titulo,
      mensagem,
      destinatario_tipo,
      turma_id: turma_id || null,
      user_id: user_id || null,
      aula_id: aula_id || null,
      status: 'pendente',
      created_at: new Date().toISOString()
    };

    data.notificacoes.push(novaNotificacao);
    dbJson.saveData(data);

    res.status(201).json({
      message: 'Notificação criada com sucesso',
      notificacao: novaNotificacao
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ error: 'Erro ao criar notificação' });
  }
});

// Enviar notificação (simula envio por WhatsApp)
router.post('/:id/enviar', async (req, res) => {
  try {
    const notificacaoId = parseInt(req.params.id);
    const data = dbJson.loadData();
    const notificacao = data.notificacoes.find(n => n.id === notificacaoId);

    if (!notificacao) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    // Buscar destinatários
    let destinatarios = [];
    if (notificacao.destinatario_tipo === 'turma' && notificacao.turma_id) {
      const turma = data.turmas.find(t => t.id === notificacao.turma_id);
      if (turma) {
        const alunos = data.alunos.filter(a => a.turma_id === notificacao.turma_id);
        destinatarios = alunos.map(a => {
          const user = data.users.find(u => u.id === a.user_id && u.is_active);
          return user ? { name: user.name, phone: user.phone || a.whatsapp } : null;
        }).filter(d => d !== null);
      }
    } else if (notificacao.destinatario_tipo === 'individual' && notificacao.user_id) {
      const user = data.users.find(u => u.id === notificacao.user_id);
      if (user) destinatarios = [{ name: user.name, phone: user.phone }];
    }

    // Simular envio (em produção, usar Twilio ou WhatsApp Business API)
    let enviados = 0;
    for (const dest of destinatarios) {
      const telefone = dest.phone;
      if (telefone) {
        // Log do envio
        const log = {
          id: dbJson.generateId('whatsapp_logs'),
          notificacao_id: notificacaoId,
          destinatario: telefone,
          mensagem: notificacao.mensagem,
          status: 'enviada',
          created_at: new Date().toISOString()
        };
        data.whatsapp_logs.push(log);
        enviados++;
      }
    }

    // Atualizar status da notificação
    const index = data.notificacoes.findIndex(n => n.id === notificacaoId);
    if (index !== -1) {
      data.notificacoes[index].status = 'enviada';
      data.notificacoes[index].enviada_em = new Date().toISOString();
    }

    dbJson.saveData(data);

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
