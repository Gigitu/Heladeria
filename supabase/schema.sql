-- =====================================================================

drop view if exists public.v_rentabilidad_producto;
drop view if exists public.v_costo_producto;
drop view if exists public.v_calorias_producto;
drop function if exists public.vender_producto(bigint, integer, bigint);
drop function if exists public.reabastecer_ingrediente(bigint, integer);
drop table if exists public.ventas cascade;
drop table if exists public.producto_ingrediente cascade;
drop table if exists public.productos cascade;
drop table if exists public.ingredientes cascade;
drop table if exists public.users cascade;

-- ---------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------
create table public.users (
  id bigserial primary key,
  nombre text not null,
  correo text unique not null,
  password text not null,
  rol text check (rol in ('admin', 'empleado', 'cliente')) not null default 'cliente'
);

create table public.ingredientes (
  id bigserial primary key,
  nombre text not null,
  precio numeric(10,2) not null,
  calorias integer not null,
  inventario integer not null default 0,
  es_vegetariano boolean not null default false,
  es_sano boolean not null default true,
  tipo text check (tipo in ('base', 'complemento')) not null,
  sabor text
);

create table public.productos (
  id bigserial primary key,
  nombre text not null,
  precio_publico numeric(10,2) not null,
  tipo text check (tipo in ('copa', 'malteada')) not null,
  vaso text,
  volumen_onzas integer
);

create table public.producto_ingrediente (
  id bigserial primary key,
  producto_id bigint not null references public.productos(id) on delete cascade,
  ingrediente_id bigint not null references public.ingredientes(id) on delete cascade
);

create table public.ventas (
  id bigserial primary key,
  producto_id bigint not null references public.productos(id),
  user_id bigint references public.users(id),          -- CORREGIDO (antes uuid)
  fecha timestamp with time zone default now(),
  cantidad integer not null default 1,
  total numeric(10,2) not null
);

-- ---------------------------------------------------------------------
-- Vistas (calorías, costo y rentabilidad por producto)
-- ---------------------------------------------------------------------
create view public.v_calorias_producto as
select p.id as producto_id, p.nombre, sum(i.calorias) as total_calorias
from public.productos p
join public.producto_ingrediente pi on p.id = pi.producto_id
join public.ingredientes i on pi.ingrediente_id = i.id
group by p.id, p.nombre;

create view public.v_costo_producto as
select p.id as producto_id, p.nombre, sum(i.precio) as costo
from public.productos p
join public.producto_ingrediente pi on p.id = pi.producto_id
join public.ingredientes i on pi.ingrediente_id = i.id
group by p.id, p.nombre;

create view public.v_rentabilidad_producto as
select p.id as producto_id, p.nombre, p.precio_publico, c.costo,
       (p.precio_publico - c.costo) as rentabilidad
from public.productos p
join public.v_costo_producto c on p.id = c.producto_id;

-- ---------------------------------------------------------------------
-- Funciones (se llaman desde la API REST en /rest/v1/rpc/...)
-- ---------------------------------------------------------------------

-- Vende un producto: revisa inventario, lo descuenta y registra la venta.
-- Todo pasa en una sola transacción: o se hace completo o no se hace nada.
create or replace function public.vender_producto(
  p_producto_id bigint,
  p_cantidad integer default 1,
  p_user_id bigint default null
) returns public.ventas
language plpgsql
as $$
declare
  v_precio numeric;
  v_faltantes text;
  v_venta public.ventas;
begin
  if p_cantidad is null or p_cantidad < 1 then
    raise exception 'La cantidad debe ser mayor a 0';
  end if;

  select precio_publico into v_precio from public.productos where id = p_producto_id;
  if not found then
    raise exception 'El producto % no existe', p_producto_id;
  end if;

  if not exists (select 1 from public.producto_ingrediente where producto_id = p_producto_id) then
    raise exception 'El producto no tiene ingredientes asignados';
  end if;

  -- Bloquea los ingredientes para que dos ventas al tiempo no descuadren el inventario
  perform 1
  from public.ingredientes i
  join public.producto_ingrediente pi on pi.ingrediente_id = i.id
  where pi.producto_id = p_producto_id
  for update of i;

  -- ¿Qué ingredientes no alcanzan?
  select string_agg(x.nombre, ', ') into v_faltantes
  from (
    select i.nombre, i.inventario, count(*) as usos
    from public.producto_ingrediente pi
    join public.ingredientes i on i.id = pi.ingrediente_id
    where pi.producto_id = p_producto_id
    group by i.id, i.nombre, i.inventario
  ) x
  where x.inventario < x.usos * p_cantidad;

  if v_faltantes is not null then
    raise exception 'No hay inventario suficiente de: %', v_faltantes;
  end if;

  -- Descuenta el inventario
  update public.ingredientes i
  set inventario = i.inventario - x.usos * p_cantidad
  from (
    select ingrediente_id, count(*) as usos
    from public.producto_ingrediente
    where producto_id = p_producto_id
    group by ingrediente_id
  ) x
  where i.id = x.ingrediente_id;

  -- Registra la venta
  insert into public.ventas (producto_id, user_id, cantidad, total)
  values (p_producto_id, p_user_id, p_cantidad, v_precio * p_cantidad)
  returning * into v_venta;

  return v_venta;
end;
$$;

-- Reabastece (suma unidades al inventario) de un ingrediente
create or replace function public.reabastecer_ingrediente(
  p_ingrediente_id bigint,
  p_cantidad integer
) returns public.ingredientes
language plpgsql
as $$
declare
  v_ing public.ingredientes;
begin
  if p_cantidad is null or p_cantidad < 1 then
    raise exception 'La cantidad debe ser mayor a 0';
  end if;

  update public.ingredientes
  set inventario = inventario + p_cantidad
  where id = p_ingrediente_id
  returning * into v_ing;

  if not found then
    raise exception 'El ingrediente % no existe', p_ingrediente_id;
  end if;

  return v_ing;
end;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el taller usa su propia tabla de usuarios y roles,
-- así que la API se consume con la llave pública (anon) sin RLS.
-- ---------------------------------------------------------------------
alter table public.users disable row level security;
alter table public.ingredientes disable row level security;
alter table public.productos disable row level security;
alter table public.producto_ingrediente disable row level security;
alter table public.ventas disable row level security;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- Los proyectos nuevos de Supabase pueden activar RLS solos. Con RLS activo y sin
-- reglas, la API devuelve listas vacías. Estas reglas dejan pasar a la app siempre.
do $$
declare t text;
begin
  foreach t in array array['users', 'ingredientes', 'productos', 'producto_ingrediente', 'ventas'] loop
    execute format('drop policy if exists acceso_app on public.%I', t);
    execute format('create policy acceso_app on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Datos iniciales
-- ---------------------------------------------------------------------
insert into public.ingredientes
  (nombre, precio, calorias, inventario, es_vegetariano, es_sano, tipo, sabor)
values
  ('Vainilla', 1000, 150, 50, true, true, 'base', 'vainilla'),
  ('Fresa', 1200, 100, 40, true, true, 'base', 'fresa'),
  ('Chocolate', 1500, 200, 30, true, true, 'base', 'chocolate'),
  ('Chispas de Chocolate', 500, 50, 25, true, false, 'complemento', null),
  ('Crema Batida', 300, 70, 20, true, false, 'complemento', null),
  ('Sirope de Fresa', 400, 60, 15, true, false, 'complemento', null),
  ('Oreo', 800, 110, 25, true, false, 'complemento', null);

insert into public.productos (nombre, precio_publico, tipo, vaso, volumen_onzas)
values
  ('Copa Vainilla Deluxe', 5000, 'copa', 'mediano', null),
  ('Copa ChocoFresa', 6000, 'copa', 'grande', null),
  ('Malteada de Fresa', 7000, 'malteada', null, 16),
  ('Malteada Oreo', 7500, 'malteada', null, 20);

insert into public.producto_ingrediente (producto_id, ingrediente_id)
values
  (1, 1), (1, 5), (1, 4),
  (2, 3), (2, 2), (2, 6),
  (3, 2), (3, 1), (3, 5),
  (4, 3), (4, 7), (4, 5);

insert into public.ventas (producto_id, cantidad, total)
values
  (1, 2, 10000),
  (2, 1, 6000),
  (3, 3, 21000),
  (4, 1, 7500);

-- CORREGIDO: la columna es "password" (el script original decía "contra")
insert into public.users (nombre, correo, password, rol)
values
  ('admin', 'admin@admin.co', 'admin', 'admin'),
  ('empleado', 'empleado@empleado.co', 'empleado', 'empleado'),
  ('cliente', 'cliente@cliente.co', 'cliente', 'cliente');
