create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nombre text not null,
  email text,
  telefono text,
  identificacion text,
  direccion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clientes_empresa_id_idx on public.clientes (empresa_id);
create index if not exists clientes_empresa_nombre_idx on public.clientes (empresa_id, nombre);

alter table public.clientes enable row level security;

create policy "usuarios ven clientes de su empresa"
on public.clientes
for select
to authenticated
using (empresa_id = public.usuario_empresa_id());

create policy "usuarios crean clientes de su empresa"
on public.clientes
for insert
to authenticated
with check (empresa_id = public.usuario_empresa_id());

create policy "usuarios actualizan clientes de su empresa"
on public.clientes
for update
to authenticated
using (empresa_id = public.usuario_empresa_id())
with check (empresa_id = public.usuario_empresa_id());

create policy "usuarios eliminan clientes de su empresa"
on public.clientes
for delete
to authenticated
using (empresa_id = public.usuario_empresa_id());
