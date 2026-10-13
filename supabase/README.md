# Supabase review package

Nothing in this directory has been applied to a Supabase project. The migration is a review draft for an empty application schema.

## What the initial migration creates

- Catalog tables: `categories`, `subcategories`, `brands`, and `products`.
- Store configuration: `site_settings` and server-side `delivery_zones`.
- Secure operations tables: `orders`, `admin_users`, and `admin_activity_logs`.
- Optional reporting storage: `analytics_events` (no public write policy).
- An atomic order-number sequence and a restricted status-update RPC.
- RLS enabled on every application table, with public catalog reads only.

`customers` is intentionally not created. The current application derives customer summaries from order records and does not write to a separate customer table. Creating one now would duplicate customer PII without serving the current UI.

## Application compatibility status

The schema covers the persisted fields used by the TypeScript model for catalog
records, settings, orders, admin users, activity logs, and analytics. It
deliberately keeps customers derived from order records, which matches the
current customer view. The future data layer must map `orders.customer_info`
to the UI's `Order.customer`; the browser cannot read the protected orders
table directly. The optional `supabase_url` and `supabase_anon_key` UI fields
are intentionally not persisted in `site_settings`.

The current frontend is **not yet wired to this schema**: it stores the
storefront and dashboard state in `localStorage`. Its two direct Supabase
attempts are a browser-side `orders` insert and a browser-side analytics
insert. The reviewed RLS design correctly rejects both; it requires a checkout
Edge Function for orders and a separately designed analytics ingestion path.
The local `functions/submit-order` source and validation unit tests now exist,
but neither a local Supabase stack nor an integration-test harness is available
in this workspace. They have not been deployed or executed against a database.

## Required review decisions before applying

1. Approve the configured Supabase project reference as the intended empty project.
2. Approve the initial catalog/settings/delivery-zone import source. Demo orders and demo administrators must not be imported as production data.
3. Confirm whether public Supabase Auth sign-up should remain enabled. It is safe to leave enabled only because the migration grants no role on sign-up and no user may alter `admin_users`.
4. Implement and review a separate checkout Edge Function before granting
   checkout traffic to it. It must validate the payload shape and limits,
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

Run policy and schema checks in the staging SQL editor after the migration. Do not run `supabase db push` against production until a separate production approval is given.

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
