# Local Edge Function review notes

`submit-order` is intentionally present only as local source. It has not been
deployed. Its required secrets are `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
and an exact `CHECKOUT_ALLOWED_ORIGIN`; the service-role key must be configured
only in the Edge Function environment, never in `VITE_*` variables.

Before enabling checkout, the owner must provide one row for every governorate
that may accept checkout requests: the exact Arabic governorate name emitted by
the current UI, `text_ar`, `text_en`, whether the zone is active, and either an
approved non-negative `delivery_fee` or an explicit null fee. No delivery fee
or shipping promise is inferred from frontend demo data.

The function validates payload limits, ignores browser monetary fields, reads
trusted products/settings/zones, and uses the migration's unique idempotency
key. A retry must reuse the same `x-idempotency-key`; the browser keeps it
through a failed/lost-response retry and clears it only after confirmation.

Run unit tests locally with `npm test`. Integration tests that exercise RLS,
concurrent inserts, and a real Edge Function need an initialized local
Supabase CLI stack; none is installed in this workspace, so they have not run.
