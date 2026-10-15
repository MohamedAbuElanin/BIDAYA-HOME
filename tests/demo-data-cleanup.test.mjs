import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const seedData = await readFile(new URL('../src/data/seedData.ts', import.meta.url), 'utf8');
const dataStore = await readFile(new URL('../src/services/dataStore.ts', import.meta.url), 'utf8');
const footer = await readFile(new URL('../src/components/common/Footer.tsx', import.meta.url), 'utf8');

test('demo products, orders, and admin users are not used as initial data', () => {
  assert.match(seedData, /export const INITIAL_PRODUCTS: Product\[\] = \[\]/);
  assert.match(seedData, /export const INITIAL_ORDERS: Order\[\] = \[\]/);
  assert.match(seedData, /export const INITIAL_ADMIN_USERS: AdminUser\[\] = \[\]/);
  assert.match(dataStore, /return this\.load<ActivityLog\[\]>\(STORAGE_KEYS\.ACTIVITY_LOGS, \[\]\)/);
});

test('legacy demo records are removed once without replacing unrelated local records', () => {
  assert.match(dataStore, /private removeLegacyDemoData\(\): void/);
  assert.match(dataStore, /records\.filter\(\(record\) => !record\?\.id \|\| !ids\.has\(record\.id\)\)/);
  assert.match(dataStore, /removeRecordsById\(STORAGE_KEYS\.PRODUCTS, new Set\(LEGACY_DEMO_PRODUCT_IDS\)/);
  assert.match(dataStore, /removeRecordsById\(STORAGE_KEYS\.ORDERS, new Set\(LEGACY_DEMO_ORDER_IDS\)/);
  assert.match(dataStore, /removeRecordsById\(STORAGE_KEYS\.ADMIN_USERS, new Set\(LEGACY_DEMO_ADMIN_USER_IDS\)/);
  assert.match(dataStore, /this\.removeLegacyDemoData\(\);/);
  assert.doesNotMatch(dataStore, /INITIAL_PRODUCTS\.forEach/);
});

test('business email defaults to Gmail and footer brand follows the selected language', () => {
  assert.match(seedData, /support_email: 'bidayahome@gmail\.com'/);
  assert.match(dataStore, /settings\.support_email === 'info@bidayahome\.com'/);
  assert.match(footer, /settings\.support_email \|\| 'bidayahome@gmail\.com'/);
  assert.match(footer, /settings\.store_name_en \|\| 'Bidaya Home'/);
  assert.match(footer, /settings\.store_name_ar \|\| 'بداية هوم'/);
  assert.doesNotMatch(footer, /settings\.footer_text \|\|/);
});
