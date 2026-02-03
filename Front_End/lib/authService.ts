import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Service d'authentification
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/users/login/', { username, password });
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/users/logout/');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/current_user/');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

// Service utilisateurs
export const userService = {
  getAll: () => api.get('/users/'),
  getById: (id: number) => api.get(`/users/${id}/`),
  create: (data: any) => api.post('/users/', data),
  update: (id: number, data: any) => api.put(`/users/${id}/`, data),
  delete: (id: number) => api.delete(`/users/${id}/`),
};

// Service employés
export const employeeService = {
  getAll: () => api.get('/employees/'),
  getById: (id: number) => api.get(`/employees/${id}/`),
  create: (data: any) => api.post('/employees/', data),
  update: (id: number, data: any) => api.put(`/employees/${id}/`, data),
  delete: (id: number) => api.delete(`/employees/${id}/`),
};

export default api;