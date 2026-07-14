# ecommerce-mern

Ecommerce sobre stack MERN (MongoDB, Express, React, Node.js), desarrollado por sprints incrementales.

## Estructura

```text
backend/    API REST (Express 5, Mongoose, CommonJS)
frontend/   SPA (React 19, Vite, Zustand, React Query)
docs/       Documentación funcional y técnica obligatoria
```

## Documentación obligatoria

Antes de modificar código, leer:

- [AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md)
- [docs/01-product-scope.md](docs/01-product-scope.md)
- [docs/02-business-rules.md](docs/02-business-rules.md)
- [docs/03-data-model.md](docs/03-data-model.md)
- [docs/04-api-conventions.md](docs/04-api-conventions.md)
- [docs/05-security.md](docs/05-security.md)
- [docs/07-error-catalog.md](docs/07-error-catalog.md)
- [docs/08-status-catalog.md](docs/08-status-catalog.md)

## Backend

```bash
cd backend
cp .env.example .env   # completar valores
npm install
npm run seed:admin      # crea el administrador inicial (idempotente)
npm run dev
```

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Sprints

- **Sprint 0**: estructura base de carpetas (sin lógica).
- **Sprint 1**: autenticación, usuarios, sesiones y control de acceso por roles. Ver reporte de entregables en el historial de conversación / PR correspondiente.
