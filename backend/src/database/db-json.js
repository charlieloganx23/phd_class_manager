import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, '../../database/data.json');

// Estrutura inicial do banco de dados
const initialData = {
  users: [
    {
      id: 1,
      name: 'Administrador',
      email: 'admin@phd.com',
      password: 'admin123',
      role: 'admin',
      phone: null,
      is_active: true
    }
  ],
  professores: [],
  turmas: [],
  alunos: [],
  aulas: [],
  substituicoes: [],
  notificacoes: [],
  whatsapp_logs: []
};

// Criar arquivo se não existir
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  console.log('✅ Banco de dados JSON criado com sucesso!');
} else {
  console.log('⚠️  Banco de dados já existe');
}

// Carregar dados
export function loadData() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return initialData;
  }
}

// Salvar dados
export function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
}

// Gerar novo ID
export function generateId(collection) {
  const data = loadData();
  const items = data[collection] || [];
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}

export default {
  loadData,
  saveData,
  generateId
};
