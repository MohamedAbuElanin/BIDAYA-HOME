-- BIDAYA HOME initial secure schema.
-- REVIEW ONLY: do not run this migration against any project until approved.
-- This migration is additive and does not seed or delete application data.

create extension if not exists pgcrypto;

do $$
begin
  create type public.admin_role as enum ('super_admin', 'admin', 'catalog_manager', 'order_manager');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.categories (
  id text primary key default ('cat-' || replace(gen_random_uuid()::text, '-', '')),
  name_ar text not null,
  name_en text,
  slug text not null unique,
  icon text,
  image_url text not null,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subcategories (
  id text primary key default ('sub-' || replace(gen_random_uuid()::text, '-', '')),
  category_id text not null references public.categories(id) on delete restrict,
  name_ar text not null,
  name_en text,
  slug text not null,
  product_types jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (category_id, slug),
  unique (category_id, id),
  check (jsonb_typeof(product_types) = 'array')
);

create table if not exists public.brands (
  id text primary key default ('brand-' || replace(gen_random_uuid()::text, '-', '')),
  name_ar text not null,
  name_en text,
  slug text not null unique,
  logo_url text,
  description text,
  is_active boolean not null default true,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id text primary key default ('prod-' || replace(gen_random_uuid()::text, '-', '')),
  name_ar text not null,
  name_en text,
  slug text not null unique,
  description text not null,
  short_description text,
  sku text not null unique,
  price numeric(12, 2) not null default 0 check (price >= 0),
  old_price numeric(12, 2) check (old_price is null or old_price >= 0),
  pricing_mode text not null default 'fixed' check (pricing_mode in ('fixed', 'starting_at', 'on_request')),
  category_id text not null references public.categories(id) on delete restrict,
  subcategory_id text,
  product_type text,
  brand_id text references public.brands(id) on delete set null,
  images jsonb not null,
  primary_image_index integer not null default 0 check (primary_image_index >= 0),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_offer boolean not null default false,
  is_available boolean not null default true,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  display_order integer not null default 0,
  specifications jsonb not null default '[]'::jsonb,
  views_count integer not null default 0 check (views_count >= 0),
  request_count integer not null default 0 check (request_count >= 0),
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (category_id, subcategory_id)
    references public.subcategories(category_id, id) on delete set null (subcategory_id),
  check (case when jsonb_typeof(images) = 'array' then jsonb_array_length(images) > 0 else false end),
  check (jsonb_typeof(specifications) = 'array'),
  check (case when jsonb_typeof(images) = 'array' then primary_image_index < jsonb_array_length(images) else false end),
  check (old_price is null or old_price >= price)
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  store_name_ar text not null default 'بداية هوم',
  store_name_en text not null default 'Bidaya Home',
  slogan_ar text not null default 'بداية جديدة.. لبيتك كل ما يستحق',
  logo_url text,
  favicon_url text,
  whatsapp_number text not null,
  support_phone text,
  support_email text,
  facebook_url text,
  instagram_url text,
  store_address text,
  whatsapp_template text not null,
  show_prices boolean not null default true,
  enable_ordering boolean not null default true,
  enable_offers boolean not null default true,
  seo_title text,
  seo_description text,
  footer_text text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- This is the server-side source of truth for checkout delivery fees.
-- Its governorate rows are intentionally seeded separately from the reviewed
-- application data; checkout must not launch until that seed is present.
create table if not exists public.delivery_zones (
  governorate text primary key,
  delivery_fee numeric(12, 2) check (delivery_fee is null or delivery_fee >= 0),
  text_ar text not null,
  text_en text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create sequence if not exists public.order_number_sequence as bigint start with 1;

create table if not exists public.orders (
  id text primary key default ('ord-' || replace(gen_random_uuid()::text, '-', '')),
  order_number text not null unique,
  idempotency_key uuid not null unique,
  customer_info jsonb not null,
  items jsonb not null check (case when jsonb_typeof(items) = 'array' then jsonb_array_length(items) > 0 else false end),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  deposit_percentage numeric(5, 2) not null default 50 check (deposit_percentage between 0 and 100),
  deposit_amount numeric(12, 2) check (deposit_amount is null or deposit_amount >= 0),
  deposit_payment_method text check (deposit_payment_method is null or deposit_payment_method in ('instapay', 'wallet', 'bank_transfer')),
  remaining_percentage numeric(5, 2) not null default 50 check (remaining_percentage between 0 and 100),
  remaining_amount numeric(12, 2) check (remaining_amount is null or remaining_amount >= 0),
  remaining_payment_method text check (remaining_payment_method is null or remaining_payment_method in ('cash', 'instapay', 'wallet', 'bank_transfer')),
  delivery_fee numeric(12, 2) check (delivery_fee is null or delivery_fee >= 0),
  delivery_fee_text text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  whatsapp_sent boolean not null default false,
  visitor_id text,
  device_type text check (device_type is null or device_type in ('mobile', 'tablet', 'desktop')),
  traffic_source text check (traffic_source is null or traffic_source in ('facebook', 'instagram', 'google', 'direct', 'other')),
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  id text primary key default ('admin-' || replace(gen_random_uuid()::text, '-', '')),
  auth_user_id uuid unique references auth.users(id) on delete restrict,
  name text not null,
  email text not null unique,
  role public.admin_role not null,
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (auth_user_id is not null)
);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null references public.admin_users(id) on delete restrict,
  admin_name text not null,
  admin_role public.admin_role not null,
  action text not null,
  target_type text not null check (target_type in ('product', 'category', 'brand', 'order', 'customer', 'setting', 'auth')),
  target_id text,
  target_title text,
  details text,
  timestamp timestamptz not null default timezone('utc', now())
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  visitor_id text not null,
  session_id text not null,
  timestamp timestamptz not null default timezone('utc', now()),
  page_url text,
  device_type text check (device_type is null or device_type in ('mobile', 'tablet', 'desktop')),
  traffic_source text check (traffic_source is null or traffic_source in ('facebook', 'instagram', 'google', 'direct', 'other')),
  location_governorate text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_subcategories_category_id on public.subcategories(category_id);
create index if not exists idx_products_catalog on public.products(category_id, is_archived, is_available, display_order);
create index if not exists idx_products_brand_id on public.products(brand_id);
create index if not exists idx_orders_status_created_at on public.orders(status, created_at desc);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_activity_logs_timestamp on public.admin_activity_logs(timestamp desc);
create index if not exists idx_analytics_events_timestamp on public.analytics_events(timestamp desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists set_subcategories_updated_at on public.subcategories;
create trigger set_subcategories_updated_at before update on public.subcategories for each row execute function public.set_updated_at();
drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at before update on public.brands for each row execute function public.set_updated_at();
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists set_settings_updated_at on public.site_settings;
create trigger set_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists set_admin_users_updated_at on public.admin_users;
create trigger set_admin_users_updated_at before update on public.admin_users for each row execute function public.set_updated_at();
drop trigger if exists set_delivery_zones_updated_at on public.delivery_zones;
create trigger set_delivery_zones_updated_at before update on public.delivery_zones for each row execute function public.set_updated_at();

create or replace function public.has_admin_role(allowed_roles public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where auth_user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  sequence_value bigint;
begin
  sequence_value := nextval('public.order_number_sequence');
  return format('BH-%s-%s', to_char(current_date, 'YYYY'), lpad(sequence_value::text, 6, '0'));
end;
$$;

-- Status changes are constrained to this RPC so the browser cannot forge
-- an arbitrary history or change protected monetary/customer fields.
create or replace function public.update_order_status(
  order_id_input text,
  status_input text,
  note_input text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  updated_order public.orders;
begin
  if not public.has_admin_role(array['super_admin', 'admin', 'order_manager']::public.admin_role[]) then
    raise exception 'insufficient privileges' using errcode = '42501';
  end if;

  if status_input not in ('new', 'contacted', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'invalid order status' using errcode = '22023';
  end if;

  select name into actor_name from public.admin_users where auth_user_id = auth.uid();

  update public.orders
  set
    status = status_input,
    status_history = status_history || jsonb_build_array(
      jsonb_strip_nulls(jsonb_build_object(
        'status', status_input,
        'timestamp', timezone('utc', now()),
        'note', nullif(left(note_input, 1000), ''),
        'changed_by', actor_name
      ))
    )
  where id = order_id_input
  returning * into updated_order;

  if not found then
    raise exception 'order not found' using errcode = 'P0002';
  end if;

  return updated_order;
end;
$$;

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.orders enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.analytics_events enable row level security;

-- Catalog reads expose only storefront fields from records intended for sale.
drop policy if exists catalog_public_read_products on public.products;
drop policy if exists catalog_public_read_categories on public.categories;
drop policy if exists catalog_public_read_subcategories on public.subcategories;
drop policy if exists catalog_public_read_brands on public.brands;
drop policy if exists storefront_public_read_settings on public.site_settings;
drop policy if exists catalog_admin_manage_categories on public.categories;
drop policy if exists catalog_admin_manage_subcategories on public.subcategories;
drop policy if exists catalog_admin_manage_brands on public.brands;
drop policy if exists catalog_admin_manage_products on public.products;
drop policy if exists super_admin_manage_settings on public.site_settings;
drop policy if exists super_admin_manage_delivery_zones on public.delivery_zones;
drop policy if exists order_admin_read_orders on public.orders;
drop policy if exists admin_user_read_own_profile on public.admin_users;
drop policy if exists super_admin_manage_admin_users on public.admin_users;
drop policy if exists super_admin_read_activity_logs on public.admin_activity_logs;
drop policy if exists admin_read_analytics on public.analytics_events;

create policy catalog_public_read_products on public.products for select to anon, authenticated using (not is_archived);
create policy catalog_public_read_categories on public.categories for select to anon, authenticated using (is_active and not is_archived);
create policy catalog_public_read_subcategories on public.subcategories for select to anon, authenticated using (
  not is_archived and exists (
    select 1 from public.categories
    where categories.id = subcategories.category_id
      and categories.is_active
      and not categories.is_archived
  )
);
create policy catalog_public_read_brands on public.brands for select to anon, authenticated using (is_active and not is_archived);
create policy storefront_public_read_settings on public.site_settings for select to anon, authenticated using (true);

create policy catalog_admin_manage_categories on public.categories for all to authenticated
  using (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]));
create policy catalog_admin_manage_subcategories on public.subcategories for all to authenticated
  using (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]));
create policy catalog_admin_manage_brands on public.brands for all to authenticated
  using (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]));
create policy catalog_admin_manage_products on public.products for all to authenticated
  using (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'admin', 'catalog_manager']::public.admin_role[]));

create policy super_admin_manage_settings on public.site_settings for all to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin']::public.admin_role[]));
create policy super_admin_manage_delivery_zones on public.delivery_zones for all to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin']::public.admin_role[]));

create policy order_admin_read_orders on public.orders for select to authenticated
  using (public.has_admin_role(array['super_admin', 'admin', 'order_manager']::public.admin_role[]));
create policy admin_user_read_own_profile on public.admin_users for select to authenticated using (auth_user_id = auth.uid());
create policy super_admin_manage_admin_users on public.admin_users for all to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin']::public.admin_role[]));
create policy super_admin_read_activity_logs on public.admin_activity_logs for select to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]));
create policy admin_read_analytics on public.analytics_events for select to authenticated
  using (public.has_admin_role(array['super_admin', 'admin']::public.admin_role[]));

revoke all on table public.categories, public.subcategories, public.brands, public.products,
  public.site_settings, public.delivery_zones, public.orders, public.admin_users,
  public.admin_activity_logs, public.analytics_events from anon, authenticated;

grant select on public.categories, public.subcategories, public.brands, public.products, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.categories, public.subcategories, public.brands, public.products to authenticated;
grant select, update on public.site_settings to authenticated;
grant select, insert, update, delete on public.delivery_zones to authenticated;
grant select on public.orders, public.admin_users, public.admin_activity_logs, public.analytics_events to authenticated;

revoke all on function public.next_order_number() from public, anon, authenticated;
grant execute on function public.next_order_number() to service_role;
revoke all on function public.update_order_status(text, text, text) from public, anon;
grant execute on function public.update_order_status(text, text, text) to authenticated;
revoke all on function public.has_admin_role(public.admin_role[]) from public;
grant execute on function public.has_admin_role(public.admin_role[]) to authenticated;

comment on table public.orders is 'Checkout orders. Inserts are intentionally service-role-only through the submit-order Edge Function.';
comment on table public.admin_users is 'Trusted administrator-role mapping. Only project owners provision or link Auth users.';
