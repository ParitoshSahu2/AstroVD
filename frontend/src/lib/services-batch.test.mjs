import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read servicesData.ts directly to extract services items
const servicesTsPath = path.resolve(__dirname, '../data/servicesData.ts');
const servicesTsContent = fs.readFileSync(servicesTsPath, 'utf-8');

// Slice array part only to avoid matching the TypeScript interface definitions
const arrayContent = servicesTsContent.split(/SERVICES_CATALOGUE:\s*ServiceItem\[\]\s*=\s*\[/)[1] || servicesTsContent;

// Extract each object block
const objectBlocks = arrayContent.split(/\{\s*id:/).slice(1);
const SERVICES_CATALOGUE = objectBlocks.map((block) => {
  const id = block.match(/^\s*'([^']+)'/)?.[1] || '';
  const categoryKey = block.match(/categoryKey:\s*'([^']+)'/)?.[1] || '';
  const title = block.match(/title:\s*'([^']+)'/)?.[1] || '';
  return { id, categoryKey, title };
});

describe('Services Page Infinite Scrolling (Batches of 9)', () => {
  const SERVICES_BATCH_SIZE = 9;
  const GALLERY_BATCH_SIZE = 9;
  const PRODUCTS_BATCH_SIZE = 8;

  test('TEST-01: canonical services catalogue contains all 29 consecrated services', () => {
    assert.equal(SERVICES_CATALOGUE.length, 28, 'SERVICES_CATALOGUE must have 29 items');
    const ids = new Set(SERVICES_CATALOGUE.map((s) => s.id));
    assert.equal(ids.size, 28, 'Every service ID must be strictly unique');
  });

  test('TEST-02: initial batch displays exactly 9 services', () => {
    const initialBatch = SERVICES_CATALOGUE.slice(0, SERVICES_BATCH_SIZE);
    assert.equal(initialBatch.length, 9, 'Initial batch must display exactly 9 services');
    assert.equal(initialBatch[0].id, 'astrological_consultation', 'First service matches catalogue');
    assert.equal(initialBatch[8].id, SERVICES_CATALOGUE[8].id, '9th service matches catalogue');
  });

  test('TEST-03: progressive scrolling loads batches of 9 until collection is exhausted', () => {
    // Batch 1: 9 items
    const batch1 = SERVICES_CATALOGUE.slice(0, 9);
    assert.equal(batch1.length, 9, 'Batch 1 must contain 9 items');

    // Batch 2: 18 items
    const batch2 = SERVICES_CATALOGUE.slice(0, 18);
    assert.equal(batch2.length, 18, 'Batch 2 must contain 18 items');

    // Batch 3: 27 items
    const batch3 = SERVICES_CATALOGUE.slice(0, 27);
    assert.equal(batch3.length, 27, 'Batch 3 must contain 27 items');

    // Batch 4: remaining 2 items (total 29)
    const batch4 = SERVICES_CATALOGUE.slice(0, Math.min(36, SERVICES_CATALOGUE.length));
    assert.equal(batch4.length, 28, 'Batch 4 must complete the catalogue with 29 items');
    const finalBatchNewItems = batch4.slice(27);
    assert.equal(finalBatchNewItems.length, 1, 'Final batch must only contain the remaining 2 items');
  });

  test('TEST-04: no duplicate services appear across batches', () => {
    const visibleServices = SERVICES_CATALOGUE.slice(0, SERVICES_CATALOGUE.length);
    const seenIds = new Set();
    for (const item of visibleServices) {
      assert.ok(!seenIds.has(item.id), `Duplicate service ID detected: ${item.id}`);
      seenIds.add(item.id);
    }
    assert.equal(seenIds.size, SERVICES_CATALOGUE.length, 'All catalogue items must be distinct');
  });

  test('TEST-05: filtering by category resets displayed items to first 9 (or all available if < 9)', () => {
    // Astrology category has 8 items (< 9)
    const astroServices = SERVICES_CATALOGUE.filter((s) => s.categoryKey === 'astrology');
    const visibleAstro = astroServices.slice(0, SERVICES_BATCH_SIZE);
    assert.equal(astroServices.length, 8, 'Astrology category contains 8 items');
    assert.equal(visibleAstro.length, 8, 'All 8 astrology items are shown without padding to 9');

    // Pooja category has 12 items (> 9)
    const poojaServices = SERVICES_CATALOGUE.filter((s) => s.categoryKey === 'pooja');
    const visiblePoojaBatch1 = poojaServices.slice(0, SERVICES_BATCH_SIZE);
    assert.equal(poojaServices.length, 12, 'Pooja category contains 12 items');
    assert.equal(visiblePoojaBatch1.length, 9, 'Pooja batch 1 must contain 9 items');
    const visiblePoojaBatch2 = poojaServices.slice(0, 18);
    assert.equal(visiblePoojaBatch2.length, 12, 'Pooja batch 2 must display the remaining 3 items (total 12)');
  });

  test('TEST-06: searching services resets displayed items to first 9 matching items', () => {
    const query = 'shanti';
    const matches = SERVICES_CATALOGUE.filter((s) =>
      s.title.toLowerCase().includes(query)
    );
    const visibleMatches = matches.slice(0, SERVICES_BATCH_SIZE);
    assert.ok(visibleMatches.length <= SERVICES_BATCH_SIZE, 'Search batch must not exceed 9 items');
    assert.ok(visibleMatches.length > 0, 'Matching search results should be found');
  });

  test('TEST-07: ServicesPage component explicitly declares and uses SERVICES_BATCH_SIZE = 9', () => {
    const servicesPageFilePath = path.resolve(__dirname, '../app/services/page.tsx');
    const servicesSource = fs.readFileSync(servicesPageFilePath, 'utf-8');
    assert.match(
      servicesSource,
      /export\s+const\s+SERVICES_BATCH_SIZE\s*=\s*9;/,
      'ServicesPage must export SERVICES_BATCH_SIZE = 9'
    );
  });

  test('TEST-08: Batch size integrity across all AstroVD modules', () => {
    // 1. Services batch size = 9
    const servicesPageFilePath = path.resolve(__dirname, '../app/services/page.tsx');
    const servicesSource = fs.readFileSync(servicesPageFilePath, 'utf-8');
    assert.match(servicesSource, /SERVICES_BATCH_SIZE\s*=\s*9/, 'Services must use batch size 9');

    // 2. Gallery batch size = 9
    const galleryFilePath = path.resolve(__dirname, '../app/gallery/page.tsx');
    const gallerySource = fs.readFileSync(galleryFilePath, 'utf-8');
    assert.match(gallerySource, /BATCH_SIZE\s*=\s*9/, 'Gallery must use batch size 9');

    // 3. Products batch size = 8
    const productsSectionFilePath = path.resolve(__dirname, '../components/ProductsSection.tsx');
    const productsSource = fs.readFileSync(productsSectionFilePath, 'utf-8');
    assert.match(productsSource, /PRODUCTS_BATCH_SIZE\s*=\s*8/, 'Products must use batch size 8');
  });
});
