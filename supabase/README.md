# Supabase database

The linked production project is `hkanvnbdmgzvfcwuqdjj`. Its core application
tables, helper functions, RLS policies, product-image bucket, and storage
policies already exist. The analytics ingestion migration
(`20261015000100_allow_public_analytics_event_inserts.sql`) was manually
applied through the Supabase Dashboard SQL Editor.

The original three migration versions were reconciled in the remote migration
ledger only after comparing production columns, constraints, indexes, grants,
RLS policies, triggers, security functions, and Storage policies against the
local definitions. The readiness migration and both generated seeds have now
been applied. Docker was unavailable, so this reconciliation used direct
PostgreSQL catalog queries rather than `db diff`.

Production readiness was verified after application:

- 10 categories, 69 subcategories, 3 brands, 1 product, and 1 settings row.
- 27 delivery zones, all with English labels, and 317 delivery areas.
- Product images are limited to 1 MiB and WebP/PNG/JPEG.
- The existing single administrator and product remain; no orders, demo
  products, or demo administrators were inserted.
- Both Edge Functions are active with JWT verification and return successful
  CORS preflight responses for `https://bidaya-home.pages.dev`.
- No production test order was created. Auth email delivery has not been
  verified, so administrator invitations have not been tested.

## What the initial migration creates

- Catalog tables: `categories`, `subcategories`, `brands`, and `products`.
- Store configuration: `site_settings` and server-side `delivery_zones`.
- Secure operations tables: `orders`, `admin_users`, and `admin_activity_logs`.
- Optional reporting storage: `analytics_events` (the initial schema adds no
  public write policy; the separate analytics migration allows constrained
  anonymous inserts, but not public reads or updates).
- An atomic order-number sequence and a restricted status-update RPC.
- RLS enabled on every application table, with public catalog reads and
  public reads limited to active delivery zones/areas.

`customers` is intentionally not created. The current application derives customer summaries from order records and does not write to a separate customer table. Creating one now would duplicate customer PII without serving the current UI.

## Application compatibility status

The schema covers the persisted fields used by the TypeScript model for catalog
records, settings, orders, admin users, activity logs, and analytics. It
deliberately keeps customers derived from order records, which matches the
current customer view. The admin order view reads the protected `orders` table
with the authenticated administrator session and maps `customer_info` to the
UI's `Order.customer`. The optional `supabase_url` and `supabase_anon_key` UI
fields are intentionally not persisted in `site_settings`.

The storefront and administration UI load catalog, settings, orders, users,
analytics, delivery zones, and activity logs from Supabase where access is
granted. Browser storage is a cache, not the authoritative store. Product
images remain public storefront assets; only authenticated catalog managers
can upload or delete them.

Orders are persisted only by the `submit-order` Edge Function. The
`invite-admin-user` function verifies the caller's Auth JWT and `super_admin`
role before inviting an account. Both functions are deployed to the production
project. Their allowed origins are configured; Auth email delivery still needs
verification before the invite workflow is ready to use. A WhatsApp fallback
draft is not an order.

The existing production catalog and settings are preserved. The generated
store catalog seed inserts only missing categories, subcategories, brands,
and settings; it did not import demo products, orders, or administrator
accounts. The delivery seed preserves live fees and labels, updated only
missing English governorate labels, and inserted only missing zones and areas.

## Production deployment record

Completed after a production backup was confirmed:

1. Verified that only `20261017000100_database_readiness.sql` was pending in
   the dry-run plan.
2. Reconciled existing versions `20261013000100`, `20261014000100`, and
   `20261015000100` as applied, then applied the readiness migration.
3. Applied `database/seed_delivery_zones.sql` and
   `database/seed_store_catalog.sql`.
4. Set both allowed-origin secrets and deployed `submit-order` and
   `invite-admin-user`.

Do not create test production orders or send test administrator invitations.
Validate those workflows on staging; test administrator email delivery in
Supabase before inviting real staff.

## Staging commands

Link a dedicated staging project before testing new migrations:

```powershell
supabase login
supabase link --project-ref <staging-project-ref>
supabase db push --dry-run
supabase db push
```

Run policy and schema checks in the staging SQL editor after applying
migrations. The production migration history is now reconciled. Keep using a dedicated
staging project for future migration rehearsals.

## First administrator provisioning

The production project already has its owner account linked to a
`super_admin` row. For a new project only:

1. In Supabase Auth, create/invite the owner account and verify its email.
2. Obtain its immutable Auth user UUID from the Dashboard.
3. As the project owner in the SQL Editor, insert one matching row into
   `public.admin_users` with the Auth UUID and `super_admin` role.
4. Verify the user can select only their own profile and that a regular
   signed-in user cannot select or change any administrator role.

Do not add a browser-side role selector, email-based promotion rule, or public `admin_users` insert/update policy.

## Readiness migration notes

`20261017000100_database_readiness.sql` is intended for the existing non-empty
production schema, not as a replacement for the initial migration. It adds
delivery area storage and English governorate labels, scoped public delivery
reads, storage upload limits, indexes, audit triggers, and the safer order
status RPC. It does not delete application records. It has been applied to
production; test future changes on staging first.
