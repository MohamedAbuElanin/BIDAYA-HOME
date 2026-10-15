# Supabase review package

The configured Supabase project contains the application tables, helper
functions, expected initial-schema policies, product image bucket and storage
policies. The analytics ingestion migration
(`20261015000100_allow_public_analytics_event_inserts.sql`) was also manually
applied through the Supabase Dashboard SQL Editor after approval.

The project has no `supabase_migrations.schema_migrations` table. As a result,
`supabase migration list --project-ref hkanvnbdmgzvfcwuqdjj` reports all three
local migrations as pending remotely, even though their objects are present.
This object-presence check does not prove exact schema parity: for example,
the existing product image bucket has no file-size limit, while the storage
migration's insert would set one only when creating a new bucket. Do not run
`supabase db push` or repair migration history until the complete remote schema,
constraints, triggers, grants, and bucket configuration have been compared
with the local migrations and any differences have been resolved.

## What the initial migration creates

- Catalog tables: `categories`, `subcategories`, `brands`, and `products`.
- Store configuration: `site_settings` and server-side `delivery_zones`.
- Secure operations tables: `orders`, `admin_users`, and `admin_activity_logs`.
- Optional reporting storage: `analytics_events` (the initial schema adds no
  public write policy; the separate analytics migration allows constrained
  anonymous inserts, but not public reads or updates).
- An atomic order-number sequence and a restricted status-update RPC.
- RLS enabled on every application table, with public catalog reads only.

`customers` is intentionally not created. The current application derives customer summaries from order records and does not write to a separate customer table. Creating one now would duplicate customer PII without serving the current UI.

## Application compatibility status

The schema covers the persisted fields used by the TypeScript model for catalog
records, settings, orders, admin users, activity logs, and analytics. It
deliberately keeps customers derived from order records, which matches the
current customer view. The admin order view reads the protected `orders` table
with the authenticated administrator session and maps `customer_info` to the
UI's `Order.customer`. The optional `supabase_url` and `supabase_anon_key` UI
fields are intentionally not persisted in `site_settings`.

The storefront still keeps its starter catalog and most dashboard state in
`localStorage`. Product rows are now loaded from Supabase and merged with the
local starter catalog. Saving a product requires an authenticated catalog
administrator; the selected category, subcategory, or brand is created in the
database if it is not already there. Uploaded product images use the public
`product-images` Storage bucket, with administrator-only writes.

Orders are persisted only by the `submit-order` Edge Function. Opening or
sending its WhatsApp fallback draft does not save an order; the checkout UI
explicitly labels that path as unregistered. Analytics remains local-first;
the separate analytics migration permits constrained anonymous event inserts
without allowing public reads or updates.

The initial schema and Edge Function sources have not been deployed or executed
against a database from this workspace through the Supabase CLI. The local
function has unit tests, but there is no initialized local Supabase stack or
integration-test harness here.

## Required review decisions before applying

1. Approve the configured Supabase project reference as the intended target.
2. Approve the initial catalog/settings/delivery-zone import source. Demo orders and demo administrators must not be imported as production data.
3. Confirm whether public Supabase Auth sign-up should remain enabled. It is safe to leave enabled only because the migration grants no role on sign-up and no user may alter `admin_users`.
4. Review and deploy the existing checkout Edge Function before allowing
   checkout traffic. It validates the payload shape and limits,
   re-read product availability/prices and delivery-zone fees server-side,
   calculate every monetary amount, allocate `next_order_number()` server-side
   (the migration grants it only to `service_role`),
   and return the existing order for the same idempotency key. It must never
   accept browser-provided totals, order numbers, prices, delivery fees, status,
   or role data as authoritative.
5. Add staging tests for RLS, first-admin provisioning, idempotent checkout,
   order-number concurrency, and Arabic/English catalog reads.

## Staging commands

Install the Supabase CLI outside this repository, authenticate, then link a dedicated staging project:

```powershell
supabase login
supabase link --project-ref <staging-project-ref>
supabase db push --dry-run
supabase db push
```

This also applies `20261014000100_product_image_storage.sql`, which enables
public product-image reads and catalog-administrator-only uploads. Run policy
and schema checks in the staging SQL editor after the migrations. Do not run
`supabase db push` against production until a separate production approval is
given.

## First administrator provisioning

1. In Supabase Auth, create/invite the owner account and verify its email.
2. Obtain its immutable Auth user UUID from the Dashboard.
3. As the project owner in the SQL Editor, insert one matching row into `public.admin_users` with the Auth UUID and `super_admin` role.
4. Verify the user can select only their own profile and that a regular signed-in user cannot select or change any administrator role.

Do not add a browser-side role selector, email-based promotion rule, or public `admin_users` insert/update policy.

## Rerun and destructive-change notes

For its intended target—an empty project—this migration is rerunnable: object
creation uses `if not exists`/`create or replace`, and named policies and
triggers are replaced before recreation. It is not a schema-reconciliation
migration: `create table if not exists` will not retrofit an existing divergent
table definition. Review any non-empty target manually before applying.

It contains no table/data `drop`, `delete`, `truncate`, or `alter ... drop`
statement. The only drops are this migration's own named `set_*_updated_at`
triggers and named RLS policies, immediately recreated with the reviewed
definitions.
