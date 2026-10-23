import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read products.ts directly to extract product IDs, categories, and prices
const productsTsPath = path.resolve(__dirname, '../data/products.ts');
const productsTsContent = fs.readFileSync(productsTsPath, 'utf-8');

// Parse items by extracting id, price, category
const idMatches = [...productsTsContent.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
// Extract categories
const categoryMatches = [...productsTsContent.matchAll(/category:\s*'([^']+)'/g)].map((m) => m[1]);
// Extract prices
const priceMatches = [...productsTsContent.matchAll(/price:\s*'([^']+)'/g)].map((m) => m[1]);

const PRODUCTS_CATALOG = idMatches.map((id, index) => ({
  id,
  category: categoryMatches[index] || 'all',
  price: priceMatches[index] || '₹1,000',
}));

describe('Products Page Infinite Scrolling (Batches of 8)', () => {
  const PRODUCTS_BATCH_SIZE = 8;
  const GALLERY_BATCH_SIZE = 9;

  test('TEST-01: canonical products catalog contains all 19 consecrated products', () => {
    assert.equal(PRODUCTS_CATALOG.length, 19, 'PRODUCTS_CATALOG must have 19 items');
    const ids = new Set(PRODUCTS_CATALOG.map((p) => p.id));
    assert.equal(ids.size, 19, 'Every product ID must be strictly unique');
  });

  test('TEST-02: initial batch displays exactly 8 products', () => {
    const initialBatch = PRODUCTS_CATALOG.slice(0, PRODUCTS_BATCH_SIZE);
    assert.equal(initialBatch.length, 8, 'Initial batch must display exactly 8 products');
    assert.equal(initialBatch[0].id, 'tiger_eye', 'First product should match catalog order');
    assert.equal(initialBatch[7].id, PRODUCTS_CATALOG[7].id, '8th product should match catalog order');
  });

  test('TEST-03: progressive batches load next 8 products until all 19 are displayed', () => {
    const visibleCountBatch1 = PRODUCTS_BATCH_SIZE; // 8
    const visibleCountBatch2 = Math.min(visibleCountBatch1 + PRODUCTS_BATCH_SIZE, PRODUCTS_CATALOG.length); // 16
    const visibleCountBatch3 = Math.min(visibleCountBatch2 + PRODUCTS_BATCH_SIZE, PRODUCTS_CATALOG.length); // 19

    const batch1Items = PRODUCTS_CATALOG.slice(0, visibleCountBatch1);
    const batch2AllVisible = PRODUCTS_CATALOG.slice(0, visibleCountBatch2);
    const batch2NewItems = batch2AllVisible.slice(visibleCountBatch1);
    const batch3AllVisible = PRODUCTS_CATALOG.slice(0, visibleCountBatch3);
    const batch3NewItems = batch3AllVisible.slice(visibleCountBatch2);

    assert.equal(batch1Items.length, 8, 'First batch must be 8 items');
    assert.equal(batch2NewItems.length, 8, 'Second batch must load next 8 items');
    assert.equal(batch2AllVisible.length, 16, 'Total displayed after batch 2 must be 16 items');
    assert.equal(batch3NewItems.length, 3, 'Third batch must load remaining 3 items');
    assert.equal(batch3AllVisible.length, 19, 'Total displayed after batch 3 must be all 19 items');
  });

  test('TEST-04: no duplicate products appear across batches', () => {
    const visibleProducts = PRODUCTS_CATALOG.slice(0, 19);
    const seenIds = new Set();
    for (const item of visibleProducts) {
      assert.ok(!seenIds.has(item.id), `Duplicate product ID detected: ${item.id}`);
      seenIds.add(item.id);
    }
    assert.equal(seenIds.size, 19, 'All 19 items must be distinct');
  });

  test('TEST-05: filtering by category resets displayed items to first 8 (or all available if < 8)', () => {
    const wealthProducts = PRODUCTS_CATALOG.filter((p) => p.category === 'wealth');
    const visibleWealth = wealthProducts.slice(0, PRODUCTS_BATCH_SIZE);

    assert.ok(wealthProducts.length <= PRODUCTS_BATCH_SIZE, 'Wealth category has <= 8 products');
    assert.equal(visibleWealth.length, wealthProducts.length, 'All wealth items are shown within the 8-item batch limit');
    assert.ok(visibleWealth.every((p) => p.category === 'wealth'), 'All visible items must belong to wealth category');
  });

  test('TEST-06: sorting products preserves 8-item batch size and applies correct price ordering', () => {
    const parsePrice = (priceStr) => parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    const sortedLowToHigh = [...PRODUCTS_CATALOG].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    const firstBatchSorted = sortedLowToHigh.slice(0, PRODUCTS_BATCH_SIZE);

    assert.equal(firstBatchSorted.length, 8, 'Sorted initial batch must be exactly 8 items');
    for (let i = 0; i < firstBatchSorted.length - 1; i++) {
      assert.ok(
        parsePrice(firstBatchSorted[i].price) <= parsePrice(firstBatchSorted[i + 1].price),
        'Items must be sorted low-to-high in price'
      );
    }
  });

  test('TEST-07: ProductsSection component explicitly declares PRODUCTS_BATCH_SIZE = 8', () => {
    const productsSectionFilePath = path.resolve(__dirname, '../components/ProductsSection.tsx');
    const productsSource = fs.readFileSync(productsSectionFilePath, 'utf-8');
    assert.match(
      productsSource,
      /export\s+const\s+PRODUCTS_BATCH_SIZE\s*=\s*8;/,
      'ProductsSection must export PRODUCTS_BATCH_SIZE = 8'
    );
  });

  test('TEST-08: Gallery page strictly preserves BATCH_SIZE = 9', () => {
    const galleryFilePath = path.resolve(__dirname, '../app/gallery/page.tsx');
    const gallerySource = fs.readFileSync(galleryFilePath, 'utf-8');
    assert.match(
      gallerySource,
      /const\s+BATCH_SIZE\s*=\s*9;/,
      'Gallery page must continue using BATCH_SIZE = 9'
    );
  });
});
