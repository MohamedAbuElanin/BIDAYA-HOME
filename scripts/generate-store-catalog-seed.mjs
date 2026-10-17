import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'src', 'data', 'seedData.ts');
const temporaryModule = path.join(os.tmpdir(), `bidaya-seed-${randomUUID()}.mjs`);

const source = fs.readFileSync(sourcePath, 'utf8');
const { outputText, diagnostics } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  reportDiagnostics: true,
});

const errors = diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error) || [];
if (errors.length) {
  throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
    getCurrentDirectory: () => root,
    getCanonicalFileName: (fileName) => fileName,
    getNewLine: () => '\n',
  }));
}

fs.writeFileSync(temporaryModule, outputText, 'utf8');

try {
  const { INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_SETTINGS } = await import(pathToFileURL(temporaryModule));
  const categories = INITIAL_CATEGORIES.map(({ id, name_ar, name_en, slug, icon, image_url, description, display_order, is_active, is_archived }) => ({
    id, name_ar, name_en: name_en || null, slug, icon: icon || null, image_url,
    description: description || null, display_order, is_active, is_archived: is_archived || false,
  }));
  const subcategories = INITIAL_CATEGORIES.flatMap((category) => (category.subcategories || []).map((subcategory) => ({
    id: subcategory.id,
    category_id: category.id,
    name_ar: subcategory.name_ar,
    name_en: subcategory.name_en || null,
    slug: subcategory.slug,
    product_types: subcategory.product_types || [],
    display_order: subcategory.display_order || 0,
    is_archived: subcategory.is_archived || false,
  })));
  const brands = INITIAL_BRANDS.map(({ id, name_ar, name_en, slug, logo_url, description, is_active, is_archived }) => ({
    id, name_ar, name_en: name_en || null, slug, logo_url: logo_url || null,
    description: description || null, is_active, is_archived: is_archived || false,
  }));

  process.stdout.write([
    '-- Generated from src/data/seedData.ts; do not hand-edit values.',
    '-- Inserts missing catalog defaults only; existing rows and all orders/admin accounts are untouched.',
    'begin;',
    `insert into public.categories (id, name_ar, name_en, slug, icon, image_url, description, display_order, is_active, is_archived)
select id, name_ar, name_en, slug, icon, image_url, description, display_order, is_active, is_archived
from jsonb_to_recordset($categories$${JSON.stringify(categories)}$categories$::jsonb)
as seed(id text, name_ar text, name_en text, slug text, icon text, image_url text, description text, display_order integer, is_active boolean, is_archived boolean)
on conflict do nothing;`,
    `insert into public.subcategories (id, category_id, name_ar, name_en, slug, product_types, display_order, is_archived)
select id, category_id, name_ar, name_en, slug, product_types, display_order, is_archived
from jsonb_to_recordset($subcategories$${JSON.stringify(subcategories)}$subcategories$::jsonb)
as seed(id text, category_id text, name_ar text, name_en text, slug text, product_types jsonb, display_order integer, is_archived boolean)
on conflict do nothing;`,
    `insert into public.brands (id, name_ar, name_en, slug, logo_url, description, is_active, is_archived)
select id, name_ar, name_en, slug, logo_url, description, is_active, is_archived
from jsonb_to_recordset($brands$${JSON.stringify(brands)}$brands$::jsonb)
as seed(id text, name_ar text, name_en text, slug text, logo_url text, description text, is_active boolean, is_archived boolean)
on conflict do nothing;`,
    `insert into public.site_settings (
  store_name_ar, store_name_en, slogan_ar, logo_url, favicon_url, whatsapp_number, support_phone,
  support_email, facebook_url, instagram_url, store_address, whatsapp_template, show_prices,
  enable_ordering, enable_offers, seo_title, seo_description, footer_text
)
select
  seed.store_name_ar, seed.store_name_en, seed.slogan_ar, seed.logo_url, seed.favicon_url,
  seed.whatsapp_number, seed.support_phone, seed.support_email, seed.facebook_url,
  seed.instagram_url, seed.store_address, seed.whatsapp_template, seed.show_prices,
  seed.enable_ordering, seed.enable_offers, seed.seo_title, seed.seo_description, seed.footer_text
from jsonb_to_recordset($settings$${JSON.stringify([INITIAL_SETTINGS])}$settings$::jsonb)
as seed(
  store_name_ar text, store_name_en text, slogan_ar text, logo_url text, favicon_url text,
  whatsapp_number text, support_phone text, support_email text, facebook_url text,
  instagram_url text, store_address text, whatsapp_template text, show_prices boolean,
  enable_ordering boolean, enable_offers boolean, seo_title text, seo_description text, footer_text text
)
where not exists (select 1 from public.site_settings);`,
    'commit;',
    '',
  ].join('\n\n'));
} finally {
  fs.rmSync(temporaryModule, { force: true });
}
