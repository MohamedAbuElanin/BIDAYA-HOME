// Generates (but never executes) the non-destructive delivery-zone seed SQL
// directly from the storefront's canonical governorate data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'src', 'data', 'egyptianGovernorates.ts');

export function readDeliverySource(source = fs.readFileSync(sourcePath, 'utf8')) {
  const blocks = [...source.matchAll(/^  \{\s*\r?\n    id: '([^']+)',\s*\r?\n    name_ar: '([^']+)',\s*\r?\n    name_en: '([^']+)',\s*\r?\n    delivery_fee: (null|\d+),\s*\r?\n    cities: \[([\s\S]*?)\]\s*\r?\n  \}/gm)];
  if (!blocks.length) throw new Error('Could not parse the canonical governorate source.');
  const zones = [];
  const areas = [];
  for (const [, id, name_ar, name_en, rawFee, cityBlock] of blocks) {
    const delivery_fee = rawFee === 'null' ? null : Number(rawFee);
    // delivery_zones.governorate is the canonical selected Arabic name. The
    // text fields are the existing checkout display labels, not duplicate names.
    zones.push({
      id,
      governorate: name_ar,
      governorate_en: name_en,
      text_ar: delivery_fee === null ? 'لم يحدد بعد' : `${delivery_fee} ج.م`,
      text_en: delivery_fee === null ? 'To be determined' : `${delivery_fee} EGP`,
      delivery_fee,
    });
    for (const [, area_ar] of cityBlock.matchAll(/'([^']*)'/g)) areas.push({ governorate: name_ar, area_ar });
  }
  return { zones, areas };
}

export function renderSeedSql({ zones, areas }) {
  return [
    '-- Generated from src/data/egyptianGovernorates.ts; do not hand-edit values.',
    '-- Non-destructive: existing delivery_zones rows are never updated or deleted.',
    'alter table public.delivery_zones add column if not exists governorate_en text;',
    'create table if not exists public.delivery_zone_areas (governorate text not null references public.delivery_zones(governorate) on delete restrict, area_ar text not null, primary key (governorate, area_ar));',
    'alter table public.delivery_zone_areas enable row level security;',
    'revoke all on table public.delivery_zone_areas from anon, authenticated;',
    'grant select, insert, update, delete on public.delivery_zone_areas to authenticated;',
    'drop policy if exists super_admin_manage_delivery_zone_areas on public.delivery_zone_areas;',
    "create policy super_admin_manage_delivery_zone_areas on public.delivery_zone_areas for all to authenticated using (public.has_admin_role(array['super_admin']::public.admin_role[])) with check (public.has_admin_role(array['super_admin']::public.admin_role[]));",
    `insert into public.delivery_zones (governorate, governorate_en, delivery_fee, text_ar, text_en) select governorate, governorate_en, delivery_fee, text_ar, text_en from jsonb_to_recordset($zones$${JSON.stringify(zones)}$zones$::jsonb) as seed(governorate text, governorate_en text, delivery_fee numeric(12,2), text_ar text, text_en text) on conflict (governorate) do nothing;`,
    `insert into public.delivery_zone_areas (governorate, area_ar) select governorate, area_ar from jsonb_to_recordset($areas$${JSON.stringify(areas)}$areas$::jsonb) as seed(governorate text, area_ar text) on conflict (governorate, area_ar) do nothing;`,
  ].join('\n\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.stdout.write(renderSeedSql(readDeliverySource()));
