import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';
import {
  BlogPost,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  GalleryItem,
  CreateGalleryItemDto,
  UpdateGalleryItemDto,
  AdminActivityRecord,
} from './content.types.js';
import { JwtPayload } from '../auth/decorators/current-user.decorator.js';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly blogFilePath = path.join(this.dataDir, 'blog.json');
  private readonly galleryFilePath = path.join(this.dataDir, 'gallery.json');
  private readonly activityFilePath = path.join(this.dataDir, 'activity.json');

  private blogPosts: BlogPost[] = [];
  private galleryItems: GalleryItem[] = [];
  private activityRecords: AdminActivityRecord[] = [];

  constructor() {
    this.ensureDataDirectory();
    this.loadOrSeedData();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private loadOrSeedData() {
    // 1. Blog posts
    if (fs.existsSync(this.blogFilePath)) {
      try {
        const raw = fs.readFileSync(this.blogFilePath, 'utf-8');
        this.blogPosts = JSON.parse(raw);
      } catch (err) {
        this.logger.error('Failed to parse blog.json, initializing seeds', err);
        this.blogPosts = this.getInitialBlogSeeds();
        this.saveBlogPosts();
      }
    } else {
      this.blogPosts = this.getInitialBlogSeeds();
      this.saveBlogPosts();
    }

    // 2. Gallery items
    if (fs.existsSync(this.galleryFilePath)) {
      try {
        const raw = fs.readFileSync(this.galleryFilePath, 'utf-8');
        this.galleryItems = JSON.parse(raw);
      } catch (err) {
        this.logger.error('Failed to parse gallery.json, initializing seeds', err);
        this.galleryItems = this.getInitialGallerySeeds();
        this.saveGalleryItems();
      }
    } else {
      this.galleryItems = this.getInitialGallerySeeds();
      this.saveGalleryItems();
    }

    // 3. Activity Records
    if (fs.existsSync(this.activityFilePath)) {
      try {
        const raw = fs.readFileSync(this.activityFilePath, 'utf-8');
        this.activityRecords = JSON.parse(raw);
      } catch (err) {
        this.logger.error('Failed to parse activity.json', err);
        this.activityRecords = [];
      }
    } else {
      this.activityRecords = [];
    }
  }

  private saveBlogPosts() {
    try {
      fs.writeFileSync(this.blogFilePath, JSON.stringify(this.blogPosts, null, 2), 'utf-8');
    } catch (err) {
      this.logger.error('Error writing blog.json', err);
    }
  }

  private saveGalleryItems() {
    try {
      fs.writeFileSync(this.galleryFilePath, JSON.stringify(this.galleryItems, null, 2), 'utf-8');
    } catch (err) {
      this.logger.error('Error writing gallery.json', err);
    }
  }

  private saveActivityRecords() {
    try {
      fs.writeFileSync(this.activityFilePath, JSON.stringify(this.activityRecords, null, 2), 'utf-8');
    } catch (err) {
      this.logger.error('Error writing activity.json', err);
    }
  }

  // Activity Logger
  public logActivity(
    user: JwtPayload,
    contentType: 'BLOG' | 'GALLERY',
    itemId: string,
    itemTitle: string,
    action: 'CREATE' | 'UPDATE' | 'PUBLISH' | 'UNPUBLISH' | 'DELETE' | 'UPLOAD_IMAGE',
    summary: string,
    details?: Record<string, any>,
  ) {
    const record: AdminActivityRecord = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      adminId: user?.sub || 'usr-system',
      adminName: user?.name || 'Administrator',
      adminEmail: user?.email || 'admin@astrovd.com',
      adminRole: user?.role || 'ADMIN',
      contentType,
      itemId,
      itemTitle,
      action,
      timestamp: new Date().toISOString(),
      summary,
      details,
    };

    this.activityRecords.unshift(record);
    // Keep last 1000 activity logs
    if (this.activityRecords.length > 1000) {
      this.activityRecords = this.activityRecords.slice(0, 1000);
    }
    this.saveActivityRecords();
    return record;
  }

  // --- BLOG OPERATIONS ---

  getBlogPosts(includeUnpublished = false): BlogPost[] {
    if (fs.existsSync(this.blogFilePath)) {
      try {
        const raw = fs.readFileSync(this.blogFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.blogPosts = parsed;
        }
      } catch (err) {
        this.logger.error('Failed to parse blog.json', err);
      }
    }
    if (includeUnpublished) {
      return [...this.blogPosts];
    }
    return this.blogPosts.filter((post) => post.isPublished !== false);
  }

  getBlogPostById(id: string): BlogPost {
    const post = this.blogPosts.find(
      (p) => p.id === id || p.title.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase(),
    );
    if (!post) {
      throw new NotFoundException(`Blog post with ID '${id}' not found`);
    }
    return post;
  }

  createBlogPost(dto: CreateBlogPostDto, user: JwtPayload): BlogPost {
    const slug = dto.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    const id = `${slug}-${Date.now().toString(36)}`;

    const newPost: BlogPost = {
      id,
      title: dto.title.trim(),
      titleHi: dto.titleHi?.trim() || dto.title.trim(),
      category: dto.category.trim(),
      categoryHi: dto.categoryHi?.trim() || dto.category.trim(),
      author: dto.author?.trim() || user?.name || 'Dr. Pandit Vishal Dubey',
      authorHi: dto.authorHi?.trim() || 'डॉ. पंडित विशाल दुबे',
      authorRole: dto.authorRole?.trim() || 'Vedic Jyotishacharya',
      authorRoleHi: dto.authorRoleHi?.trim() || 'वैदिक ज्योतिषाचार्य',
      date: dto.date?.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateHi: dto.dateHi?.trim() || 'आज',
      readTime: dto.readTime?.trim() || '5 min read',
      readTimeHi: dto.readTimeHi?.trim() || '5 मिनट पठन',
      image: dto.image?.trim() || '/services/kundli.jpg',
      excerpt: dto.excerpt?.trim() || dto.title.trim(),
      excerptHi: dto.excerptHi?.trim() || dto.excerpt?.trim() || dto.title.trim(),
      content: Array.isArray(dto.content) && dto.content.length > 0 ? dto.content : [dto.excerpt?.trim() || dto.title.trim()],
      contentHi: Array.isArray(dto.contentHi) && dto.contentHi.length > 0 ? dto.contentHi : [dto.excerptHi?.trim() || dto.excerpt?.trim() || dto.title.trim()],
      keyTakeaways: Array.isArray(dto.keyTakeaways) ? dto.keyTakeaways : [],
      keyTakeawaysHi: Array.isArray(dto.keyTakeawaysHi) ? dto.keyTakeawaysHi : [],
      isPublished: dto.isPublished !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: user?.sub, name: user?.name, email: user?.email },
    };

    this.blogPosts.unshift(newPost);
    this.saveBlogPosts();

    this.logActivity(
      user,
      'BLOG',
      newPost.id,
      newPost.title,
      'CREATE',
      `Created blog post "${newPost.title}" (${newPost.isPublished ? 'Published' : 'Draft'})`,
      { post: newPost },
    );

    return newPost;
  }

  updateBlogPost(id: string, dto: UpdateBlogPostDto, user: JwtPayload): BlogPost {
    const postIndex = this.blogPosts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      throw new NotFoundException(`Blog post with ID '${id}' not found`);
    }

    const current = this.blogPosts[postIndex];
    const updated: BlogPost = {
      ...current,
      title: dto.title !== undefined ? dto.title.trim() : current.title,
      titleHi: dto.titleHi !== undefined ? dto.titleHi.trim() : current.titleHi,
      category: dto.category !== undefined ? dto.category.trim() : current.category,
      categoryHi: dto.categoryHi !== undefined ? dto.categoryHi.trim() : current.categoryHi,
      author: dto.author !== undefined ? dto.author.trim() : current.author,
      authorHi: dto.authorHi !== undefined ? dto.authorHi.trim() : current.authorHi,
      authorRole: dto.authorRole !== undefined ? dto.authorRole.trim() : current.authorRole,
      authorRoleHi: dto.authorRoleHi !== undefined ? dto.authorRoleHi.trim() : current.authorRoleHi,
      date: dto.date !== undefined ? dto.date.trim() : current.date,
      dateHi: dto.dateHi !== undefined ? dto.dateHi.trim() : current.dateHi,
      readTime: dto.readTime !== undefined ? dto.readTime.trim() : current.readTime,
      readTimeHi: dto.readTimeHi !== undefined ? dto.readTimeHi.trim() : current.readTimeHi,
      image: dto.image !== undefined ? dto.image.trim() : current.image,
      excerpt: dto.excerpt !== undefined ? dto.excerpt.trim() : current.excerpt,
      excerptHi: dto.excerptHi !== undefined ? dto.excerptHi.trim() : current.excerptHi,
      content: Array.isArray(dto.content) ? dto.content : current.content,
      contentHi: Array.isArray(dto.contentHi) ? dto.contentHi : current.contentHi,
      keyTakeaways: Array.isArray(dto.keyTakeaways) ? dto.keyTakeaways : current.keyTakeaways,
      keyTakeawaysHi: Array.isArray(dto.keyTakeawaysHi) ? dto.keyTakeawaysHi : current.keyTakeawaysHi,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : current.isPublished,
      updatedAt: new Date().toISOString(),
      updatedBy: { id: user?.sub, name: user?.name, email: user?.email },
    };

    this.blogPosts[postIndex] = updated;
    this.saveBlogPosts();

    this.logActivity(
      user,
      'BLOG',
      updated.id,
      updated.title,
      'UPDATE',
      `Updated blog post "${updated.title}"`,
      { changes: dto },
    );

    return updated;
  }

  setBlogPostPublishStatus(id: string, isPublished: boolean, user: JwtPayload): BlogPost {
    const post = this.getBlogPostById(id);
    post.isPublished = isPublished;
    post.updatedAt = new Date().toISOString();
    post.updatedBy = { id: user?.sub, name: user?.name, email: user?.email };

    this.saveBlogPosts();

    this.logActivity(
      user,
      'BLOG',
      post.id,
      post.title,
      isPublished ? 'PUBLISH' : 'UNPUBLISH',
      `${isPublished ? 'Published' : 'Unpublished'} blog post "${post.title}"`,
    );

    return post;
  }

  deleteBlogPost(id: string, user: JwtPayload): { success: boolean; message: string } {
    const postIndex = this.blogPosts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      throw new NotFoundException(`Blog post with ID '${id}' not found`);
    }

    const [deleted] = this.blogPosts.splice(postIndex, 1);
    this.saveBlogPosts();

    this.logActivity(
      user,
      'BLOG',
      deleted.id,
      deleted.title,
      'DELETE',
      `Deleted blog post "${deleted.title}"`,
      { deletedPost: deleted },
    );

    return { success: true, message: `Blog post "${deleted.title}" deleted successfully.` };
  }

  // --- GALLERY OPERATIONS ---

  getGalleryItems(includeUnpublished = false): GalleryItem[] {
    if (fs.existsSync(this.galleryFilePath)) {
      try {
        const raw = fs.readFileSync(this.galleryFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.galleryItems = parsed;
        }
      } catch (err) {
        this.logger.error('Failed to parse gallery.json', err);
      }
    }
    if (includeUnpublished) {
      return [...this.galleryItems];
    }
    return this.galleryItems.filter((item) => item.isPublished !== false);
  }

  getGalleryItemById(id: string): GalleryItem {
    const item = this.galleryItems.find((i) => i.id === id);
    if (!item) {
      throw new NotFoundException(`Gallery item with ID '${id}' not found`);
    }
    return item;
  }

  createGalleryItem(dto: CreateGalleryItemDto, user: JwtPayload): GalleryItem {
    const id = `gal-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const categoryLabels: Record<string, { en: string; hi: string }> = {
      pooja: { en: 'Sacred Poojas & Havan', hi: 'वैदिक पूजा व महाहवन' },
      consultation: { en: 'Vedic Consultations', hi: 'वैदिक ज्योतिष परामर्श' },
      yantra: { en: 'Yantras & Gemstones', hi: 'सिद्ध यंत्र एवं रत्न' },
      awards: { en: 'Honors & Recognitions', hi: 'राष्ट्रीय सम्मान व पुरस्कार' },
      kashi: { en: 'Temple Anushthan & Varanasi', hi: 'काशी अनुष्ठान व देवालय' },
    };

    const category = dto.category?.trim() || 'pooja';
    const labelEn = dto.categoryLabel || categoryLabels[category]?.en || 'Sacred Gallery';
    const labelHi = dto.categoryLabelHi || categoryLabels[category]?.hi || 'पावन दर्शन';

    const rawImage = dto.image || (dto as any).imageUrl || '/gallery/IMG_2542.jpg';
    const rawDesc = dto.description?.trim() || dto.title.trim();

    const newItem: GalleryItem = {
      id,
      title: dto.title.trim(),
      titleHi: dto.titleHi?.trim() || dto.title.trim(),
      category,
      categoryLabel: labelEn,
      categoryLabelHi: labelHi,
      image: rawImage.trim(),
      location: dto.location?.trim() || 'Varanasi Sanctum',
      locationHi: dto.locationHi?.trim() || 'वाराणसी, काशी',
      date: dto.date?.trim() || 'Vedic Muhurta',
      dateHi: dto.dateHi?.trim() || 'शुभ मुहूर्त',
      description: rawDesc,
      descriptionHi: dto.descriptionHi?.trim() || rawDesc,
      isPublished: dto.isPublished !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: user?.sub, name: user?.name, email: user?.email },
    };

    this.galleryItems.unshift(newItem);
    this.saveGalleryItems();

    this.logActivity(
      user,
      'GALLERY',
      newItem.id,
      newItem.title,
      'CREATE',
      `Added new gallery entry "${newItem.title}"`,
      { item: newItem },
    );

    return newItem;
  }

  updateGalleryItem(id: string, dto: UpdateGalleryItemDto, user: JwtPayload): GalleryItem {
    const itemIndex = this.galleryItems.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      throw new NotFoundException(`Gallery item with ID '${id}' not found`);
    }

    const current = this.galleryItems[itemIndex];
    const updated: GalleryItem = {
      ...current,
      title: dto.title !== undefined ? dto.title.trim() : current.title,
      titleHi: dto.titleHi !== undefined ? dto.titleHi.trim() : current.titleHi,
      category: dto.category !== undefined ? dto.category.trim() : current.category,
      categoryLabel: dto.categoryLabel !== undefined ? dto.categoryLabel.trim() : current.categoryLabel,
      categoryLabelHi: dto.categoryLabelHi !== undefined ? dto.categoryLabelHi.trim() : current.categoryLabelHi,
      image: dto.image !== undefined ? dto.image.trim() : current.image,
      location: dto.location !== undefined ? dto.location.trim() : current.location,
      locationHi: dto.locationHi !== undefined ? dto.locationHi.trim() : current.locationHi,
      date: dto.date !== undefined ? dto.date.trim() : current.date,
      dateHi: dto.dateHi !== undefined ? dto.dateHi.trim() : current.dateHi,
      description: dto.description !== undefined ? dto.description.trim() : current.description,
      descriptionHi: dto.descriptionHi !== undefined ? dto.descriptionHi.trim() : current.descriptionHi,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : current.isPublished,
      updatedAt: new Date().toISOString(),
      updatedBy: { id: user?.sub, name: user?.name, email: user?.email },
    };

    this.galleryItems[itemIndex] = updated;
    this.saveGalleryItems();

    this.logActivity(
      user,
      'GALLERY',
      updated.id,
      updated.title,
      'UPDATE',
      `Updated gallery entry "${updated.title}"`,
      { changes: dto },
    );

    return updated;
  }

  deleteGalleryItem(id: string, user: JwtPayload): { success: boolean; message: string } {
    const itemIndex = this.galleryItems.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      throw new NotFoundException(`Gallery item with ID '${id}' not found`);
    }

    const [deleted] = this.galleryItems.splice(itemIndex, 1);
    this.saveGalleryItems();

    this.logActivity(
      user,
      'GALLERY',
      deleted.id,
      deleted.title,
      'DELETE',
      `Deleted gallery entry "${deleted.title}"`,
      { deletedItem: deleted },
    );

    return { success: true, message: `Gallery entry "${deleted.title}" deleted successfully.` };
  }

  // --- ADMIN ACTIVITY HISTORY ---

  getActivityHistory(filters?: { contentType?: string; action?: string; limit?: number }): AdminActivityRecord[] {
    let list = [...this.activityRecords];
    if (filters?.contentType) {
      const ct = filters.contentType.toUpperCase();
      list = list.filter((r) => r.contentType === ct);
    }
    if (filters?.action) {
      const act = filters.action.toUpperCase();
      list = list.filter((r) => r.action === act);
    }
    const limit = Number(filters?.limit) || 100;
    return list.slice(0, limit);
  }

  // --- SEED DATA DEFINITIONS ---

  private getInitialBlogSeeds(): BlogPost[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'planetary-transits-2026',
        title: 'Major Planetary Transits of 2026: Navigating Jupiter and Saturn’s Cosmic Shift',
        titleHi: 'वर्ष 2026 के प्रमुख ग्रह गोचर: देवगुरु बृहस्पति एवं शनिदेव का राशि परिवर्तन',
        category: 'Vedic Jyotish',
        categoryHi: 'वैदिक ज्योतिष',
        author: 'Dr. Pandit Vishal Dubey',
        authorHi: 'डॉ. पंडित विशाल दुबे',
        authorRole: 'PhD, Jyotishacharya',
        authorRoleHi: 'पीएचडी, ज्योतिषाचार्य',
        date: 'Oct 14, 2026',
        dateHi: '14 अक्टूबर, 2026',
        readTime: '6 min read',
        readTimeHi: '6 मिनट पठन',
        image: '/services/kundli.jpg',
        excerpt: 'Detailed overview of Jupiter transiting into Cancer and Saturn moving across Pisces, bringing immense opportunities for spiritual transformation and financial realignment.',
        excerptHi: 'कर्क राशि में उच्च के देवगुरु बृहस्पति और मीन राशि में शनिदेव के गोचर का सूक्ष्म विश्लेषण, जो आध्यात्मिक प्रगति एवं आर्थिक समृद्धि के नए द्वार खोलेगा।',
        content: [
          'In Vedic Astrology, planetary transits (Gochar) act as cosmic catalysts that activate the dormant promises inscribed in your Janam Kundli. As we advance through 2026, Jupiter (Brihaspati) occupies its exalted sign of Cancer, radiating benevolence, higher learning, and domestic peace.',
          'Simultaneously, Saturn (Shani Dev) traversing through the water element of Pisces invites deep introspection, karmic settlements, and spiritual grounding. Those experiencing Sade Sati or Kantaka Shani will find this an auspicious time for charitable service, mantra sadhana, and rectifying past life imbalances.',
          'To harness this harmonious frequency, chant the Brihaspati Beej Mantra (ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः) on Thursdays and perform regular Shani Tailabhishek on Saturdays.',
        ],
        contentHi: [
          'वैदिक ज्योतिष में ग्रह गोचर उन ब्रह्मांडीय उत्प्रेरकों का कार्य करते हैं जो आपकी जन्म कुंडली में संचित कर्म फलों को जाग्रत करते हैं। वर्ष 2026 में देवगुरु बृहस्पति अपनी उच्च राशि कर्क में विराजमान होकर आध्यात्मिक ज्ञान, पारिवारिक शांति एवं धन वृद्धि का मार्ग प्रशस्त करेंगे।',
          'वहीं शनिदेव का मीन राशि में संचरण आत्म-निरीक्षण, कर्म शुद्धि और पूर्व जन्म के बंधनों के शमन का समय है।',
        ],
        keyTakeaways: [
          'Jupiter in Cancer blesses genuine spiritual seekers and family expansion.',
          'Saturn in Pisces dissolves rigid ego structures, calling for surrender and patience.',
          'Wearing natural Yellow Sapphire (Pukhraj) or Blue Sapphire should only follow birth chart verification.',
        ],
        keyTakeawaysHi: [
          'कर्क में गुरु का उच्च प्रभाव साधकों को ज्ञान, संतान सुख व गृह शांति प्रदान करता है।',
          'मीन में शनि अहंकार को मिटाकर आत्म-समर्पण एवं धैर्य की परीक्षा लेते हैं।',
        ],
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tarot-wisdom-intuitive-guide',
        title: 'The Language of the Cards: How Intuitive Tarot Bridges Past, Present & Future',
        titleHi: 'कार्ड्स की दिव्य भाषा: अंतर्ज्ञान व टैरो से जीवन के महत्वपूर्ण निर्णयों में स्पष्टता',
        category: 'Tarot Wisdom',
        categoryHi: 'टैरो ज्ञान',
        author: 'Madhuri Dubey',
        authorHi: 'माधुरी दुबे',
        authorRole: 'Tarot Card Reader & Spiritual Guide',
        authorRoleHi: 'टैरो रीडर एवं आध्यात्मिक मार्गदर्शक',
        date: 'Oct 11, 2026',
        dateHi: '11 अक्टूबर, 2026',
        readTime: '5 min read',
        readTimeHi: '5 मिनट पठन',
        image: '/services/consultation.jpg',
        excerpt: 'How archetypal symbolism in the Major Arcana activates inner intuition, resolves subconscious anxieties, and provides reassurance during life-altering transitions.',
        excerptHi: 'मेजर अरकाना के 22 प्रतीकों द्वारा अवचेतन भय का निवारण और जीवन के कठिन मोड़ों पर आत्मबल एवं दिशा-निर्देश प्राप्त करने का रहस्य।',
        content: [
          'Tarot is not fortune-telling; it is a sacred mirror reflecting the unconscious currents of the soul. Each card in the 78-card deck represents an archetype of human consciousness, as mapped by Carl Jung and ancient mystical traditions.',
          'When you ask a question regarding love, career, or spiritual dilemma, the cards drawn mirror your vibrational resonance in that exact moment. They illuminate hidden motives, highlight blindspots, and unveil the highest probable trajectory.',
        ],
        contentHi: [
          'टैरो केवल भविष्य जानने का साधन नहीं, अपितु आत्मा के अवचेतन प्रवाह को दर्शाने वाला एक पावन दर्पण है। 78 कार्ड्स की यह प्रणाली मानवीय चेतना की विविध अवस्थाओं को प्रतिबिंबित करती है।',
        ],
        keyTakeaways: [
          'Tarot clarifies the emotional energy surrounding your present circumstances.',
          'Open-ended inquiry unlocks far deeper subconscious resolution than binary yes/no questions.',
        ],
        keyTakeawaysHi: [
          'टैरो आपकी वर्तमान भावनात्मक ऊर्जा व अवचेतन शंकाओं को स्पष्ट करता है।',
        ],
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'rudraksha-consecration-science',
        title: 'The Science of Prana Pratishtha: How Natural Rudraksha Beads Are Energized in Kashi',
        titleHi: 'प्राण-प्रतिष्ठा का शास्त्रीय विज्ञान: काशी में रुद्राक्ष एवं वैदिक रत्नों का दिव्य सिद्धिकरण',
        category: 'Spiritual Remedies',
        categoryHi: 'आध्यात्मिक उपाय',
        author: 'Acharya Sourabh Swami Ji',
        authorHi: 'आचार्य सौरभ स्वामी जी',
        authorRole: 'Kashi Peeth Karmakand Specialist',
        authorRoleHi: 'काशी पीठ कर्मकांड मर्मज्ञ',
        date: 'Oct 07, 2026',
        dateHi: '7 अक्टूबर, 2026',
        readTime: '7 min read',
        readTimeHi: '7 मिनट पठन',
        image: '/services/gemstones.jpg',
        excerpt: 'Step-by-step exposition of Panchamrit snan, Beej mantra nyasa, and Agni Havanam performed to align mineral electromagnetic vibrations with the seeker’s biofield.',
        excerptHi: 'पंचामृत स्नान, न्यास, और बीज मंत्र आहुतियों द्वारा रुद्राक्ष व रत्नों की सूक्ष्म ऊर्जा को जाग्रत करने की प्रामाणिक वैदिक पद्धति।',
        content: [
          'A sacred bead or gemstone unaligned with personal planetary frequencies remains physically beautiful yet energetically dormant. In the sanctified ghats of Kashi, our Acharyas conduct rigorous 108-cycle Prana Pratishtha according to the Shukla Yajurveda Samhita.',
          'The ritual commences at Brahma Muhurta with Shodashopachara pujan, followed by infusion of the specific planetary Gayatri and Beej Mantras.',
        ],
        contentHi: [
          'बिना प्राण-प्रतिष्ठा के धारण किया गया रत्न अथवा रुद्राक्ष केवल एक आभूषण मात्र रहता है। काशी के पावन तट पर यजुर्वेदीय पद्धति से 108 बार वैदिक मंत्रों की आहुति देकर रत्न में प्राण-ऊर्जा संचरित की जाती है।',
        ],
        keyTakeaways: [
          'Prana Pratishtha aligns the natural electromagnetic frequency of organic rudraksha with the wearer.',
          'Consecration includes personal Sankalp reciting your Gotra and Nakshatra.',
        ],
        keyTakeawaysHi: [
          'प्राण-प्रतिष्ठा रुद्राक्ष की चुंबकीय ऊर्जा को धारक के औरा से जोड़ती है।',
        ],
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private getInitialGallerySeeds(): GalleryItem[] {
    const now = new Date().toISOString();
    return [
      {
        id: '1',
        title: 'Grand Shat Chandi Maha Yagya & Sacred Havan',
        titleHi: 'काशी विश्वनाथ में भव्य शतचंडी महायज्ञ एवं पावन हवन',
        category: 'pooja',
        categoryLabel: 'Sacred Poojas & Havan',
        categoryLabelHi: 'वैदिक पूजा व महाहवन',
        image: '/gallery/IMG_2542.jpg',
        location: 'Dashashwamedh Sanctum, Varanasi',
        locationHi: 'दशाश्वमेध घाट, वाराणसी',
        date: 'Vasant Navratri Muhurta',
        dateHi: 'चैत्र वसंत नवरात्रि मुहूर्त',
        description: 'Dr. Pandit Vishal Dubey presiding over a consecrated Vedic Havan along with initiated pandits and seeker families.',
        descriptionHi: 'विश्व शांति एवं यजमान कल्याण हेतु 11 दीक्षित वैदिक आचार्यों द्वारा दुर्गा सप्तशती के संपुटित पाठ एवं महाहवन।',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '2',
        title: 'National Media & TV Discourses (ETV Bharat & Hindustan Mail)',
        titleHi: 'राष्ट्रीय समाचार चैनलों पर डॉ. विशाल दुबे जी की ज्योतिष परिचर्चा',
        category: 'consultation',
        categoryLabel: 'Vedic Consultations',
        categoryLabelHi: 'वैदिक ज्योतिष परामर्श',
        image: '/gallery/IMG_2537.jpg',
        location: 'National Broadcast Studios (ETV Bharat & Prime Talk)',
        locationHi: 'राष्ट्रीय प्रसारण स्टूडियो (ईटीवी भारत एवं प्राइम टॉक)',
        date: 'Televised Special Series',
        dateHi: 'विशेष टीवी प्रसारण श्रृंखला',
        description: 'Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) unraveling horoscope configurations and prescribing targeted planetary remedies on national television.',
        descriptionHi: 'स्वर्ण पदक विजेता डॉ. पंडित विशाल दुबे (AstroVD) द्वारा कुंडली विश्लेषण एवं शास्त्रोक्त सटीक उपायों का प्रत्यक्ष निरूपण।',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '3',
        title: 'Grand Temple Anushthan at Sacred Kashi Vishwanath Sanctum',
        titleHi: 'श्री काशी विश्वनाथ पावन परिक्षेत्र में भव्य वैदिक अनुष्ठान',
        category: 'kashi',
        categoryLabel: 'Temple Anushthan & Varanasi',
        categoryLabelHi: 'काशी अनुष्ठान व देवालय',
        image: '/gallery/WhatsApp-Image-2024-09-30-at-5.31.21-PM-2-1024x682.jpeg',
        location: 'Kashi Vishwanath Corridor, Varanasi',
        locationHi: 'श्री काशी विश्वनाथ कॉरिडोर, वाराणसी',
        date: 'Mahashivratri & Navratri Mahotsav',
        dateHi: 'महाशिवरात्रि एवं नवरात्र महोत्सव',
        description: 'Sacred Rudrabhishek oblations and high-energy Vedic peace mantras in the holy corridor of Varanasi.',
        descriptionHi: 'द्वादश ज्योतिर्लिंग काशी विश्वनाथ की पुण्यधरा पर रुद्राभिषेक एवं नवग्रह शांति का दिव्य शास्त्रीय अनुष्ठान।',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '4',
        title: 'Consecrated Rudraksha & Talisman Energization Ritual',
        titleHi: 'सिद्ध रुद्राक्ष एवं सुरक्षा कवच प्राण-प्रतिष्ठा अनुष्ठान',
        category: 'yantra',
        categoryLabel: 'Yantras & Gemstones',
        categoryLabelHi: 'सिद्ध यंत्र एवं रत्न',
        image: '/gallery/WhatsApp-Image-2024-09-30-at-5.32.17-PM-1-1024x682.jpeg',
        location: 'Varanasi Peeth Shivalaya',
        locationHi: 'वाराणसी पीठ शिवालय',
        date: 'Purnima Consecration Muhurta',
        dateHi: 'पूर्णिमा सिद्धि मुहूर्त',
        description: 'Maha Mrityunjaya and Beej Mantra consecration for energized gemstones and protection talismans.',
        descriptionHi: 'प्राकृतिक रत्नों एवं रुद्राक्ष मनकों पर 108 महामृत्युंजय मंत्रों की आहुति द्वारा अभिमंत्रण।',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '5',
        title: 'Gold Medal Award Ceremony & Vedic Scholarly Honors',
        titleHi: 'अखिल भारतीय ज्योतिष महासम्मेलन में स्वर्ण पदक एवं सम्मान',
        category: 'awards',
        categoryLabel: 'Honors & Recognitions',
        categoryLabelHi: 'राष्ट्रीय सम्मान व पुरस्कार',
        image: '/gallery/WhatsApp-Image-2024-09-30-at-5.32.20-PM-1-1024x682.jpeg',
        location: 'National Vedic Convention Auditorium',
        locationHi: 'राष्ट्रीय वैदिक सम्मेलन सभागार',
        date: 'All India Jyotish Conclave',
        dateHi: 'अखिल भारतीय ज्योतिष महासम्मेलन',
        description: 'Prestigious gold medal and Vidya Vachaspati honors conferred upon Dr. Pandit Vishal Dubey for exemplary Jyotish research.',
        descriptionHi: 'ज्योतिष शोध एवं जनसेवा में अद्वितीय योगदान हेतु पूज्य पंडित जी को गोल्ड मेडल प्रदान किया गया।',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }
}
