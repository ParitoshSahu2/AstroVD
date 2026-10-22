import { ProductItem, PRODUCTS_CATALOG, getProductById, getRelatedProducts } from '../data/products';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

export interface ProductsQueryOptions {
  category?: string;
  search?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'newest';
  page?: number;
  limit?: number;
  lang?: 'en' | 'hi';
}

export interface ProductsResponse {
  data: ProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isBackendSource?: boolean;
}

export interface ProductDetailResponse extends ProductItem {
  relatedProducts?: ProductItem[];
  isBackendSource?: boolean;
}

export interface CategorySummary {
  id: string;
  label: string;
  count: number;
}

/**
 * GET /products with filters, search, pagination, and ?lang=hi
 * Replaces pure static mock data with live NestJS backend data with seamless fallback.
 */
export async function fetchProducts(
  options: ProductsQueryOptions = {},
): Promise<ProductsResponse> {
  const {
    category,
    search,
    q,
    minPrice,
    maxPrice,
    inStock,
    featured,
    sort,
    page = 1,
    limit = 12,
    lang = 'en',
  } = options;

  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (search || q) params.set('search', (search || q || '').trim());
  if (minPrice !== undefined) params.set('minPrice', String(minPrice));
  if (maxPrice !== undefined) params.set('maxPrice', String(maxPrice));
  if (inStock !== undefined) params.set('inStock', String(inStock));
  if (featured !== undefined) params.set('featured', String(featured));
  if (sort) params.set('sort', sort);
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  if (lang) params.set('lang', lang);

  try {
    const res = await fetch(`${BACKEND_URL}/products?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const json = await res.json();
    return {
      data: json.data || [],
      total: json.total || (json.data ? json.data.length : 0),
      page: json.page || page,
      limit: json.limit || limit,
      totalPages: json.totalPages || 1,
      hasNextPage: Boolean(json.hasNextPage),
      hasPrevPage: Boolean(json.hasPrevPage),
      isBackendSource: true,
    };
  } catch (err) {
    // Client/SSR fallback ensures platform stability
    console.warn('Backend /products unavailable, using resilient client fallback:', err);
    return fallbackFilterProducts(options);
  }
}

/**
 * GET /products/:slug with ?lang=hi
 * Fetches product details and related items by slug or ID.
 */
export async function fetchProductBySlug(
  slugOrId: string,
  lang: 'en' | 'hi' = 'en',
): Promise<ProductDetailResponse | null> {
  if (!slugOrId) return null;

  try {
    const res = await fetch(
      `${BACKEND_URL}/products/${encodeURIComponent(slugOrId)}?lang=${lang}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 },
      },
    );

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        isBackendSource: true,
      };
    }
  } catch (err) {
    console.warn(`Backend /products/${slugOrId} unavailable, using resilient fallback:`, err);
  }

  // Resilient fallback
  const fallback = getProductById(slugOrId);
  if (!fallback) return null;

  const related = getRelatedProducts(fallback.id, 4);

  return {
    ...fallback,
    name: lang === 'hi' && fallback.nameHi ? fallback.nameHi : fallback.name,
    tag: lang === 'hi' && fallback.tagHi ? fallback.tagHi : fallback.tag,
    desc: lang === 'hi' && fallback.descHi ? fallback.descHi : fallback.desc,
    categoryLabel: lang === 'hi' && fallback.categoryLabelHi ? fallback.categoryLabelHi : fallback.categoryLabel,
    planet: lang === 'hi' && fallback.planetHi ? fallback.planetHi : fallback.planet,
    chakra: lang === 'hi' && fallback.chakraHi ? fallback.chakraHi : fallback.chakra,
    dayToWear: lang === 'hi' && fallback.dayToWearHi ? fallback.dayToWearHi : fallback.dayToWear,
    beadSize: lang === 'hi' && fallback.beadSizeHi ? fallback.beadSizeHi : fallback.beadSize,
    relatedProducts: related.map((r) => ({
      ...r,
      name: lang === 'hi' && r.nameHi ? r.nameHi : r.name,
      tag: lang === 'hi' && r.tagHi ? r.tagHi : r.tag,
      desc: lang === 'hi' && r.descHi ? r.descHi : r.desc,
    })),
    isBackendSource: false,
  };
}

/**
 * GET /products/categories with ?lang=hi
 */
export async function fetchCategories(lang: 'en' | 'hi' = 'en'): Promise<CategorySummary[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/products/categories?lang=${lang}`, {
      next: { revalidate: 120 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend /products/categories unavailable, using fallback categories');
  }

  return [
    { id: 'all', label: lang === 'hi' ? `सभी ब्रेसलेट (${PRODUCTS_CATALOG.length})` : `All Bracelets (${PRODUCTS_CATALOG.length})`, count: PRODUCTS_CATALOG.length },
    { id: 'wealth', label: lang === 'hi' ? 'धन एवं समृद्धि' : 'Wealth & Prosperity', count: PRODUCTS_CATALOG.filter(p => p.category === 'wealth').length },
    { id: 'protection', label: lang === 'hi' ? 'सुरक्षा एवं नज़र दोष' : 'Protection & Nazar', count: PRODUCTS_CATALOG.filter(p => p.category === 'protection').length },
    { id: 'love', label: lang === 'hi' ? 'प्रेम एवं शांति' : 'Love & Peace', count: PRODUCTS_CATALOG.filter(p => p.category === 'love').length },
    { id: 'healing', label: lang === 'hi' ? 'आरोग्य एवं संतुलन' : 'Healing & Balance', count: PRODUCTS_CATALOG.filter(p => p.category === 'healing').length },
  ];
}

/**
 * Client-side fallback computation matching backend filtering and localization logic
 */
function fallbackFilterProducts(options: ProductsQueryOptions): ProductsResponse {
  const {
    category,
    search,
    q,
    sort,
    page = 1,
    limit = 12,
    lang = 'en',
  } = options;

  let filtered = [...PRODUCTS_CATALOG];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  const query = (search || q || '').trim().toLowerCase();
  if (query) {
    filtered = filtered.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        (p.nameHi && p.nameHi.includes(query)) ||
        p.desc.toLowerCase().includes(query) ||
        (p.descHi && p.descHi.includes(query)) ||
        p.tag.toLowerCase().includes(query) ||
        p.planet.toLowerCase().includes(query)
      );
    });
  }

  if (sort) {
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * limit;
  const pageItems = filtered.slice(startIndex, startIndex + limit);

  const localizedItems: ProductItem[] = pageItems.map((p) => ({
    ...p,
    name: lang === 'hi' && p.nameHi ? p.nameHi : p.name,
    tag: lang === 'hi' && p.tagHi ? p.tagHi : p.tag,
    desc: lang === 'hi' && p.descHi ? p.descHi : p.desc,
    categoryLabel: lang === 'hi' && p.categoryLabelHi ? p.categoryLabelHi : p.categoryLabel,
    planet: lang === 'hi' && p.planetHi ? p.planetHi : p.planet,
    chakra: lang === 'hi' && p.chakraHi ? p.chakraHi : p.chakra,
    dayToWear: lang === 'hi' && p.dayToWearHi ? p.dayToWearHi : p.dayToWear,
    beadSize: lang === 'hi' && p.beadSizeHi ? p.beadSizeHi : p.beadSize,
  }));

  return {
    data: localizedItems,
    total,
    page: safePage,
    limit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    isBackendSource: false,
  };
}
