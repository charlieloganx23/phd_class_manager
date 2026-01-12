import api from './api';

// Re-export auth types
export type { User, LoginData, LoginResponse } from './auth.service';
export { authService } from './auth.service';

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export const turmasService = {
  async getAll() {
    const response = await api.get('/turmas');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/turmas/${id}`);
    return response.data;
  },

  async getAlunos(id: number) {
    const response = await api.get(`/turmas/${id}/alunos`);
    return response.data;
  },
};

export const aulasService = {
  async getAll(params?: any) {
    const response = await api.get('/aulas', { params });
    return response.data;
  },

  async getProximas(limit = 10) {
    const response = await api.get(`/aulas/proximas?limit=${limit}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/aulas/${id}`);
    return response.data;
  },

  async updateStatus(id: number, status: string) {
    const response = await api.patch(`/aulas/${id}/status`, { status });
    return response.data;
  },
};

export const professoresService = {
  async getAll() {
    const response = await api.get('/professores');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/professores/${id}`);
    return response.data;
  },

  async getAulas(id: number, params?: any) {
    const response = await api.get(`/professores/${id}/aulas`, { params });
    return response.data;
  },
};

export const notificacoesService = {
  async getAll(params?: any) {
    const response = await api.get('/notificacoes', { params });
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/notificacoes', data);
    return response.data;
  },

  async enviar(id: number) {
    const response = await api.post(`/notificacoes/${id}/enviar`);
    return response.data;
  },

  async send(data: any) {
    const response = await api.post('/notificacoes/enviar', data);
    return response.data;
  },
};

// Aliases for convenience
export const classService = aulasService;
export const teacherService = professoresService;
export const notificationService = notificacoesService;

