# Local Edge Function review notes

`submit-order` is intentionally present only as local source. It has not been
deployed. Its required secrets are `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
and an exact `CHECKOUT_ALLOWED_ORIGIN`; the service-role key must be configured
only in the Edge Function environment, never in `VITE_*` variables.

The canonical existing delivery dataset is
`src/data/egyptianGovernorates.ts`. Generate its non-destructive SQL locally
with `npm run generate:delivery-seed`; it preserves the existing Arabic names,
English governorate labels, fee/null-fee values, and 317 listed areas. It does
not invent area English labels (none exist in the source) or overwrite an
existing zone. The source has no explicit active/inactive flag; its current UI
lists every zone, so the schema default remains in effect until the owner
defines an explicit status policy.

The function validates payload limits, ignores browser monetary fields, reads
trusted products/settings/zones, and uses the migration's unique idempotency
key. A retry must reuse the same `x-idempotency-key`; the browser keeps it
through a failed/lost-response retry and clears it only after confirmation.

## Staging checkout activation

The checkout cannot save orders until its database schema, delivery data, and
Edge Function are installed in the same Supabase project:

1. Link a dedicated staging project and apply the reviewed migration:
   `supabase link --project-ref <staging-project-ref>`, then
   `supabase db push`.
2. Generate and apply the delivery-zone seed SQL with
   `npm run generate:delivery-seed`. Also populate `products` using the product
   IDs used by the storefront and add a `site_settings` row with
   `enable_ordering` enabled. The storefront catalog/settings still live in
   browser `localStorage`; they are not automatically copied to Supabase.
3. Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and
   `CHECKOUT_ALLOWED_ORIGIN` (the exact deployed storefront origin, including
   scheme and port if applicable) in the Edge Function secrets. Never put the
   service-role key in a `VITE_*` variable.
4. Deploy with `supabase functions deploy submit-order --project-ref <staging-project-ref>`.
   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the frontend build,
   then redeploy the frontend.
5. Verify a test order appears in `public.orders` and that WhatsApp opens
   before enabling checkout on production.

The function's CORS preflight must allow Supabase's `apikey`, `authorization`,
and `x-client-info` headers as well as the checkout idempotency header. A
missing deployment or origin secret prevents browser checkout even when the
frontend Supabase URL and publishable key are configured.

Run unit tests locally with `npm test`. Integration tests that exercise RLS,
concurrent inserts, and a real Edge Function need an initialized local
Supabase CLI stack; none is installed in this workspace, so they have not run.
