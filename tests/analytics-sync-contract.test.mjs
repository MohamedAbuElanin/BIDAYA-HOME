import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = await readFile(new URL('../supabase/migrations/20261013000100_initial_secure_schema.sql', import.meta.url), 'utf8');
const migration = await readFile(new URL('../supabase/migrations/20261015000100_allow_public_analytics_event_inserts.sql', import.meta.url), 'utf8');
const dataStore = await readFile(new URL('../src/services/dataStore.ts', import.meta.url), 'utf8');

test('analytics event IDs match the existing UUID primary key', () => {
  assert.match(schema, /create table if not exists public\.analytics_events\s*\(\s*id uuid primary key/i);
  assert.match(dataStore, /private createAnalyticsEventId\(\): string/);
  assert.match(dataStore, /typeof crypto\.randomUUID === 'function'/);
  assert.match(dataStore, /crypto\.getRandomValues\(new Uint8Array\(16\)\)/);
});

test('anonymous analytics inserts are explicitly granted and RLS constrained', () => {
  assert.match(migration, /drop policy if exists analytics_events_anon_insert on public\.analytics_events/i);
  assert.match(migration, /create policy analytics_public_insert on public\.analytics_events\s+for insert to anon/i);
  assert.match(migration, /grant insert on table public\.analytics_events to anon/i);
  assert.doesNotMatch(migration, /grant select on table public\.analytics_events to anon/i);
  assert.doesNotMatch(migration, /for select to anon/i);
  assert.match(migration, /event_name in\s*\(/i);
  assert.match(migration, /left\(visitor_id,\s*4\)\s*=\s*'vis_'/i);
  assert.match(migration, /left\(session_id,\s*5\)\s*=\s*'sess_'/i);
});

test('analytics sync uses insert-only writes and treats duplicate UUIDs as acknowledged', () => {
  assert.match(dataStore, /\.insert\(rows\)/);
  assert.match(dataStore, /error\?\.code === '23505'/);
  assert.match(dataStore, /\.insert\(row\)/);
  assert.match(dataStore, /rowError\.code !== '23505'/);
  assert.match(dataStore, /if \(!this\.writePendingAnalyticsEvents\(remainingEvents\)\)/);
  assert.match(dataStore, /Analytics sync failed; pending events retained for retry/);
});
