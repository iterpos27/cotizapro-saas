# CotizaPro SaaS

SaaS multi-tenant para cotizaciones usando React, Vite, Node.js, Express y Supabase.

## Fase actual

Esta base cubre:

- Frontend React rapido con Vite.
- Backend Node.js + Express.
- Registro, login y logout con Supabase Auth.
- Creacion automatica de empresa y perfil mediante trigger SQL.
- Dashboard protegido con datos del usuario, perfil y empresa.
- API Express protegida por token en `/api/me`.
- Migracion inicial para `empresas` y `perfiles`.

## Configuracion local

1. Instala dependencias:

```bash
npm install
```

2. Copia `.env.example` a `.env.local` y coloca tus credenciales:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=4000
```

3. Ejecuta en Supabase el SQL de:

```bash
supabase/migrations/001_empresas_perfiles.sql
```

4. Inicia frontend y backend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:4000`

## Supabase Auth

Si aparece `Email not confirmed`, tienes dos opciones:

- Confirmar el correo del usuario.
- Para pruebas, ir a Supabase: `Authentication > Sign In / Providers > Email` y desactivar `Confirm email`.

## Regla multi-tenant

Toda tabla de negocio debe tener `empresa_id`.

Toda consulta de negocio debe filtrar por la empresa del usuario:

```sql
where empresa_id = public.usuario_empresa_id()
```

No se avanzara a clientes o cotizaciones hasta probar registro, login y dashboard protegido.
