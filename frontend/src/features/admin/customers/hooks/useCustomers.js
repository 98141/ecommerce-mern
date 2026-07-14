import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';

export function useCustomers(filters) {
  return useQuery({
    queryKey: ['admin', 'customers', filters],
    queryFn: () => customersApi.list(filters).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}
