import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadData, saveData, generateId } from '../database/db-json.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Importando dados da planilha PHD 2026...\n');

// Ler o JSON gerado
const jsonPath = join(__dirname, '../../../../horarios_phd_2026.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const horarioData = JSON.parse(rawData);

// Carregar dados atuais
const data = loadData();

// Limpar dados existentes (exceto admin)
data.professores = [];
data.turmas = [];
data.aulas = [];

// 1. Criar professores
console.log('👨‍🏫 Criando professores...');
const professorMap = new Map();

for (const prof of horarioData.professores) {
  const userId = generateId('users');
  const professorId = generateId('professores');
  
  const email = `${prof.legenda.toLowerCase().replace(/\s/g, '')}@phd.com`;
  
  data.users.push({
    id: userId,
    name: prof.professor,
    email,
    password: '123456',
    role: 'professor',
    phone: null,
    is_active: true
  });

  data.professores.push({
    id: professorId,
    user_id: userId,
    disciplina: prof.disciplina,
    legenda: prof.legenda,
    cor_hex: prof.cor_hex,
    total_aulas: prof.total_aulas
  });

  professorMap.set(prof.legenda, professorId);
  console.log(`  ✓ ${prof.professor} (${prof.legenda}) - ${prof.disciplina}`);
}

// 2. Criar turmas
console.log('\n🏫 Criando turmas...');
const turmaMap = new Map();

for (const turma of horarioData.turmas) {
  const turmaId = generateId('turmas');
  
  data.turmas.push({
    id: turmaId,
    nome: turma.nome,
    periodo: turma.periodo,
    ano: horarioData.ano,
    is_active: true,
    created_at: new Date().toISOString()
  });

  turmaMap.set(turma.id, turmaId);
  console.log(`  ✓ ${turma.nome} (${turma.periodo})`);
}

// 3. Criar aulas
console.log('\n📚 Criando aulas...');
let aulasCount = 0;

for (const turma of horarioData.turmas) {
  const turmaId = turmaMap.get(turma.id);
  if (!turmaId) continue;

  for (const horario of turma.horarios) {
    for (const aula of horario.aulas) {
      const codigos = aula.codigos || [aula.codigo];
      
      for (const codigo of codigos) {
        const legendaBase = codigo.replace(/\s*\d+$/, '').trim();
        
        let professorId = null;
        for (const [legenda, id] of professorMap.entries()) {
          if (codigo.startsWith(legenda) || legendaBase === legenda) {
            professorId = id;
            break;
          }
        }

        const professor = professorId ? data.professores.find(p => p.id === professorId) : null;
        
        data.aulas.push({
          id: generateId('aulas'),
          turma_id: turmaId,
          professor_id: professorId,
          disciplina: professor?.disciplina || 'Não definida',
          codigo_aula: codigo,
          data_aula: aula.data,
          dia_semana: aula.dia_semana,
          periodo: aula.periodo,
          semana: horario.semana,
          status: 'agendada',
          observacoes: null,
          created_at: new Date().toISOString()
        });

        aulasCount++;
      }
    }
  }
}

console.log(`  ✓ ${aulasCount} aulas criadas`);

// Salvar dados
saveData(data);

// 4. Estatísticas finais
console.log('\n📊 Estatísticas da importação:');
console.log(`  👥 Usuários: ${data.users.length}`);
console.log(`  👨‍🏫 Professores: ${data.professores.length}`);
console.log(`  🏫 Turmas: ${data.turmas.length}`);
console.log(`  📚 Aulas: ${data.aulas.length}`);

console.log('\n✅ Importação concluída com sucesso!');
console.log('\n📝 Credenciais de acesso:');
console.log('  Admin: admin@phd.com / admin123');
console.log('  Professores: [legenda]@phd.com / 123456');
console.log('  Exemplo: port@phd.com / 123456\n');
