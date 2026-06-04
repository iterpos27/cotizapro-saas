# CotizaPro SaaS

SaaS multi-tenant para cotizaciones usando Next.js, Tailwind, shadcn/ui y Supabase.

## Fase actual

Esta base cubre:

- Proyecto Next.js con Tailwind 4.
- Estructura compatible con shadcn/ui.
- Cliente Supabase para servidor, navegador y middleware.
- Registro de usuario con nombre de empresa.
- Login, logout y dashboard protegido.
- Migración inicial para `empresas` y `perfiles`.

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Copia `.env.example` a `.env.local` y coloca tus credenciales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. Ejecuta en Supabase el SQL de `supabase/migrations/001_empresas_perfiles.sql`.

4. Inicia el proyecto:

```bash
npm run dev
```

## Regla multi-tenant

Toda tabla de negocio debe tener `empresa_id`.

Toda consulta de negocio debe filtrar por la empresa del usuario:

```sql
where empresa_id = public.usuario_empresa_id()
```

No se avanzara a clientes o cotizaciones hasta probar registro, login y dashboard protegido.
