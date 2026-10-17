begin;

alter table public.delivery_zones
  add column if not exists governorate_en text;

create table if not exists public.delivery_zone_areas (
  governorate text not null references public.delivery_zones(governorate) on delete restrict,
  area_ar text not null,
  primary key (governorate, area_ar)
);

alter table public.delivery_zone_areas enable row level security;

revoke all on table public.delivery_zone_areas from anon, authenticated;
grant select on table public.delivery_zone_areas to anon, authenticated;
grant insert, update, delete on table public.delivery_zone_areas to authenticated;

drop policy if exists delivery_zones_public_read on public.delivery_zones;
create policy delivery_zones_public_read on public.delivery_zones
  for select to anon, authenticated using (is_active);

drop policy if exists super_admin_manage_delivery_zone_areas on public.delivery_zone_areas;
create policy super_admin_manage_delivery_zone_areas on public.delivery_zone_areas
  for all to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin']::public.admin_role[]));

drop policy if exists delivery_zone_areas_public_read on public.delivery_zone_areas;
create policy delivery_zone_areas_public_read on public.delivery_zone_areas
  for select to anon, authenticated
  using (exists (
    select 1 from public.delivery_zones
    where delivery_zones.governorate = delivery_zone_areas.governorate
      and delivery_zones.is_active
  ));

grant select on table public.delivery_zones to anon, authenticated;
grant select, insert, update, delete on table public.delivery_zones to authenticated;

create unique index if not exists site_settings_single_row
  on public.site_settings ((true));

create index if not exists idx_analytics_events_name_timestamp
  on public.analytics_events (event_name, timestamp desc);

do $$
begin
  if not exists (select 1 from storage.buckets where id = 'product-images') then
    raise exception 'Required product-images storage bucket is missing.';
  end if;
end $$;

update storage.buckets
set file_size_limit = 1048576,
    allowed_mime_types = array['image/webp', 'image/png', 'image/jpeg']
where id = 'product-images';

create or replace function public.log_admin_table_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.admin_users%rowtype;
  changed_row jsonb;
  mapped_target text;
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select * into actor
  from public.admin_users
  where auth_user_id = auth.uid();

  if not found then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    changed_row := to_jsonb(old);
  else
    changed_row := to_jsonb(new);
  end if;

  mapped_target := case tg_table_name
    when 'products' then 'product'
    when 'categories' then 'category'
    when 'subcategories' then 'category'
    when 'brands' then 'brand'
    else 'setting'
  end;

  insert into public.admin_activity_logs (
    admin_id, admin_name, admin_role, action, target_type, target_id, target_title
  ) values (
    actor.id,
    actor.name,
    actor.role,
    case tg_op
      when 'INSERT' then 'إضافة سجل'
      when 'DELETE' then 'حذف سجل'
      else 'تعديل سجل'
    end || ' ' || mapped_target,
    mapped_target,
    changed_row ->> 'id',
    coalesce(changed_row ->> 'name_ar', changed_row ->> 'store_name_ar')
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists audit_products on public.products;
create trigger audit_products after insert or update or delete on public.products
  for each row execute function public.log_admin_table_change();

drop trigger if exists audit_categories on public.categories;
create trigger audit_categories after insert or update or delete on public.categories
  for each row execute function public.log_admin_table_change();

drop trigger if exists audit_subcategories on public.subcategories;
create trigger audit_subcategories after insert or update or delete on public.subcategories
  for each row execute function public.log_admin_table_change();

drop trigger if exists audit_brands on public.brands;
create trigger audit_brands after insert or update or delete on public.brands
  for each row execute function public.log_admin_table_change();

drop trigger if exists audit_site_settings on public.site_settings;
create trigger audit_site_settings after insert or update or delete on public.site_settings
  for each row execute function public.log_admin_table_change();

revoke all on function public.log_admin_table_change() from public, anon, authenticated;

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
  actor public.admin_users%rowtype;
  updated_order public.orders;
  previous_status text;
begin
  if not public.has_admin_role(array['super_admin', 'admin', 'order_manager']::public.admin_role[]) then
    raise exception 'insufficient privileges' using errcode = '42501';
  end if;

  if status_input not in ('new', 'contacted', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'invalid order status' using errcode = '22023';
  end if;

  select * into actor from public.admin_users where auth_user_id = auth.uid();

  select status into previous_status
  from public.orders
  where id = order_id_input
  for update;

  if not found then
    raise exception 'order not found' using errcode = 'P0002';
  end if;

  update public.orders
  set
    status = status_input,
    status_history = status_history || jsonb_build_array(
      jsonb_strip_nulls(jsonb_build_object(
        'status', status_input,
        'timestamp', timezone('utc', now()),
        'note', nullif(left(note_input, 1000), ''),
        'changed_by', actor.name
      ))
    )
  where id = order_id_input
  returning * into updated_order;

  insert into public.admin_activity_logs (
    admin_id, admin_name, admin_role, action, target_type, target_id, target_title, details
  ) values (
    actor.id, actor.name, actor.role, 'تحديث حالة طلب', 'order', updated_order.id,
    updated_order.order_number,
    format('تم تغيير الحالة من %s إلى %s', previous_status, status_input)
  );

  return updated_order;
end;
$$;

revoke all on function public.update_order_status(text, text, text) from public, anon;
grant execute on function public.update_order_status(text, text, text) to authenticated;

commit;
