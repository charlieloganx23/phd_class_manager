# 🎓 PHD Class Manager

Sistema completo de gerenciamento de aulas para cursos preparatórios com integração WhatsApp.

## 📋 Visão Geral

Sistema web para gestão de horários, professores e notificações automatizadas para alunos via WhatsApp.

### ✨ Funcionalidades

- 📊 **Dashboard Administrativo**: Visão geral de aulas, professores e turmas
- 👨‍🏫 **Área do Professor**: Visualizar horários, marcar ausências, solicitar substituições
- 👨‍🎓 **Portal do Aluno**: Consultar horários e receber notificações
- 📱 **Notificações WhatsApp**: Alertas automáticos de aulas, ausências e substituições
- 📈 **Relatórios**: Analytics de presença e desempenho

## 🛠️ Stack Tecnológica

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express
- SQLite (desenvolvimento) / PostgreSQL (produção)
- JWT Authentication
- Twilio API (WhatsApp)

## 🚀 Instalação

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📦 Estrutura do Projeto

```
phd-class-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.js
│   ├── database/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔑 Variáveis de Ambiente

### Backend (.env)
```
PORT=3000
DATABASE_URL=
JWT_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

## 📱 Integração WhatsApp

O sistema utiliza a API do Twilio para envio de mensagens WhatsApp. Configure suas credenciais no arquivo `.env`.

## 👥 Perfis de Usuário

- **Administrador**: Acesso total ao sistema
- **Professor**: Gerenciar suas aulas e substituições
- **Aluno**: Visualizar horários e receber notificações

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido por

PHD Cursos Preparatórios - 2026
