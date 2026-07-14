import { api } from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  logoutAll: () => api.post('/auth/logout-all').then((res) => res.data),
  refresh: () => api.post('/auth/refresh').then((res) => res.data),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload).then((res) => res.data),
  resendVerification: (payload) => api.post('/auth/resend-verification', payload).then((res) => res.data),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((res) => res.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((res) => res.data),
};
