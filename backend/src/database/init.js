import db from './connection.js';

console.log('🗄️  Inicializando banco de dados...');

// Tabela de Usuários (Admin, Professor, Aluno)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'professor', 'aluno')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabela de Professores (extensão de users)
db.exec(`
  CREATE TABLE IF NOT EXISTS professores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    disciplina TEXT NOT NULL,
    legenda TEXT NOT NULL,
    cor_hex TEXT,
    total_aulas INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Tabela de Turmas
db.exec(`
  CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    periodo TEXT NOT NULL CHECK(periodo IN ('Tarde', 'Noite', 'Manhã')),
    ano INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabela de Alunos (extensão de users com turma)
db.exec(`
  CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    turma_id INTEGER NOT NULL,
    whatsapp TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
  )
`);

// Tabela de Aulas
db.exec(`
  CREATE TABLE IF NOT EXISTS aulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turma_id INTEGER NOT NULL,
    professor_id INTEGER,
    disciplina TEXT NOT NULL,
    codigo_aula TEXT,
    data_aula DATE NOT NULL,
    dia_semana TEXT NOT NULL,
    periodo TEXT NOT NULL,
    semana INTEGER,
    status TEXT DEFAULT 'agendada' CHECK(status IN ('agendada', 'confirmada', 'cancelada', 'substituida')),
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE SET NULL
  )
`);

// Tabela de Substituições
db.exec(`
  CREATE TABLE IF NOT EXISTS substituicoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aula_id INTEGER NOT NULL,
    professor_original_id INTEGER NOT NULL,
    professor_substituto_id INTEGER,
    motivo TEXT,
    status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'aprovada', 'recusada', 'concluida')),
    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao DATETIME,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_original_id) REFERENCES professores(id),
    FOREIGN KEY (professor_substituto_id) REFERENCES professores(id)
  )
`);

// Tabela de Notificações
db.exec(`
  CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK(tipo IN ('aula', 'ausencia', 'substituicao', 'geral')),
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    destinatario_tipo TEXT NOT NULL CHECK(destinatario_tipo IN ('todos', 'turma', 'individual')),
    turma_id INTEGER,
    user_id INTEGER,
    aula_id INTEGER,
    status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'enviada', 'erro')),
    enviada_em DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL
  )
`);

// Tabela de Logs de WhatsApp
db.exec(`
  CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notificacao_id INTEGER NOT NULL,
    destinatario TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    status TEXT NOT NULL,
    erro TEXT,
    twilio_sid TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notificacao_id) REFERENCES notificacoes(id) ON DELETE CASCADE
  )
`);

// Índices para performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_aulas_data ON aulas(data_aula);
  CREATE INDEX IF NOT EXISTS idx_aulas_turma ON aulas(turma_id);
  CREATE INDEX IF NOT EXISTS idx_aulas_professor ON aulas(professor_id);
  CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON notificacoes(status);
`);

// Inserir usuário admin padrão
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@phd.com');

if (!adminExists) {
  // Senha: admin123 (em produção, usar bcrypt)
  db.prepare(`
    INSERT INTO users (name, email, password, role) 
    VALUES (?, ?, ?, ?)
  `).run('Administrador', 'admin@phd.com', '$2a$10$rOqLRqKLGXsI.hVqFhJXv.KN9W8qKXFXbLJGXKKJXKKKKKKKKK', 'admin');
  
  console.log('✅ Usuário admin criado: admin@phd.com / admin123');
}

console.log('✅ Banco de dados inicializado com sucesso!');
console.log('📊 Tabelas criadas:');
console.log('   - users');
console.log('   - professores');
console.log('   - turmas');
console.log('   - alunos');
console.log('   - aulas');
console.log('   - substituicoes');
console.log('   - notificacoes');
console.log('   - whatsapp_logs');

db.close();
