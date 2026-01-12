import { loadData, saveData, generateId } from '../database/db-json.js';

console.log('📦 Setup inicial do sistema PHD Class Manager...\n');

// Garantir que o arquivo data.json existe
const data = loadData();

console.log('✅ Banco de dados JSON inicializado');
console.log('\n📝 Credenciais de acesso:');
console.log('  Admin: admin@phd.com / admin123\n');
console.log('🚀 Execute "npm run dev" para iniciar o servidor\n');
