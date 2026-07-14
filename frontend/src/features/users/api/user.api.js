import { api } from '../../../services/api';

export const userApi = {
  getMe: () => api.get('/users/me').then((res) => res.data),
  updateMe: (payload) => api.patch('/users/me', payload).then((res) => res.data),
  changePassword: (payload) => api.patch('/users/me/password', payload).then((res) => res.data),
};
