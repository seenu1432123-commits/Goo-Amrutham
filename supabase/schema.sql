-- Goo Amrutham Milk - Supabase production starter schema
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  unit text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  badge text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.products (id,name,unit,price,badge,description) values
('raw-cow-1l','Fresh Raw Cow Milk','1 Litre',80,'Best Seller','Fresh milk for your family''s everyday routine.'),
('raw-cow-500','Fresh Raw Cow Milk','500 ml',40,'Popular','A convenient half-litre option for smaller households.'),
('raw-cow-2l','Fresh Raw Cow Milk','2 Litres',160,'Family Pack','A practical family-size quantity for regular delivery.')
on conflict (id) do update set name=excluded.name,unit=excluded.unit,price=excluded.price,badge=excluded.badge,description=excluded.description;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  email text,
  address text not null default '',
  city text not null default '',
  pincode text not null default '',
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  address text not null,
  city text not null,
  pincode text not null,
  instructions text not null default '',
  slot text not null check (slot in ('Morning','Evening')),
  frequency text not null check (frequency in ('One Time','Daily','Alternate Days','Weekly')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null check (delivery_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'Order Placed' check (status in ('Order Placed','Confirmed','Preparing','Out for Delivery','Delivered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  name text not null,
  unit text not null,
  unit_price numeric(10,2) not null,
  qty integer not null check (qty > 0 and qty <= 100),
  line_total numeric(10,2) not null
);

create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null check (status in ('Order Placed','Confirmed','Preparing','Out for Delivery','Delivered')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id,name,phone,email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name',''),
    coalesce(new.raw_user_meta_data->>'phone',''),
    new.email
  )
  on conflict (id) do update set email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- Secure order creation: prices and totals are calculated server-side.
create or replace function public.create_order(
  p_items jsonb,
  p_customer jsonb,
  p_slot text,
  p_frequency text,
  p_instructions text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid := gen_random_uuid();
  v_order_number text := 'GAM-' || to_char(now(),'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  v_subtotal numeric(10,2) := 0;
  v_delivery numeric(10,2);
  item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
begin
  if v_user is null then raise exception 'You must be signed in.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty.'; end if;
  if p_slot not in ('Morning','Evening') then raise exception 'Invalid delivery slot.'; end if;
  if p_frequency not in ('One Time','Daily','Alternate Days','Weekly') then raise exception 'Invalid frequency.'; end if;

  for item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = item->>'product_id' and active = true;
    if not found then raise exception 'A selected product is unavailable.'; end if;
    v_qty := greatest(1, least(100, (item->>'qty')::integer));
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  v_delivery := case when v_subtotal >= 200 then 0 else 20 end;

  insert into public.orders (
    id,order_number,user_id,customer_name,customer_phone,customer_email,address,city,pincode,instructions,
    slot,frequency,subtotal,delivery_fee,total,status
  ) values (
    v_order_id,v_order_number,v_user,
    coalesce(p_customer->>'name',''),coalesce(p_customer->>'phone',''),coalesce(p_customer->>'email',''),
    coalesce(p_customer->>'address',''),coalesce(p_customer->>'city',''),coalesce(p_customer->>'pincode',''),
    coalesce(p_instructions,''),p_slot,p_frequency,v_subtotal,v_delivery,v_subtotal+v_delivery,'Order Placed'
  );

  for item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = item->>'product_id' and active = true;
    v_qty := greatest(1, least(100, (item->>'qty')::integer));
    insert into public.order_items(order_id,product_id,name,unit,unit_price,qty,line_total)
    values(v_order_id,v_product.id,v_product.name,v_product.unit,v_product.price,v_qty,v_product.price*v_qty);
  end loop;

  insert into public.order_status_history(order_id,status) values(v_order_id,'Order Placed');
  return jsonb_build_object('id',v_order_id,'order_number',v_order_number);
end;
$$;

create or replace function public.update_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required.'; end if;
  if p_status not in ('Order Placed','Confirmed','Preparing','Out for Delivery','Delivered') then raise exception 'Invalid status.'; end if;
  update public.orders set status=p_status where id=p_order_id;
  if not found then raise exception 'Order not found.'; end if;
  insert into public.order_status_history(order_id,status) values(p_order_id,p_status);
end;
$$;

grant execute on function public.create_order(jsonb,jsonb,text,text,text) to authenticated;
grant execute on function public.update_order_status(uuid,text) to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products" on public.products for select to anon, authenticated using (active = true or public.is_admin());

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.is_admin());

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders for select to authenticated using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id=order_id and (o.user_id=(select auth.uid()) or public.is_admin())));

drop policy if exists "Users read own order history" on public.order_status_history;
create policy "Users read own order history" on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id=order_id and (o.user_id=(select auth.uid()) or public.is_admin())));

-- Realtime for live order tracking (safe to run more than once).
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='order_status_history') then
    alter publication supabase_realtime add table public.order_status_history;
  end if;
end $$;

-- One-time admin setup after registering the admin account in the app:
-- update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
