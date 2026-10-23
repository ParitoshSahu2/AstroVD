import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ContentService } from './content.service.js';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateGalleryItemDto,
  UpdateGalleryItemDto,
} from './content.types.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

// Setup uploads directory path
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage configuration
const multerStorage = diskStorage({
  destination: (_req: any, _file: any, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (_req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}-${sanitizedBase}${ext}`;
    cb(null, uniqueFilename);
  },
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ================= BLOG ENDPOINTS =================

  @Get('blog')
  getBlogPosts(@Query('includeUnpublished') includeUnpublished?: string) {
    const shouldInclude = includeUnpublished === 'true';
    return this.contentService.getBlogPosts(shouldInclude);
  }

  @Get('blog/:id')
  getBlogPostById(@Param('id') id: string) {
    return this.contentService.getBlogPostById(id);
  }

  @Post('blog')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  createBlogPost(@Body() dto: CreateBlogPostDto, @CurrentUser() user: JwtPayload) {
    return this.contentService.createBlogPost(dto, user);
  }

  @Put('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  updateBlogPost(
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentService.updateBlogPost(id, dto, user);
  }

  @Patch('blog/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  toggleBlogPublish(
    @Param('id') id: string,
    @Body() body: { isPublished: boolean },
    @CurrentUser() user: JwtPayload,
  ) {
    const isPublished = body?.isPublished;
    if (typeof isPublished !== 'boolean') {
      throw new BadRequestException('Field "isPublished" must be a boolean');
    }
    return this.contentService.setBlogPostPublishStatus(id, isPublished, user);
  }

  @Delete('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  deleteBlogPost(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contentService.deleteBlogPost(id, user);
  }

  // ================= GALLERY ENDPOINTS =================

  @Get('gallery')
  getGalleryItems(@Query('includeUnpublished') includeUnpublished?: string) {
    const shouldInclude = includeUnpublished === 'true';
    return this.contentService.getGalleryItems(shouldInclude);
  }

  @Get('gallery/:id')
  getGalleryItemById(@Param('id') id: string) {
    return this.contentService.getGalleryItemById(id);
  }

  @Post('gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  createGalleryItem(@Body() dto: CreateGalleryItemDto, @CurrentUser() user: JwtPayload) {
    return this.contentService.createGalleryItem(dto, user);
  }

  @Put('gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  updateGalleryItem(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentService.updateGalleryItem(id, dto, user);
  }

  @Delete('gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  deleteGalleryItem(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contentService.deleteGalleryItem(id, user);
  }

  // ================= IMAGE UPLOAD & SERVING =================

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
          return cb(
            new BadRequestException(
              `Invalid file type '${file.mimetype}'. Supported formats: JPEG, PNG, WebP, GIF, SVG.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: any, @CurrentUser() user: JwtPayload) {
    if (!file) {
      throw new BadRequestException('No image file provided in upload request');
    }

    const relativeUrl = `/api/content/uploads/${file.filename}`;

    this.contentService.logActivity(
      user,
      'GALLERY',
      file.filename,
      file.originalname,
      'UPLOAD_IMAGE',
      `Uploaded image "${file.originalname}" (${(file.size / 1024).toFixed(1)} KB)`,
      { filename: file.filename, size: file.size, mimetype: file.mimetype, url: relativeUrl },
    );

    return {
      success: true,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: relativeUrl,
    };
  }

  @Get('uploads/:filename')
  serveUploadedImage(@Param('filename') filename: string, @Res() res: Response) {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Image '${safeFilename}' not found`);
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(filePath).pipe(res);
  }

  // ================= ADMIN ACTIVITY HISTORY =================

  @Get('activity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  getActivityHistory(
    @Query('contentType') contentType?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contentService.getActivityHistory({
      contentType,
      action,
      limit: limit ? parseInt(limit, 10) : 100,
    });
  }
}
