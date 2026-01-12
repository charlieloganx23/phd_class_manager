import db from '../database/connection.js';

class TurmaModel {
  static getAll() {
    return db.prepare(`
      SELECT t.*, 
             COUNT(DISTINCT a.id) as total_alunos
      FROM turmas t
      LEFT JOIN alunos a ON t.id = a.turma_id
      GROUP BY t.id
      ORDER BY t.nome ASC
    `).all();
  }

  static getById(id) {
    return db.prepare(`
      SELECT t.*, 
             COUNT(DISTINCT a.id) as total_alunos
      FROM turmas t
      LEFT JOIN alunos a ON t.id = a.turma_id
      WHERE t.id = ?
      GROUP BY t.id
    `).get(id);
  }

  static create(turma) {
    const stmt = db.prepare(`
      INSERT INTO turmas (nome, periodo, ano, is_active)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(turma.nome, turma.periodo, turma.ano, turma.is_active ?? 1);
    return result.lastInsertRowid;
  }

  static update(id, turma) {
    const stmt = db.prepare(`
      UPDATE turmas 
      SET nome = ?, periodo = ?, ano = ?, is_active = ?
      WHERE id = ?
    `);
    return stmt.run(turma.nome, turma.periodo, turma.ano, turma.is_active, id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM turmas WHERE id = ?');
    return stmt.run(id);
  }

  static getAlunosByTurma(turmaId) {
    return db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, a.whatsapp
      FROM alunos a
      JOIN users u ON a.user_id = u.id
      WHERE a.turma_id = ? AND u.is_active = 1
    `).all(turmaId);
  }
}

export default TurmaModel;
