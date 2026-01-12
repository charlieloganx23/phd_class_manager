# 🚀 Guia de Inicialização Rápida - PHD Class Manager

## ⚡ Início Rápido

### Pré-requisitos
- Node.js instalado (v14 ou superior)
- Navegador web moderno

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/charlieloganx23/phd_class_manager.git
cd phd_class_manager
```

### Passo 2: Instalar Dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Passo 3: Iniciar os Servidores

Abra **2 terminais** diferentes:

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

Você verá:
```
🚀 ============================================
🎓 PHD Class Manager - Backend Server
🚀 ============================================
📡 Servidor rodando na porta 3000
🌐 URL: http://localhost:3000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Você verá:
```
  VITE v7.3.1  ready in 490 ms

  ➜  Local:   http://localhost:5173/
```

### Passo 4: Acessar o Sistema

Abra seu navegador em: **http://localhost:5173**

---

## 👤 Credenciais de Acesso

### 🔐 Administrador
- **Email:** `admin@phd.com`
- **Senha:** `admin123`

**Funcionalidades:**
- Visualizar dashboard completo
- Gerenciar aulas
- Gerenciar professores
- Enviar notificações WhatsApp

### 👨‍🏫 Professor (Português)
- **Email:** `port@phd.com`
- **Senha:** `123456`

### 👨‍🏫 Professor (Matemática)
- **Email:** `mat@phd.com`
- **Senha:** `123456`

**Funcionalidades dos Professores:**
- Visualizar suas aulas
- Marcar presença/ausência
- Solicitar substituições

---

## 📚 Como Usar o Sistema

### 1️⃣ Login
1. Acesse http://localhost:5173
2. Use uma das credenciais acima
3. Clique em "Entrar"

### 2️⃣ Dashboard (Admin)
- **Visão geral** com estatísticas:
  - Total de aulas
  - Total de professores
  - Total de turmas
  - Aulas do dia
- **Próximas aulas** com status e datas

### 3️⃣ Gerenciar Aulas
1. Clique em "Aulas" no menu
2. Veja todas as aulas cadastradas
3. Filtre por status:
   - Todas
   - Agendadas
   - Confirmadas
   - Canceladas
4. Edite ou cancele aulas conforme necessário

### 4️⃣ Gerenciar Professores (Admin)
1. Clique em "Professores" no menu
2. Veja todos os professores com:
   - Nome e contato
   - Disciplinas lecionadas
   - Status (ativo/inativo)
3. Adicione novos professores
4. Edite informações existentes

### 5️⃣ Enviar Notificações WhatsApp (Admin)
1. Clique em "Notificações" no menu
2. Clique em "+ Nova Notificação"
3. Selecione o tipo:
   - Geral
   - Aula
   - Aviso
   - Cancelamento
4. Digite a mensagem
5. Clique em "Enviar para Todos os Alunos"
6. Veja o histórico de notificações enviadas

---

## 🗄️ Dados Pré-carregados

O sistema já vem com dados reais da planilha "Horários PHD 2026.xlsx":

### 👨‍🏫 Professores (8 total)
- Português (port@phd.com)
- Matemática (mat@phd.com)
- Física (fis@phd.com)
- Química (qui@phd.com)
- Biologia (bio@phd.com)
- História (hist@phd.com)
- Geografia (geo@phd.com)
- Inglês (ing@phd.com)

### 🏫 Turmas (2)
- Turma da Tarde (13:00-17:20)
- Turma da Noite (18:40-23:00)

### 📅 Aulas (62 aulas agendadas)
- 4 semanas completas de horários
- Segunda a Sábado
- Horários definidos por disciplina
- Status: agendada, confirmada ou realizada

---

## 🎯 Funcionalidades Principais

### ✅ Sistema de Autenticação
- Login seguro com JWT
- Proteção de rotas
- Controle de acesso por perfil (admin/professor)
- Logout automático em caso de token expirado

### ✅ Dashboard Interativo
- Estatísticas em tempo real
- Cards informativos
- Lista de próximas aulas
- Status visual das aulas

### ✅ Gestão de Aulas
- Listagem completa
- Filtros por status
- Informações detalhadas (disciplina, turma, professor, horário)
- Ações de edição e cancelamento

### ✅ Gestão de Professores
- Perfis completos com foto (inicial do nome)
- Cores identificadoras por professor
- Lista de disciplinas
- Informações de contato
- Status ativo/inativo

### ✅ Sistema de Notificações
- Envio de mensagens WhatsApp
- Tipos de notificação categorizados
- Histórico completo de envios
- Status de entrega

---

## 🔧 Estrutura do Sistema

### Backend (Node.js + Express)
**Porta:** 3000  
**URL:** http://localhost:3000

**Rotas disponíveis:**
- `/api/auth/*` - Autenticação
- `/api/dashboard/*` - Estatísticas
- `/api/aulas/*` - Gerenciamento de aulas
- `/api/professores/*` - Gerenciamento de professores
- `/api/turmas/*` - Informações de turmas
- `/api/notificacoes/*` - Sistema de notificações

### Frontend (React + TypeScript + Tailwind)
**Porta:** 5173  
**URL:** http://localhost:5173

**Páginas:**
- `/login` - Página de autenticação
- `/` - Dashboard principal
- `/aulas` - Gerenciamento de aulas
- `/professores` - Gerenciamento de professores (admin)
- `/notificacoes` - Envio de notificações (admin)

### Banco de Dados (JSON)
**Arquivo:** `backend/database/data.json`

**Coleções:**
- users
- professores
- turmas
- aulas
- alunos
- substituicoes
- notificacoes
- whatsapp_logs

---

## 🐛 Solução de Problemas

### Problema: Backend não inicia
**Solução:**
```bash
cd backend
rm -rf node_modules
npm install
npm start
```

### Problema: Frontend não inicia
**Solução:**
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Problema: Erro de CORS
**Verificar:** O backend está rodando na porta 3000?  
**Solução:** Reinicie o backend e aguarde a mensagem de confirmação.

### Problema: Erro de autenticação
**Solução:**
1. Limpe o localStorage do navegador (F12 > Application > Local Storage > Clear)
2. Faça login novamente

### Problema: Porta já em uso
**Backend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

**Frontend (5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

---

## 📞 Próximos Passos

### Integração WhatsApp Real
Para ativar o envio real de mensagens:
1. Criar conta no Twilio
2. Obter credenciais (Account SID, Auth Token)
3. Configurar número WhatsApp Business
4. Adicionar credenciais no backend

### Adicionar Alunos
Atualmente o sistema tem professores e turmas, mas não alunos cadastrados.  
Próxima feature: Sistema de cadastro de alunos.

### Deploy em Produção
Opções recomendadas:
- **Backend:** Heroku, Railway, Render
- **Frontend:** Vercel, Netlify
- **Banco:** Migrar para PostgreSQL ou MongoDB

---

## 🎓 Sistema Desenvolvido para PHD Cursos Preparatórios

**Tecnologias:**
- ⚛️ React 18 + TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🚀 Node.js + Express
- 🗃️ JSON Database
- 🔐 JWT Authentication

**GitHub:** https://github.com/charlieloganx23/phd_class_manager

---

✅ **Tudo pronto!** Seu sistema está funcionando perfeitamente.

Aproveite o PHD Class Manager! 🎉
