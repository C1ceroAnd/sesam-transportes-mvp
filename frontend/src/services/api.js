import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (login, senha) => api.post('/auth/login', { login, senha }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const pacientes = {
  listar: (q) => api.get('/pacientes', { params: q ? { q } : {} }),
  buscar: (id) => api.get(`/pacientes/${id}`),
  criar: (data) => api.post('/pacientes', data),
  atualizar: (id, data) => api.put(`/pacientes/${id}`, data),
  salvarAcompanhante: (id, data) => api.put(`/pacientes/${id}/acompanhante`, data),
  removerAcompanhante: (id) => api.delete(`/pacientes/${id}/acompanhante`),
  relatorio: (id) => api.get(`/pacientes/${id}/relatorio`, { responseType: 'blob' }),
};

export const motoristas = {
  listar: () => api.get('/motoristas'),
};

export const viagens = {
  listar: (data) => api.get('/viagens', { params: data ? { data } : {} }),
  buscar: (id) => api.get(`/viagens/${id}`),
  criar: (data) => api.post('/viagens', data),
  atualizar: (id, data) => api.put(`/viagens/${id}`, data),
};

export const agendamentos = {
  criar: (viagemId, data) => api.post(`/viagens/${viagemId}/agendamentos`, data),
  cancelar: (id) => api.delete(`/agendamentos/${id}`),
  marcarPresenca: (id, status) => api.patch(`/agendamentos/${id}/presenca`, { status }),
  marcarRetorno: (id, status) => api.patch(`/agendamentos/${id}/retorno`, { status }),
};

export default api;
