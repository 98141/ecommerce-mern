import { api } from '../../../../services/api';

export const customersApi = {
  list: (params) => api.get('/admin/customers', { params }).then((res) => res.data),
  getById: (id) => api.get(`/admin/customers/${id}`).then((res) => res.data),
  updateStatus: (id, payload) => api.patch(`/admin/customers/${id}/status`, payload).then((res) => res.data),
};
