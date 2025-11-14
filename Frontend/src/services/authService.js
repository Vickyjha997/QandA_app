import api from './api';

export const authService = {
  registerStudent: async (data) => {
    const response = await api.post('/auth/student/register', data);
    return response.data;
  },
  loginStudent: async (credentials) => {
    const response = await api.post('/auth/student/login', credentials);
    return response.data;
  },
  registerTutor: async (data) => {
    const response = await api.post('/auth/tutor/register', data);
    return response.data;
  },
  loginTutor: async (credentials) => {
    const response = await api.post('/auth/tutor/login', credentials);
    return response.data;
  },
  googleLogin: async (token, role) => {
    const response = await api.post('/auth/google-login', { token, role });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
