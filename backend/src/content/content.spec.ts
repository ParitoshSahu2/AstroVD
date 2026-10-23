import { describe, it, expect, beforeEach } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ContentService } from './content.service.js';
import { ContentController } from './content.controller.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('Content Management & Authorization Suite', () => {
  let service: ContentService;
  let controller: ContentController;
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  const mockAdminUser: JwtPayload = {
    sub: 'admin-1',
    email: 'admin@astrovd.com',
    name: 'Admin Test',
    role: 'ADMIN',
  };

  const mockSuperAdminUser: JwtPayload = {
    sub: 'super-1',
    email: 'yash@astrovd.com',
    name: 'Yash Deep (Superadmin)',
    role: 'SUPERADMIN',
  };

  const mockCustomerUser: JwtPayload = {
    sub: 'cust-1',
    email: 'seeker@astrovd.com',
    name: 'Regular Customer',
    role: 'CUSTOMER',
  };

  beforeEach(() => {
    service = new ContentService();
    controller = new ContentController(service);
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  describe('RBAC Security & RolesGuard', () => {
    const createMockContext = (user?: JwtPayload, roles: string[] = ['ADMIN', 'SUPERADMIN']): ExecutionContext => {
      const handler = () => {};
      reflector.get = ((key: string) => (key === 'roles' ? roles : undefined)) as any;

      return {
        getHandler: () => handler,
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user }),
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;
    };

    it('denies access if user is unauthenticated (no user on request)', () => {
      const ctx = createMockContext(undefined);
      expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('denies access if user is a regular customer', () => {
      const ctx = createMockContext(mockCustomerUser);
      expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('allows access for ADMIN role', () => {
      const ctx = createMockContext(mockAdminUser);
      expect(rolesGuard.canActivate(ctx)).toBeTruthy();
    });

    it('allows access for SUPERADMIN role', () => {
      const ctx = createMockContext(mockSuperAdminUser);
      expect(rolesGuard.canActivate(ctx)).toBeTruthy();
    });
  });

  describe('Blog Content Operations', () => {
    it('initializes with seed blog posts', () => {
      const posts = service.getBlogPosts(true);
      expect(posts.length).toBeGreaterThanOrEqual(3);
      expect(posts.some((p) => p.id === 'planetary-transits-2026')).toBe(true);
    });

    it('allows admin to create a new blog post', () => {
      const newPost = service.createBlogPost(
        {
          title: 'Solar Eclipse 2026 Remedial Rituals',
          titleHi: 'सूर्य ग्रहण 2026: उपाय एवं अनुष्ठान',
          category: 'Rituals & Upay',
          categoryHi: 'अनुष्ठान एवं उपाय',
          author: 'Pandit Vishal Dubey',
          authorRole: 'Chief Acharya',
          excerpt: 'Guidance on spiritual chanting and charity during Grahan.',
          excerptHi: 'ग्रहण के दौरान जप और दान की विधियां।',
          content: ['Observe silent japa during the peak eclipse hours.'],
          keyTakeaways: ['Avoid eating during eclipse', 'Perform Shiva japa'],
          isPublished: true,
        },
        mockAdminUser,
      );

      expect(newPost.id).toBeDefined();
      expect(newPost.title).toBe('Solar Eclipse 2026 Remedial Rituals');
      expect(newPost.createdBy?.id).toBe(mockAdminUser.sub);

      const found = service.getBlogPostById(newPost.id);
      expect(found).toBeDefined();
      expect(found.title).toBe(newPost.title);
    });

    it('allows admin to update an existing blog post', () => {
      const posts = service.getBlogPosts(true);
      const targetId = posts[0].id;

      const updated = service.updateBlogPost(
        targetId,
        {
          title: 'Updated Planetary Transits 2026 Guide',
          readTime: '12 min read',
        },
        mockAdminUser,
      );

      expect(updated.title).toBe('Updated Planetary Transits 2026 Guide');
      expect(updated.readTime).toBe('12 min read');
      expect(updated.updatedBy?.email).toBe(mockAdminUser.email);
    });

    it('allows admin to publish and unpublish a blog post', () => {
      const posts = service.getBlogPosts(true);
      const targetId = posts[0].id;

      // Unpublish
      const unpublished = service.setBlogPostPublishStatus(targetId, false, mockAdminUser);
      expect(unpublished.isPublished).toBe(false);

      // Verify excluded from public list
      const publicPosts = service.getBlogPosts(false);
      expect(publicPosts.some((p) => p.id === targetId)).toBe(false);

      // Re-publish
      const republished = service.setBlogPostPublishStatus(targetId, true, mockAdminUser);
      expect(republished.isPublished).toBe(true);

      const publicPostsAfter = service.getBlogPosts(false);
      expect(publicPostsAfter.some((p) => p.id === targetId)).toBe(true);
    });

    it('allows admin to delete a blog post', () => {
      const created = service.createBlogPost(
        {
          title: 'Temporary Post to Delete',
          category: 'General',
          content: ['Temporary test content'],
        },
        mockAdminUser,
      );

      const res = service.deleteBlogPost(created.id, mockAdminUser);
      expect(res.success).toBe(true);

      expect(() => service.getBlogPostById(created.id)).toThrow(NotFoundException);
    });
  });

  describe('Gallery Content Operations', () => {
    it('initializes with seed gallery items', () => {
      const items = service.getGalleryItems(true);
      expect(items.length).toBeGreaterThanOrEqual(4);
      expect(items.some((g) => g.description.includes('Maha Mrityunjaya') || g.title.includes('Maha'))).toBe(true);
    });

    it('allows admin to create a new gallery item', () => {
      const item = service.createGalleryItem(
        {
          title: 'Varanasi Ganga Aarti Special Shanti Yagya',
          titleHi: 'वाराणसी गंगा आरती विशेष शांति यज्ञ',
          category: 'Vedic Rituals',
          imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
          location: 'Dashashwamedh Ghat, Varanasi',
          locationHi: 'दशाश्वमेध घाट, वाराणसी',
          description: 'Auspicious evening offerings performed on the banks of holy Ganga.',
          isPublished: true,
        },
        mockAdminUser,
      );

      expect(item.id).toBeDefined();
      expect(item.title).toContain('Varanasi');
      expect(item.createdBy?.name).toBe(mockAdminUser.name);
    });

    it('allows admin to update a gallery item', () => {
      const items = service.getGalleryItems(true);
      const targetId = items[0].id;

      const updated = service.updateGalleryItem(
        targetId,
        {
          title: 'Updated Sacred Ritual Title',
          location: 'Kedarnath Valley, Uttarakhand',
        },
        mockAdminUser,
      );

      expect(updated.title).toBe('Updated Sacred Ritual Title');
      expect(updated.location).toBe('Kedarnath Valley, Uttarakhand');
    });

    it('allows admin to delete a gallery item', () => {
      const item = service.createGalleryItem(
        {
          title: 'Photo to delete',
          imageUrl: 'https://example.com/test.jpg',
        },
        mockAdminUser,
      );

      const res = service.deleteGalleryItem(item.id, mockAdminUser);
      expect(res.success).toBe(true);
      expect(() => service.getGalleryItemById(item.id)).toThrow(NotFoundException);
    });
  });

  describe('Admin Activity Audit History', () => {
    it('automatically records all admin actions in activity history', () => {
      const initialLogs = service.getActivityHistory({ limit: 5000 });
      const initialCount = initialLogs.length;

      // Perform a blog action
      const post = service.createBlogPost(
        {
          title: 'Audit Log Test Blog',
          category: 'Test Category',
          content: ['Testing audit'],
        },
        mockAdminUser,
      );

      // Perform publish change
      service.setBlogPostPublishStatus(post.id, false, mockSuperAdminUser);

      const logsAfter = service.getActivityHistory({ limit: 5000 });
      expect(logsAfter.length).toBeGreaterThan(initialCount);

      // Check most recent log
      const latest = logsAfter[0];
      expect(latest.contentType).toBe('BLOG');
      expect(latest.action).toBe('UNPUBLISH');
      expect(latest.adminEmail).toBe(mockSuperAdminUser.email);
      expect(latest.adminRole).toBe('SUPERADMIN');
    });

    it('supports filtering activity history by contentType and action', () => {
      // Filter by BLOG
      const blogLogs = service.getActivityHistory({ contentType: 'BLOG' });
      expect(blogLogs.every((l) => l.contentType === 'BLOG')).toBe(true);

      // Filter by GALLERY
      const galleryLogs = service.getActivityHistory({ contentType: 'GALLERY' });
      expect(galleryLogs.every((l) => l.contentType === 'GALLERY')).toBe(true);
    });
  });

  describe('Upload & File Management Validation', () => {
    it('throws BadRequestException if no file is provided in upload', () => {
      expect(() => controller.uploadImage(null, mockAdminUser)).toThrow(BadRequestException);
    });

    it('returns generated relative URL and logs activity when valid file is uploaded', () => {
      const mockFile = {
        filename: '1700000000000-sacred_temple.jpg',
        originalname: 'Sacred Temple.jpg',
        size: 204800,
        mimetype: 'image/jpeg',
      };

      const result = controller.uploadImage(mockFile, mockAdminUser);
      expect(result.success).toBe(true);
      expect(result.url).toBe('/api/content/uploads/1700000000000-sacred_temple.jpg');

      const logs = service.getActivityHistory({ action: 'UPLOAD_IMAGE' });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].details.filename).toBe(mockFile.filename);
    });
  });
});
