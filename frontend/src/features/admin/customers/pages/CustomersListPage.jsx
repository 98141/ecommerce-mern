import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerFilters } from '../components/CustomerFilters';
import { CustomersTable } from '../components/CustomersTable';

const DEFAULT_FILTERS = { page: 1, limit: 20, search: '', status: '' };

export function CustomersListPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { data, isLoading, isError } = useCustomers(filters);

  const handleFilterSubmit = (values) => {
    setFilters((current) => ({ ...current, ...values, page: 1 }));
  };

  const goToPage = (page) => setFilters((current) => ({ ...current, page }));

  return (
    <div className="page">
      <h1>Clientes</h1>
      <CustomerFilters initialValues={filters} onSubmit={handleFilterSubmit} />

      {isLoading && <p>Cargando clientes...</p>}
      {isError && <p className="form-error">No se pudieron cargar los clientes.</p>}

      {data && (
        <>
          <CustomersTable items={data.items} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              className="btn-link"
              type="button"
              disabled={data.pagination.page <= 1}
              onClick={() => goToPage(data.pagination.page - 1)}
            >
              Anterior
            </button>
            <span className="muted">
              Página {data.pagination.page} de {data.pagination.totalPages || 1}
            </span>
            <button
              className="btn-link"
              type="button"
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => goToPage(data.pagination.page + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
