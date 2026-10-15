drop policy if exists analytics_events_anon_insert on public.analytics_events;
drop policy if exists analytics_public_insert on public.analytics_events;

create policy analytics_public_insert on public.analytics_events
  for insert to anon
  with check (
    event_name in (
      'PAGE_VIEW',
      'PRODUCT_VIEW',
      'PRODUCT_CLICK',
      'SEARCH',
      'CATEGORY_VIEW',
      'ADD_TO_CART',
      'REMOVE_FROM_CART',
      'BEGIN_CHECKOUT',
      'ORDER_CREATED',
      'ORDER_SUBMIT_ATTEMPT',
      'WHATSAPP_CLICK'
    )
    and left(visitor_id, 4) = 'vis_'
    and length(visitor_id) between 12 and 200
    and left(session_id, 5) = 'sess_'
    and length(session_id) between 13 and 200
    and (page_url is null or length(page_url) <= 2048)
    and octet_length(metadata::text) <= 4096
    and (metadata = '{}'::jsonb or jsonb_typeof(metadata) = 'object')
  );

grant insert on table public.analytics_events to anon;
