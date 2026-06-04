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
```

## Endpoints iniciales

```bash
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/me
```
