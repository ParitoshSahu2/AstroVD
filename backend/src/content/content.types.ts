import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export interface BlogPost {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  categoryHi: string;
  author: string;
  authorHi: string;
  authorRole: string;
  authorRoleHi: string;
  date: string;
  dateHi: string;
  readTime: string;
  readTimeHi: string;
  image: string;
  excerpt: string;
  excerptHi: string;
  content: string[];
  contentHi: string[];
  keyTakeaways: string[];
  keyTakeawaysHi: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string };
  updatedBy?: { id: string; name: string; email: string };
}

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleHi?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  categoryHi?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  authorHi?: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsOptional()
  @IsString()
  authorRoleHi?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  dateHi?: string;

  @IsOptional()
  @IsString()
  readTime?: string;

  @IsOptional()
  @IsString()
  readTimeHi?: string;

  @IsString()
  image: string;

  @IsString()
  excerpt: string;

  @IsOptional()
  @IsString()
  excerptHi?: string;

  @IsArray()
  content: string[];

  @IsOptional()
  @IsArray()
  contentHi?: string[];

  @IsOptional()
  @IsArray()
  keyTakeaways?: string[];

  @IsOptional()
  @IsArray()
  keyTakeawaysHi?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  titleHi?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryHi?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  authorHi?: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsOptional()
  @IsString()
  authorRoleHi?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  dateHi?: string;

  @IsOptional()
  @IsString()
  readTime?: string;

  @IsOptional()
  @IsString()
  readTimeHi?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  excerptHi?: string;

  @IsOptional()
  @IsArray()
  content?: string[];

  @IsOptional()
  @IsArray()
  contentHi?: string[];

  @IsOptional()
  @IsArray()
  keyTakeaways?: string[];

  @IsOptional()
  @IsArray()
  keyTakeawaysHi?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleHi: string;
  category: 'pooja' | 'consultation' | 'yantra' | 'awards' | 'kashi' | string;
  categoryLabel: string;
  categoryLabelHi: string;
  image: string;
  location: string;
  locationHi: string;
  date: string;
  dateHi: string;
  description: string;
  descriptionHi: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string };
  updatedBy?: { id: string; name: string; email: string };
}

export class CreateGalleryItemDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleHi?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  categoryLabelHi?: string;

  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  locationHi?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  dateHi?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  descriptionHi?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateGalleryItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  titleHi?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  categoryLabelHi?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  locationHi?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  dateHi?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionHi?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export interface AdminActivityRecord {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  contentType: 'BLOG' | 'GALLERY';
  itemId: string;
  itemTitle: string;
  action: 'CREATE' | 'UPDATE' | 'PUBLISH' | 'UNPUBLISH' | 'DELETE' | 'UPLOAD_IMAGE';
  timestamp: string;
  summary: string;
  details?: Record<string, any>;
}
