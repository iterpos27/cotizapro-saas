create extension if not exists pgcrypto;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nombre text not null,
  rol text not null default 'admin' check (rol in ('admin', 'usuario')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.empresas enable row level security;
alter table public.perfiles enable row level security;

create or replace function public.usuario_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id from public.perfiles where id = auth.uid()
$$;

create policy "usuarios ven su empresa"
on public.empresas
for select
to authenticated
using (id = public.usuario_empresa_id());

create policy "usuarios actualizan su empresa"
on public.empresas
for update
to authenticated
using (id = public.usuario_empresa_id())
with check (id = public.usuario_empresa_id());

create policy "usuarios ven perfiles de su empresa"
on public.perfiles
for select
to authenticated
using (empresa_id = public.usuario_empresa_id());

create policy "usuarios actualizan su perfil"
on public.perfiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and empresa_id = public.usuario_empresa_id());

create or replace function public.crear_empresa_y_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nueva_empresa_id uuid;
begin
  insert into public.empresas (nombre)
  values (coalesce(new.raw_user_meta_data ->> 'company_name', 'Mi empresa'))
  returning id into nueva_empresa_id;

  insert into public.perfiles (id, empresa_id, nombre, rol)
  values (
    new.id,
    nueva_empresa_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'admin'
  );

  return new;
end;
$$;

drop trigger if exists crear_empresa_y_perfil_on_auth_user on auth.users;

create trigger crear_empresa_y_perfil_on_auth_user
after insert on auth.users
for each row execute function public.crear_empresa_y_perfil();
