import db from '../database/connection.js';

class ProfessorModel {
  static getAll() {
    return db.prepare(`
      SELECT p.*, u.name, u.email, u.phone, u.is_active
      FROM professores p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.name ASC
    `).all();
  }

  static getById(id) {
    return db.prepare(`
      SELECT p.*, u.name, u.email, u.phone, u.is_active
      FROM professores p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id);
  }

  static getByUserId(userId) {
    return db.prepare(`
      SELECT p.*, u.name, u.email, u.phone, u.is_active
      FROM professores p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `).get(userId);
  }

  static create(professor) {
    const stmt = db.prepare(`
      INSERT INTO professores (user_id, disciplina, legenda, cor_hex, total_aulas)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      professor.user_id,
      professor.disciplina,
      professor.legenda,
      professor.cor_hex || '#000000',
      professor.total_aulas || 0
    );
    return result.lastInsertRowid;
  }

  static update(id, professor) {
    const stmt = db.prepare(`
      UPDATE professores 
      SET disciplina = ?, legenda = ?, cor_hex = ?, total_aulas = ?
      WHERE id = ?
    `);
    return stmt.run(
      professor.disciplina,
      professor.legenda,
      professor.cor_hex,
      professor.total_aulas,
      id
    );
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM professores WHERE id = ?');
    return stmt.run(id);
  }

  static getAulasByProfessor(professorId, dataInicio = null, dataFim = null) {
    let query = `
      SELECT a.*, t.nome as turma_nome, t.periodo
      FROM aulas a
      JOIN turmas t ON a.turma_id = t.id
      WHERE a.professor_id = ?
    `;
    const params = [professorId];

    if (dataInicio) {
      query += ' AND a.data_aula >= ?';
      params.push(dataInicio);
    }

    if (dataFim) {
      query += ' AND a.data_aula <= ?';
      params.push(dataFim);
    }

    query += ' ORDER BY a.data_aula ASC';

    return db.prepare(query).all(...params);
  }
}

export default ProfessorModel;
