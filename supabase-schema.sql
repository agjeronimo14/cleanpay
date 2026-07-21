-- ==========================================
-- SCRIPT DE MIGRACIÓN INICIAL PARA SUPABASE
-- PROYECTO: CLEANPAY (GESTIÓN DE PAGOS Y SERVICIOS DE LIMPIEZA)
-- ==========================================

-- Habilitar extensión para UUIDs automáticos
create extension if not exists "uuid-ossp";

-- 1. TABLA: EMPRESAS
create table empresas (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  direccion text,
  telefono text,
  correo text not null unique,
  responsable_id uuid, -- Se enlazará con usuarios.id posteriormente
  estado text not null default 'ACTIVO' check (estado in ('ACTIVO', 'SUSPENDIDO')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABLA: USUARIOS (Sincronizado con Supabase Auth si es necesario)
create table usuarios (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('SUPER_ADMIN', 'JEFE', 'TRABAJADOR')),
  empresa_id uuid references empresas(id) on delete set null,
  telefono text,
  avatar_url text,
  estado text not null default 'ACTIVO' check (estado in ('ACTIVO', 'SUSPENDIDO')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Añadir llave foránea circular de responsable_id de empresas hacia usuarios.id
alter table empresas add constraint fk_empresas_responsable foreign key (responsable_id) references usuarios(id) on delete set null;

-- 3. TABLA: SERVICIOS
create table servicios (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cliente text not null,
  direccion text not null,
  frecuencia text not null check (frecuencia in ('SEMANAL', 'QUINCENAL', 'MENSUAL', 'PERSONALIZADO')),
  dias_trabajo text[] not null, -- Array de días (Ej: {'Lunes', 'Miércoles'})
  monto numeric(10, 2) not null,
  fecha_asignacion date not null default current_date,
  fecha_finalizacion date,
  trabajador_id uuid not null references usuarios(id) on delete restrict,
  empresa_id uuid not null references empresas(id) on delete cascade,
  estado text not null default 'ACTIVO' check (estado in ('ACTIVO', 'PAUSADO', 'PENDIENTE_CAMBIO', 'FINALIZADO')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA: HISTORIAL_SERVICIOS (Eventos de servicio)
create table historial_servicios (
  id uuid primary key default uuid_generate_v4(),
  servicio_id uuid not null references servicios(id) on delete cascade,
  tipo text not null check (tipo in ('ASIGNACION', 'CAMBIO_TRABAJADOR', 'CAMBIO_PAGO', 'CAMBIO_FRECUENCIA', 'QUEJA', 'FECHA_TENTATIVA_SALIDA', 'CONTINUA_ACTIVO', 'FINALIZACION')),
  fecha timestamp with time zone default timezone('utc'::text, now()) not null,
  descripcion text not null,
  registrado_por uuid not null references usuarios(id)
);

-- 5. TABLA: PAGOS
create table pagos (
  id uuid primary key default uuid_generate_v4(),
  servicio_id uuid references servicios(id) on delete set null,
  trabajador_id uuid not null references usuarios(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  monto numeric(10, 2) not null,
  fecha date not null default current_date,
  hora time not null default current_time,
  metodo text not null check (metodo in ('EFECTIVO', 'TRANSFERENCIA', 'ZELLE', 'OTRO')),
  tipo text not null check (tipo in ('COMPLETO', 'PARCIAL', 'ADELANTO', 'EXTRAORDINARIO')),
  notas text,
  registrado_por uuid not null references usuarios(id),
  estado_confirmacion text not null default 'CONFIRMADO' check (estado_confirmacion in ('PENDIENTE_JEFE', 'CONFIRMADO')),
  comprobante_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TABLA: AJUSTES
create table ajustes (
  id uuid primary key default uuid_generate_v4(),
  trabajador_id uuid not null references usuarios(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  servicio_id uuid references servicios(id) on delete set null,
  tipo text not null check (tipo in ('TRABAJO_EXTRA', 'LIMPIEZA_PROFUNDA', 'BONIFICACION', 'DESCUENTO', 'SEMANA_NO_TRABAJADA', 'SUSPENSION_TEMPORAL')),
  monto numeric(10, 2) not null, -- Positivo para bonos/extras, Negativo para descuentos
  fecha date not null default current_date,
  notas text not null,
  registrado_por uuid not null references usuarios(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TABLA: DATOS_MIGRACION
create table datos_migracion (
  id uuid primary key default uuid_generate_v4(),
  trabajador_id uuid not null unique references usuarios(id) on delete cascade,
  saldo_pendiente_inicial numeric(10, 2) not null default 0,
  fecha_corte_inicial date not null default current_date,
  notas text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Activar RLS en todas las tablas para seguridad multi-empresa
alter table empresas enable row level security;
alter table usuarios enable row level security;
alter table servicios enable row level security;
alter table historial_servicios enable row level security;
alter table pagos enable row level security;
alter table ajustes enable row level security;
alter table datos_migracion enable row level security;

-- ==========================================
-- FUNCIONES DE SEGURIDAD (SECURITY DEFINER)
-- Evitan la recursión infinita en las políticas RLS al consultar la misma tabla
-- ==========================================

create or replace function public.get_user_role(usr_id uuid)
returns text as $$
  select role from public.usuarios where id = usr_id;
$$ language sql security definer;

create or replace function public.get_user_empresa(usr_id uuid)
returns uuid as $$
  select empresa_id from public.usuarios where id = usr_id;
$$ language sql security definer;

-- 1. Políticas de Seguridad para la tabla 'empresas'
create policy "Super Admin completo" on empresas for all using (
  public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

create policy "Jefes ven su propia empresa" on empresas for select using (
  public.get_user_role(auth.uid()) = 'JEFE' and public.get_user_empresa(auth.uid()) = empresas.id
);

create policy "Trabajadores ven su propia empresa" on empresas for select using (
  public.get_user_role(auth.uid()) = 'TRABAJADOR' and public.get_user_empresa(auth.uid()) = empresas.id
);

-- 2. Políticas de Seguridad para la tabla 'usuarios'
create policy "Super Admin usuarios completo" on usuarios for all using (
  public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

create policy "Jefes ven/editan usuarios de su misma empresa" on usuarios for all using (
  public.get_user_role(auth.uid()) = 'JEFE' and public.get_user_empresa(auth.uid()) = usuarios.empresa_id
);

create policy "Trabajadores ven su propio usuario" on usuarios for select using (
  id = auth.uid()
);

-- 3. Políticas de Seguridad para la tabla 'servicios'
create policy "Jefe servicios completo" on servicios for all using (
  public.get_user_role(auth.uid()) = 'JEFE' and public.get_user_empresa(auth.uid()) = servicios.empresa_id
);

create policy "Trabajador ve sus servicios asignados" on servicios for select using (
  trabajador_id = auth.uid()
);

-- 4. Políticas de Seguridad para la tabla 'pagos'
create policy "Jefe pagos completo" on pagos for all using (
  public.get_user_role(auth.uid()) = 'JEFE' and public.get_user_empresa(auth.uid()) = pagos.empresa_id
);

create policy "Trabajador ve sus pagos" on pagos for select using (
  trabajador_id = auth.uid()
);

create policy "Trabajador registra sus propios pagos" on pagos for insert with check (
  trabajador_id = auth.uid()
);

-- 5. Políticas de Seguridad para la tabla 'ajustes'
create policy "Jefe ajustes completo" on ajustes for all using (
  public.get_user_role(auth.uid()) = 'JEFE' and public.get_user_empresa(auth.uid()) = ajustes.empresa_id
);

create policy "Trabajador ve sus ajustes" on ajustes for select using (
  trabajador_id = auth.uid()
);
