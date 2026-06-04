# CotizaPro SaaS

Backend primero para el SaaS multi-tenant de cotizaciones.

## Estado actual

Esta fase incluye solo backend:

- Node.js + Express.
- Conexion con Supabase.
- Migracion inicial para `empresas` y `perfiles`.
- Registro de usuario y empresa.
- Login.
- Endpoint protegido `/api/me`.
- Datos fiscales de empresa.
- CRUD de clientes por empresa.
- CRUD de cotizaciones e items por empresa.
- PDF de cotizacion generado desde backend.
- Coleccion Postman para pruebas con datos reales.
- Health check `/api/health`.

El frontend se construira despues, cuando se indique.

## Configuracion

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend local:

```bash
http://localhost:4000
```

## Variables

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=4000
CLIENT_URL=http://localhost:5173
```

## Base de datos

Ejecuta en Supabase:

```bash
backend/supabase/migrations/001_empresas_perfiles.sql
backend/supabase/migrations/002_clientes.sql
backend/supabase/migrations/003_cotizaciones.sql
backend/supabase/migrations/004_empresa_datos_fiscales.sql
```

## Pruebas con Postman

Importa:

```bash
backend/postman/CotizaPro Backend.postman_collection.json
```

Sigue el orden recomendado en `backend/postman/README.md`.

## Endpoints iniciales

```bash
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/me
GET  /api/empresa
PUT  /api/empresa
GET  /api/clientes
POST /api/clientes
PUT  /api/clientes/:id
DEL  /api/clientes/:id
GET  /api/cotizaciones
GET  /api/cotizaciones/:id
POST /api/cotizaciones
PUT  /api/cotizaciones/:id
PATCH /api/cotizaciones/:id/estado
GET  /api/cotizaciones/:id/pdf
DEL  /api/cotizaciones/:id
```
