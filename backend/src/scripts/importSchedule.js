import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Importando dados da planilha PHD 2026...\n');

// Ler o JSON gerado anteriormente
const jsonPath = join(__dirname, '../../../../horarios_phd_2026.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawData);

// Mapa para armazenar IDs criados
const professorMap = new Map();
const turmaMap = new Map();

// 1. Criar professores
console.log('👨‍🏫 Criando professores...');
for (const prof of data.professores) {
  try {
    // Criar usuário
    const userStmt = db.prepare(`
      INSERT INTO users (name, email, password, role, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const email = `${prof.legenda.toLowerCase().replace(/\s/g, '')}@phd.com`;
    const userResult = userStmt.run(
      prof.professor,
      email,
      '123456', // Senha padrão
      'professor',
      null,
      1
    );

    // Criar professor
    const profStmt = db.prepare(`
      INSERT INTO professores (user_id, disciplina, legenda, cor_hex, total_aulas)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const profResult = profStmt.run(
      userResult.lastInsertRowid,
      prof.disciplina,
      prof.legenda,
      prof.cor_hex,
      prof.total_aulas
    );

    professorMap.set(prof.legenda, profResult.lastInsertRowid);
    console.log(`  ✓ ${prof.professor} (${prof.legenda}) - ${prof.disciplina}`);
  } catch (error) {
    console.log(`  ⚠️  Professor ${prof.professor} já existe ou erro: ${error.message}`);
  }
}

// 2. Criar turmas
console.log('\n🏫 Criando turmas...');
for (const turma of data.turmas) {
  try {
    const stmt = db.prepare(`
      INSERT INTO turmas (nome, periodo, ano, is_active)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(turma.nome, turma.periodo, data.ano, 1);
    turmaMap.set(turma.id, result.lastInsertRowid);
    console.log(`  ✓ ${turma.nome} (${turma.periodo})`);
  } catch (error) {
    console.log(`  ⚠️  Turma ${turma.nome} já existe ou erro: ${error.message}`);
  }
}

// 3. Criar aulas
console.log('\n📚 Criando aulas...');
let aulasCount = 0;

for (const turma of data.turmas) {
  const turmaId = turmaMap.get(turma.id);
  if (!turmaId) continue;

  for (const horario of turma.horarios) {
    for (const aula of horario.aulas) {
      try {
        // Processar múltiplas disciplinas se houver
        const codigos = aula.codigos || [aula.codigo];
        
        for (const codigo of codigos) {
          // Extrair legenda base (remover números)
          const legendaBase = codigo.replace(/\s*\d+$/, '').trim();
          
          // Encontrar professor pela legenda
          let professorId = null;
          for (const [legenda, id] of professorMap.entries()) {
            if (codigo.startsWith(legenda) || legendaBase === legenda) {
              professorId = id;
              break;
            }
          }

          const stmt = db.prepare(`
            INSERT INTO aulas (turma_id, professor_id, disciplina, codigo_aula, data_aula, dia_semana, periodo, semana, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          // Buscar disciplina do professor
          let disciplina = 'Não definida';
          if (professorId) {
            const prof = db.prepare('SELECT disciplina FROM professores WHERE id = ?').get(professorId);
            if (prof) disciplina = prof.disciplina;
          }

          stmt.run(
            turmaId,
            professorId,
            disciplina,
            codigo,
            aula.data,
            aula.dia_semana,
            aula.periodo,
            horario.semana,
            'agendada'
          );

          aulasCount++;
        }
      } catch (error) {
        console.log(`  ⚠️  Erro ao criar aula: ${error.message}`);
      }
    }
  }
}

console.log(`  ✓ ${aulasCount} aulas criadas`);

// 4. Estatísticas finais
console.log('\n📊 Estatísticas da importação:');
const stats = {
  professores: db.prepare('SELECT COUNT(*) as count FROM professores').get().count,
  turmas: db.prepare('SELECT COUNT(*) as count FROM turmas').get().count,
  aulas: db.prepare('SELECT COUNT(*) as count FROM aulas').get().count,
  users: db.prepare('SELECT COUNT(*) as count FROM users').get().count
};

console.log(`  👥 Usuários: ${stats.users}`);
console.log(`  👨‍🏫 Professores: ${stats.professores}`);
console.log(`  🏫 Turmas: ${stats.turmas}`);
console.log(`  📚 Aulas: ${stats.aulas}`);

console.log('\n✅ Importação concluída com sucesso!');
console.log('\n📝 Credenciais de acesso:');
console.log('  Admin: admin@phd.com / admin123');
console.log('  Professores: [legenda]@phd.com / 123456');
console.log('  Exemplo: port@phd.com / 123456\n');

db.close();
