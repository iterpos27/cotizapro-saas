alter table public.empresas
add column if not exists ruc text,
add column if not exists razon_social text,
add column if not exists direccion text,
add column if not exists telefono text,
add column if not exists email text;

create index if not exists empresas_ruc_idx on public.empresas (ruc);
