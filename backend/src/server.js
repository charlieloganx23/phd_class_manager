import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import turmasRoutes from './routes/turmas.js';
import aulasRoutes from './routes/aulas.js';
import professoresRoutes from './routes/professores.js';
import notificacoesRoutes from './routes/notificacoes.js';
import dashboardRoutes from './routes/dashboard.js';
import alunosRoutes from './routes/alunos.js';
import substituicoesRoutes from './routes/substituicoes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: '🎓 PHD Class Manager API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      turmas: '/api/turmas',
      aulas: '/api/aulas',
      professores: '/api/professores',
      alunos: '/api/alunos',
      substituicoes: '/api/substituicoes',
      notificacoes: '/api/notificacoes',
      dashboard: '/api/dashboard'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/turmas', turmasRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/professores', professoresRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/substituicoes', substituicoesRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log('🎓 PHD Class Manager - Backend Server');
  console.log('🚀 ============================================');
  console.log(`📡 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/`);
  console.log('🚀 ============================================');
  console.log('');
});

export default app;
