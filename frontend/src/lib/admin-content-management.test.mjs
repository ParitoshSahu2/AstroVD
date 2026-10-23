import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Admin-Only Content Management & Security Suite', () => {
  const blogPagePath = path.resolve(__dirname, '../app/blog/page.tsx');
  const galleryPagePath = path.resolve(__dirname, '../app/gallery/page.tsx');
  const adminPagePath = path.resolve(__dirname, '../app/admin/page.tsx');
  const blogModalPath = path.resolve(__dirname, '../app/blog/components/BlogManageModal.tsx');
  const galleryModalPath = path.resolve(__dirname, '../app/gallery/components/GalleryManageModal.tsx');
  const activityTabPath = path.resolve(__dirname, '../app/admin/components/AdminActivityTab.tsx');

  test('TEST-01: Blog page conditionally guards admin controls and requires ADMIN/SUPERADMIN role', () => {
    const source = fs.readFileSync(blogPagePath, 'utf-8');

    // Admin detection logic
    assert.match(
      source,
      /user\?\.role\s*===\s*'ADMIN'\s*\|\|\s*user\?\.role\s*===\s*'SUPERADMIN'/,
      'Blog page must only assign isAdmin when user role is ADMIN or SUPERADMIN'
    );

    // Admin Control Bar guarded by isAdmin
    assert.match(
      source,
      /\{isAdmin\s*&&\s*\([\s\S]*?Admin Content Controls[\s\S]*?Add New Article/,
      'Admin Control Bar with Add New Article must be guarded by {isAdmin && ...}'
    );

    // Per-card admin action buttons guarded by isAdmin
    assert.match(
      source,
      /\{isAdmin\s*&&\s*\([\s\S]*?setEditingPost[\s\S]*?handleTogglePublish[\s\S]*?handleDeletePost/,
      'Blog cards must only display Edit, Publish, and Delete buttons when isAdmin is true'
    );

    // Regular users never see drafts
    assert.match(
      source,
      /if\s*\(!isAdmin\s*&&\s*a\.isPublished\s*===\s*false\)\s*return false;/,
      'Regular visitors and customers must never receive unpublished draft posts'
    );
  });

  test('TEST-02: Gallery page conditionally guards admin controls and strictly preserves BATCH_SIZE = 9', () => {
    const source = fs.readFileSync(galleryPagePath, 'utf-8');

    // Strictly preserve BATCH_SIZE = 9
    assert.match(
      source,
      /const\s+BATCH_SIZE\s*=\s*9;/,
      'Gallery page must continue using BATCH_SIZE = 9'
    );

    // Admin detection logic
    assert.match(
      source,
      /user\?\.role\s*===\s*'ADMIN'\s*\|\|\s*user\?\.role\s*===\s*'SUPERADMIN'/,
      'Gallery page must check for ADMIN or SUPERADMIN role'
    );

    // Admin Control Bar guarded by isAdmin
    assert.match(
      source,
      /\{isAdmin\s*&&\s*\([\s\S]*?Admin Gallery Controls[\s\S]*?Add New Photo/,
      'Gallery page must only display Add New Photo button when isAdmin is true'
    );

    // Per-card admin controls guarded by isAdmin
    assert.match(
      source,
      /\{isAdmin\s*&&\s*\([\s\S]*?setItemToEdit[\s\S]*?handleDeleteItem/,
      'Gallery cards must only display Edit and Delete buttons when isAdmin is true'
    );

    // Regular users never see unpublished photos
    assert.match(
      source,
      /if\s*\(!isAdmin\s*&&\s*item\.isPublished\s*===\s*false\)\s*return false;/,
      'Unpublished photos must be excluded for customers and public seekers'
    );
  });

  test('TEST-03: Blog Management Modal implements full CRUD fields, bilingual support, and image upload', () => {
    assert.ok(fs.existsSync(blogModalPath), 'BlogManageModal component must exist');
    const source = fs.readFileSync(blogModalPath, 'utf-8');

    // Title (English & Hindi)
    assert.match(source, /titleHi/, 'Must support Hindi title');
    // Excerpt (English & Hindi)
    assert.match(source, /excerptHi/, 'Must support Hindi excerpt');
    // Content (English & Hindi)
    assert.match(source, /contentHi/, 'Must support Hindi content');
    // Key Takeaways (English & Hindi)
    assert.match(source, /keyTakeawaysHi/, 'Must support Hindi key takeaways');
    // Image upload endpoint
    assert.match(source, /\/api\/content\/upload/, 'Must upload cover images to /api/content/upload');
    // Content API endpoint
    assert.match(source, /\/api\/content\/blog/, 'Must call /api/content/blog for saving');
    // Authorization header
    assert.match(source, /Authorization:\s*`Bearer\s*\$\{token\}`/, 'Must attach Bearer token');
  });

  test('TEST-04: Gallery Management Modal implements category selection, metadata, and image upload', () => {
    assert.ok(fs.existsSync(galleryModalPath), 'GalleryManageModal component must exist');
    const source = fs.readFileSync(galleryModalPath, 'utf-8');

    // Categories
    assert.match(source, /value="pooja"/, 'Must support pooja category');
    assert.match(source, /value="consultation"/, 'Must support consultation category');
    assert.match(source, /value="yantra"/, 'Must support yantra category');
    assert.match(source, /value="kashi"/, 'Must support kashi category');
    assert.match(source, /value="awards"/, 'Must support awards category');

    // Image upload endpoint
    assert.match(source, /\/api\/content\/upload/, 'Must upload gallery images to /api/content/upload');
    // Gallery API endpoint
    assert.match(source, /\/api\/content\/gallery/, 'Must call /api/content/gallery for saving');
    // Authorization header
    assert.match(source, /Authorization:\s*`Bearer\s*\$\{token\}`/, 'Must attach Bearer token');
  });

  test('TEST-05: Admin Dashboard integrates Activity History tab displaying complete audit trail', () => {
    const adminSource = fs.readFileSync(adminPagePath, 'utf-8');
    assert.ok(fs.existsSync(activityTabPath), 'AdminActivityTab component must exist');
    const activitySource = fs.readFileSync(activityTabPath, 'utf-8');

    // Admin page switcher has activity tab
    assert.match(
      adminSource,
      /setAdminTab\('activity'\)/,
      'Admin page must include Content & Activity History tab button'
    );
    assert.match(
      adminSource,
      /adminTab\s*===\s*'activity'\s*&&\s*<AdminActivityTab/,
      'Admin page must render AdminActivityTab when adminTab is activity'
    );

    // Activity tab fetches from /api/content/activity
    assert.match(
      activitySource,
      /\/api\/content\/activity/,
      'AdminActivityTab must fetch audit logs from /api/content/activity'
    );

    // Displays required audit fields: actor, content type, item ID, action, timestamp, summary
    assert.match(activitySource, /act\.contentType/, 'Must display content type');
    assert.match(activitySource, /act\.action/, 'Must display action type');
    assert.match(activitySource, /act\.adminName/, 'Must display admin actor name');
    assert.match(activitySource, /act\.adminEmail/, 'Must display admin email');
    assert.match(activitySource, /act\.timestamp/, 'Must display operation timestamp');
    assert.match(activitySource, /act\.summary/, 'Must display change summary');
    assert.match(activitySource, /act\.itemId/, 'Must display item ID');
  });

  test('TEST-06: Image storage and upload security validation', () => {
    const blogModalSource = fs.readFileSync(blogModalPath, 'utf-8');
    const galleryModalSource = fs.readFileSync(galleryModalPath, 'utf-8');

    // 10MB limit enforcement
    assert.match(
      blogModalSource,
      /10\s*\*\s*1024\s*\*\s*1024/,
      'Blog modal must enforce 10MB max file size limit'
    );
    assert.match(
      galleryModalSource,
      /10\s*\*\s*1024\s*\*\s*1024/,
      'Gallery modal must enforce 10MB max file size limit'
    );

    // Supported MIME types
    assert.match(blogModalSource, /image\/webp/, 'Must support modern WebP format');
    assert.match(galleryModalSource, /image\/webp/, 'Must support modern WebP format');
  });
});
