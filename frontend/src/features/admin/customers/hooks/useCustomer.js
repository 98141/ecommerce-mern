import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';

export function useCustomer(id) {
  return useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: () => customersApi.getById(id).then((res) => res.data.user),
    enabled: Boolean(id),
  });
}
