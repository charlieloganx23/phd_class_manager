import { loadData, saveData, generateId } from '../database/db-json.js';

class AulaModel {
  static getAll() {
    const data = loadData();
    return data.aulas.map(aula => {
      const turma = data.turmas.find(t => t.id === aula.turma_id);
      const professor = data.professores.find(p => p.id === aula.professor_id);
      const user = professor ? data.users.find(u => u.id === professor.user_id) : null;
      
      return {
        ...aula,
        turma_nome: turma?.nome,
        turma_periodo: turma?.periodo,
        disciplina: professor?.disciplina,
        professor_nome: user?.name
      };
    }).sort((a, b) => new Date(a.data_aula) - new Date(b.data_aula));
  }

  static getByTurma(turmaId) {
    const data = loadData();
    return data.aulas
      .filter(a => a.turma_id === parseInt(turmaId))
      .map(aula => {
        const professor = data.professores.find(p => p.id === aula.professor_id);
        const user = professor ? data.users.find(u => u.id === professor.user_id) : null;
        
        return {
          ...aula,
          disciplina: professor?.disciplina,
          professor_nome: user?.name
        };
      })
      .sort((a, b) => new Date(a.data_aula) - new Date(b.data_aula));
  }

  static getByProfessor(professorId) {
    const data = loadData();
    return data.aulas
      .filter(a => a.professor_id === parseInt(professorId))
      .map(aula => {
        const turma = data.turmas.find(t => t.id === aula.turma_id);
        return {
          ...aula,
          turma_nome: turma?.nome,
          turma_periodo: turma?.periodo
        };
      })
      .sort((a, b) => new Date(a.data_aula) - new Date(b.data_aula));
  }

  static getProximasAulas(limit = 10) {
    const data = loadData();
    const hoje = new Date().toISOString().split('T')[0];
    
    return data.aulas
      .filter(a => a.data_aula >= hoje)
      .map(aula => {
        const turma = data.turmas.find(t => t.id === aula.turma_id);
        const professor = data.professores.find(p => p.id === aula.professor_id);
        const user = professor ? data.users.find(u => u.id === professor.user_id) : null;
        
        return {
          ...aula,
          turma_nome: turma?.nome,
          disciplina: professor?.disciplina,
          professor_nome: user?.name
        };
      })
      .sort((a, b) => new Date(a.data_aula) - new Date(b.data_aula))
      .slice(0, limit);
  }

  static getById(id) {
    const data = loadData();
    const aula = data.aulas.find(a => a.id === parseInt(id));
    if (!aula) return null;
    
    const turma = data.turmas.find(t => t.id === aula.turma_id);
    const professor = data.professores.find(p => p.id === aula.professor_id);
    const user = professor ? data.users.find(u => u.id === professor.user_id) : null;
    
    return {
      ...aula,
      turma_nome: turma?.nome,
      disciplina: professor?.disciplina,
      professor_nome: user?.name
    };
  }

  static create(aula) {
    const data = loadData();
    const newAula = {
      id: generateId('aulas'),
      ...aula,
      status: aula.status || 'agendada',
      created_at: new Date().toISOString()
    };
    data.aulas.push(newAula);
    saveData(data);
    return newAula.id;
  }

  static update(id, aulaUpdate) {
    const data = loadData();
    const index = data.aulas.findIndex(a => a.id === parseInt(id));
    if (index === -1) return false;
    
    data.aulas[index] = { ...data.aulas[index], ...aulaUpdate };
    saveData(data);
    return true;
  }

  static updateStatus(id, status) {
    return this.update(id, { status });
  }

  static delete(id) {
    const data = loadData();
    data.aulas = data.aulas.filter(a => a.id !== parseInt(id));
    saveData(data);
    return true;
  }
}

export default AulaModel;
