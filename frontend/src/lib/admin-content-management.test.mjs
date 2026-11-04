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
  const adminBlogsTabPath = path.resolve(__dirname, '../app/admin/components/AdminBlogsTab.tsx');
  const adminGalleryTabPath = path.resolve(__dirname, '../app/admin/components/AdminGalleryTab.tsx');
  const blogModalPath = path.resolve(__dirname, '../app/blog/components/BlogManageModal.tsx');
  const galleryModalPath = path.resolve(__dirname, '../app/gallery/components/GalleryManageModal.tsx');
  const activityTabPath = path.resolve(__dirname, '../app/admin/components/AdminActivityTab.tsx');

  test('TEST-01: Admin dashboard provides dedicated AdminBlogsTab and public blog page remains a pristine reader experience', () => {
    assert.ok(fs.existsSync(adminBlogsTabPath), 'AdminBlogsTab component must exist in admin components');
    const adminBlogsSource = fs.readFileSync(adminBlogsTabPath, 'utf-8');
    const publicBlogSource = fs.readFileSync(blogPagePath, 'utf-8');

    // Admin Blogs Tab provides full management actions
    assert.match(
      adminBlogsSource,
      /handleTogglePublish/,
      'AdminBlogsTab must implement publication toggle (Live / Draft)'
    );
    assert.match(
      adminBlogsSource,
      /BlogManageModal/,
      'AdminBlogsTab must integrate BlogManageModal for Add/Edit operations'
    );
    assert.match(
      adminBlogsSource,
      /handleConfirmDelete/,
      'AdminBlogsTab must implement article deletion'
    );
    assert.match(
      adminBlogsSource,
      /\/api\/content\/blog\?includeUnpublished=true/,
      'AdminBlogsTab must query the backend with includeUnpublished=true'
    );

    // Public blog page must be clean of inline admin editing controls
    assert.doesNotMatch(
      publicBlogSource,
      /aria-label="Admin Content Controls"/,
      'Public blog page must not display inline admin control bars'
    );
    assert.doesNotMatch(
      publicBlogSource,
      /setManageModalOpen/,
      'Public blog page must not trigger BlogManageModal directly'
    );

    // Regular visitors and customers only see published articles
    assert.match(
      publicBlogSource,
      /if\s*\(a\.isPublished\s*===\s*false\)\s*return false;/,
      'Regular visitors and customers must never receive unpublished draft posts'
    );
  });

  test('TEST-02: Admin dashboard provides dedicated AdminGalleryTab and public gallery strictly preserves BATCH_SIZE = 9', () => {
    assert.ok(fs.existsSync(adminGalleryTabPath), 'AdminGalleryTab component must exist in admin components');
    const adminGallerySource = fs.readFileSync(adminGalleryTabPath, 'utf-8');
    const publicGallerySource = fs.readFileSync(galleryPagePath, 'utf-8');

    // Strictly preserve BATCH_SIZE = 9 on the public gallery
    assert.match(
      publicGallerySource,
      /const\s+BATCH_SIZE\s*=\s*9;/,
      'Gallery page must continue using BATCH_SIZE = 9'
    );

    // Admin Gallery Tab provides full management
    assert.match(
      adminGallerySource,
      /GalleryManageModal/,
      'AdminGalleryTab must integrate GalleryManageModal for Add/Edit photos'
    );
    assert.match(
      adminGallerySource,
      /handleDelete/,
      'AdminGalleryTab must implement photo deletion'
    );
    assert.match(
      adminGallerySource,
      /\/api\/content\/gallery\?includeUnpublished=true/,
      'AdminGalleryTab must fetch includeUnpublished=true'
    );

    // Public gallery page must be clean of inline admin editing controls
    assert.doesNotMatch(
      publicGallerySource,
      /aria-label="Admin Gallery Controls"/,
      'Public gallery page must not display inline admin control bars'
    );
    assert.doesNotMatch(
      publicGallerySource,
      /setManageModalOpen/,
      'Public gallery page must not trigger GalleryManageModal directly'
    );

    // Regular users never see unpublished photos
    assert.match(
      publicGallerySource,
      /if\s*\(item\.isPublished\s*===\s*false\)\s*return false;/,
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

  test('TEST-05: Admin Dashboard integrates Blogs, Gallery, and Activity History tabs in sidebar and main view', () => {
    const adminSource = fs.readFileSync(adminPagePath, 'utf-8');
    assert.ok(fs.existsSync(activityTabPath), 'AdminActivityTab component must exist');
    const activitySource = fs.readFileSync(activityTabPath, 'utf-8');

    // Admin page switcher has blogs, gallery, and activity tabs
    assert.match(
      adminSource,
      /handleSidebarTabClick\('blogs'\)/,
      'Admin page must include Blogs tab button in sidebar'
    );
    assert.match(
      adminSource,
      /handleSidebarTabClick\('gallery'\)/,
      'Admin page must include Gallery tab button in sidebar'
    );
    assert.match(
      adminSource,
      /handleSidebarTabClick\('activity'\)/,
      'Admin page must include Content & Activity History tab button in sidebar'
    );

    // Admin tab panels render the components
    assert.match(
      adminSource,
      /adminTab\s*===\s*'blogs'\s*&&\s*<AdminBlogsTab/,
      'Admin page must render AdminBlogsTab when adminTab is blogs'
    );
    assert.match(
      adminSource,
      /adminTab\s*===\s*'gallery'\s*&&\s*<AdminGalleryTab/,
      'Admin page must render AdminGalleryTab when adminTab is gallery'
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
