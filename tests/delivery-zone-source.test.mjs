import test from 'node:test';
import assert from 'node:assert/strict';
import { readDeliverySource, renderSeedSql } from '../scripts/generate-delivery-zone-seed.mjs';

const source = readDeliverySource();
test('canonical delivery source has the verified governorate, area, and fee counts', () => {
  assert.equal(source.zones.length, 27);
  assert.equal(source.areas.length, 317);
  assert.equal(source.zones.filter((zone) => zone.delivery_fee !== null).length, 25);
  assert.equal(source.zones.filter((zone) => zone.delivery_fee === null).length, 2);
});
test('generated seed preserves source labels and is insert-only', () => {
  const sql = renderSeedSql(source);
  for (const zone of source.zones) assert.match(sql, new RegExp(`"governorate":"${zone.governorate}"`));
  assert.match(sql, /on conflict \(governorate\) do nothing;/);
  assert.match(sql, /on conflict \(governorate, area_ar\) do nothing;/);
  assert.match(sql, /"text_ar":"لم يحدد بعد"/);
  assert.match(sql, /"text_en":"To be determined"/);
  const seedStatements = sql.slice(sql.indexOf('insert into public.delivery_zones'));
  assert.doesNotMatch(seedStatements, /\b(delete|truncate|update)\b/i);
});
