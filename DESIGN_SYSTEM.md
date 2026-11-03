# AstroVD Design System & UI Specification

> **Status:** Canonical & Permanent  
> **Target Audience:** Frontend Developers, UI/UX Designers, AI Coding Assistants  
> **Core Aesthetic:** Clean, Modern, Premium Vedic Astrology Sanctum  
> **Primary Visual Direction:** Warm Cream Parchment, Sacred Terracotta / Deep Maroon, and Champagne-Gold

---

## 1. Visual Direction & Design Philosophy

AstroVD bridges ancient Vedic Jyotish wisdom with a world-class, modern digital sanctum. The design language evokes trust, spiritual sanctity, and premium craftsmanship without succumbing to cluttered, dated astrology website tropes.

### Core Tenets
1. **Sanctity through Restraint:** Clean, uncluttered layouts with disciplined white/cream breathing room.
2. **Warm Earth & Gold Tones:** Soft parchment cream surfaces, rich terracotta/maroon accents, and fine champagne-gold highlights.
3. **High Operational Density in Portals:** Admin and customer dashboards emphasize clarity, fast scanning, responsive tables, and first-viewport accessibility.
4. **Strict Aesthetics Anti-Patterns:**
   - ❌ **NO** dark neon purple backgrounds, galaxy overlays, or psychedelic starfields.
   - ❌ **NO** heavy green themes (emerald is reserved solely for verified/active states).
   - ❌ **NO** aggressive, unbranded gradients or saturated neon colors.
   - ❌ **NO** excessive, muddy dropshadows or heavy black borders.
   - ❌ **NO** distracting, oversized decorative icons or animated GIF sparkles.

---

## 2. Color Palette & Token Usage

### 2.1 Surfaces & Backgrounds
| Token / Hex | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- |
| `#F5EFE6` | `bg-[#F5EFE6]` | **Canonical Global Background**: Body background for public website, hero light sections, and footer. |
| `#FFFDF9` / `#FFFFFF` | `bg-[#FFFDF9]`, `bg-white` | **Primary Card & Modal Surface**: Elevates cards, dialogs, forms, and product details. |
| `#FAF7F2` | `bg-[#FAF7F2]` | **Dashboard Canvas**: Clean, soothing canvas for `/admin` and `/dashboard` screens. |
| `#FAF8F5` | `bg-[#FAF8F5]` | **Ticket / Pass Inset Background**: Used for consultation passes, receipt summaries, and highlighted panels. |
| `#1C090C` → `#2A0E13` | `from-[#1C090C] via-[#2A0E13]` | **Sacred Dark Hero Canvas**: Dark header bands and banner headers for consultation sanctums. |

### 2.2 Brand & Primary Accent (Terracotta & Maroon)
| Token / Hex | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- |
| `#5B0D15` | `text-[#5B0D15]`, `bg-[#5B0D15]` | **Sacred Terracotta / Deep Maroon**: Primary brand color. Primary CTA buttons, key headings, active link states. |
| `#7A1824` / `#7B121C` | `bg-[#7A1824]`, `text-[#7B121C]` | **Secondary Terracotta**: Hover states, badge borders, and gradient stops with `#5B0D15`. |
| `#8B1D2C` | `text-[#8B1D2C]`, `bg-[#8B1D2C]` | **Deep Ruby Accent**: Active sidebar tabs, modal scrollbar thumbs, and emphasized price numbers. |
| `#3B1E22` | `text-[#3B1E22]` | **Deep Wood Maroon**: Primary heading color on light/cream surfaces. |
| `#FDF2F4` | `bg-[#FDF2F4]` | **Active Tab Surface**: Subtle tinted background for active sidebar navigation links. |

### 2.3 Divine Champagne-Gold Accents
| Token / Hex | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- |
| `#D4AF37` | `border-[#D4AF37]`, `text-[#D4AF37]` | **Champagne Gold**: Focus rings, premium card highlights, mandala borders, and modal borders. |
| `#D8B28A` | `text-[#D8B28A]` | **Muted Gold**: Subtitle tracking badges (`DIVINE JYOTISH • 1-ON-1 VEDIC GUIDANCE`). |
| `#C27827` / `#D97706` | `text-[#C27827]`, `text-amber-600` | **Warm Amber Gold**: Icons, secondary badges, rating stars, and subtle border accents. |
| `#FEF3C7` / `#FFFBEB` | `bg-amber-50`, `bg-amber-100` | **Warm Gold Tint**: Notification backgrounds, subtle chips, and Vedic category tags. |

### 2.4 Neutral & Typographic Palette
| Token / Hex | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- |
| `#1C1917` | `text-stone-900` | High-contrast body text and titles. |
| `#282C3F` / `#212121` | `text-[#282C3F]` | Product card brand headings and bold price tags (Myntra-style Assistant stack). |
| `#535766` / `#57534E` | `text-stone-600`, `text-[#535766]` | Subtitles, product category descriptions, and form guidance notes. |
| `#78716C` / `#878787` | `text-stone-500`, `text-[#878787]` | Strikethrough original prices, metadata labels, and timestamps. |
| `#A8A29E` / `#D6D3D1` | `text-stone-400`, `border-stone-300` | Hairline card borders, divider lines, and input placeholders. |
| `#E7E5E4` / `#F5F5F4` | `bg-stone-100`, `border-stone-200` | Subtle pill backgrounds, table dividers, and disabled input states. |

### 2.5 Semantic & Operational Accents
| Role | Background | Text | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Verified / Active** | `bg-emerald-50` / `bg-emerald-100` | `text-emerald-800` | `border-emerald-200` | Active services, verified payments, confirmed bookings, live Google Meet sessions. |
| **Pending / Caution** | `bg-amber-50` / `bg-amber-100` | `text-amber-900` | `border-amber-300` | Pending approvals, processing orders, session unlock timers. |
| **Destructive / Error** | `bg-rose-50` / `bg-rose-100` | `text-rose-800` | `border-rose-200` | Form errors, cancelled sessions, delete modals, banned accounts. |
| **Admin / Special Role**| `bg-purple-50` / `bg-purple-100` | `text-purple-900` | `border-purple-200` | Superadmin badges, featured star tags (`★ FEATURED`). |

---

## 3. Typography & Hierarchy

### 3.1 Font Stacks
1. **Display & Headings (Vedic Classical Serif):**  
   `font-serif` (`Cinzel`, `Playfair Display`, `Georgia`, serif)  
   Used for: Page headings, section titles, spiritual quotes, and modal hero titles.
2. **Body & Interface (Clean Sans-Serif):**  
   `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`, `Geist Sans`  
   Used for: Navigation links, body copy, form labels, buttons, and dashboard metrics.
3. **Product Catalog & E-Commerce (Assistant Stack):**  
   `'Assistant', -apple-system, BlinkMacSystemFont, sans-serif`  
   Used for: Product cards, brand labels, currency figures, and discount tags.
4. **Code & Reference Tokens (Monospace):**  
   `font-mono` (`Geist Mono`, monospace)  
   Used for: Reference IDs (`#AVD-...`), meeting URLs, order numbers, and timestamp codes.

### 3.2 Scale & Hierarchy Reference
| Level | Font Size | Weight | Line Height | Tracking | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | `32px` - `44px` (`text-3xl sm:text-4xl lg:text-[44px]`) | `font-bold` (700) | `1.15` - `1.2` | `tracking-tight` | Landing heroes, PageHeader banner titles |
| **Section Title (H2)** | `24px` - `30px` (`text-2xl sm:text-3xl`) | `font-bold` (700) | `1.25` | `tracking-tight` | Section headers, major modal titles |
| **Card Title (H3)** | `17px` - `19px` (`text-[17px] sm:text-[19px]`) | `font-semibold` (600) | `1.3` | `tracking-tight` | Service card titles, preview headlines |
| **Product Title** | `16px` (`text-base`) | `font-bold` (700) | `1.2` | `-0.1px` | Consecrated item card brand title |
| **Body (Default)** | `14px` (`text-sm`) | `font-normal` (400) | `1.5` - `1.6` | Normal | Paragraph text, consultation summaries |
| **Compact / Meta** | `12px` - `13px` (`text-xs sm:text-[13px]`) | `font-medium` (500) | `1.4` | Normal | Table values, card descriptions, guide names |
| **Micro / Badges** | `10px` - `11px` (`text-[10px] sm:text-[11px]`) | `font-bold` (700) | `1.2` | `tracking-wider uppercase` | Status pills, categories, reference IDs |

---

## 4. Spacing, Grid & Alignment Rules

### 4.1 Page Layout Grid
- **Public Page Max-Width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-12` (standard 1280px container).
- **Focused Forms & Confirmations:** `max-w-2xl mx-auto` or `max-w-3xl mx-auto` (avoids overly wide, difficult-to-read form rows).
- **Admin & Dashboard Content:** `w-full px-4 sm:px-8 py-6 sm:py-8` within `flex-1 md:pl-64`.

### 4.2 Vertical Cadence (Section Spacing)
- **Public Landing Page Sections:** `py-12 sm:py-16 md:py-20` (generous spiritual breathing room).
- **Inner Content & Sub-pages:** `py-8 sm:py-12`.
- **Dashboards & Confirmation Passes:** `py-5 sm:py-7` with compact hero banners (`min-h-[140px]`) to maintain first-viewport accessibility.

### 4.3 Standard Spacing Scale (8px Grid Alignment)
- `gap-1.5` / `gap-2` (6px - 8px): Micro-elements, badge dots, inline icons.
- `gap-3` / `gap-4` (12px - 16px): Input field groups, card internal rows, button pairings.
- `gap-6` (24px): Grid column gaps in 2-column or 3-column service/product layouts.
- `gap-8` (32px): Major layout divisions (sidebar vs. content area).

### 4.4 Text Alignment Principles
- **Left-Aligned (Default):** All body text, form fields, table columns, card descriptions, and dashboard metrics.
- **Centered:** Section intro badges (`✦ DIVINE JYOTISH ✦`), modal headers, and dedicated single-column ticket passes.
- **Numeric & Price Alignment:** Right-aligned or flex-between aligned in receipts, tables, and product summary lines.

---

## 5. Component Styling Specifications

### 5.1 Buttons

#### Primary Button
- **Classes:** `px-5 py-2.5 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-950/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] cursor-pointer`
- **Application:** "Book Consultation", "Proceed to Checkout", "Confirm Reservation", "Save Changes".

#### Secondary / Neutral Button
- **Classes:** `px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition-all hover:border-stone-400 cursor-pointer`
- **Application:** "Cancel", "Book Another Service", "Clear Filters", "Back to Website".

#### Subtle / Icon Action Button
- **Classes:** `p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer`
- **Destructive Icon Button:** `p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer`

### 5.2 Input Fields & Selects
- **Base Input Container:**
  ```html
  <div className="relative">
    <Icon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
    <input
      type="text"
      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-2xs transition-all disabled:opacity-60"
    />
  </div>
  ```
- **Label Standard:** `block text-xs font-semibold text-stone-700 mb-1`
- **Helper / Error Note:** `text-[11px] text-stone-500 mt-1` or `text-[11px] text-rose-600 font-medium mt-1`

### 5.3 Cards & Content Containers
- **Public Showcase Cards:**
  `rounded-3xl overflow-hidden bg-white border border-amber-200/90 shadow-sm hover:border-amber-400/70 hover:shadow-md transition-all`
- **Dashboard Admin Cards:**
  `p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-amber-300/60 shadow-2xs transition-all`
- **Vedic Reservation Ticket / Summary Inset:**
  `rounded-2xl bg-[#FAF8F5] border border-stone-200/80 p-4 sm:p-5 text-xs space-y-2.5 shadow-2xs`

### 5.4 Modals & Dialogs
- **Backdrop:**  
  `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn modal-backdrop-contain overscroll-contain`
- **Dialog Box:**  
  `bg-[#FFFDF9] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain shadow-2xl relative space-y-5 modal-scroll-container`
- **Scroll Handling Requirement:**  
  Modals must invoke `useScrollLock(isOpen)` and include `data-lenis-prevent="true"` with `overscroll-contain` to eliminate scroll-chaining to the underlying page.

### 5.5 Tables & Data Grids
- **Container:** `overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-2xs`
- **Table Head (`<thead>`):** `bg-stone-50/80 border-b border-stone-200 text-left text-[11px] font-bold text-stone-500 uppercase tracking-wider`
- **Table Row (`<tr>`):** `border-b border-stone-100 hover:bg-amber-50/40 transition-colors`
- **Table Cell (`<td>`):** `py-3 px-3.5 text-xs text-stone-700 align-middle`
- **Responsive Table Rule:** On screens under `768px`, data tables must either switch to clean mobile card layouts or allow smooth touch horizontal panning without breaking page bounds.

---

## 6. Border Radius, Shadows & Borders

### 6.1 Border Radii
- `rounded-lg` (8px): Filter chips, compact dropdown items.
- `rounded-xl` (12px): Standard buttons, input fields, avatar containers.
- `rounded-2xl` (16px): Service cards, order item summaries, ticket insets.
- `rounded-3xl` (24px): Master page cards, modal dialogs, hero containers.
- `rounded-full` (9999px): Status pills, verification chips, circular avatars.

### 6.2 Shadows & Elevation
- **Elevated Cards:** `shadow-sm` or `shadow-md shadow-stone-900/5` (soft, light, natural).
- **Floating Bar (Navbar / Checkout Button):**  
  `shadow-xl shadow-rose-950/15` combined with `backdrop-blur-xl`.
- **Modals:** `shadow-2xl shadow-stone-900/25`.
- **Flat Insets:** `shadow-2xs` or border-only.

### 6.3 Borders
- **Standard Border:** `1px solid rgba(229, 231, 235, 0.9)` (`border-stone-200/90`).
- **Sacred Gold Accent Border:** `1px solid rgba(212, 175, 55, 0.45)` (`border-[#D4AF37]/45` or `border-amber-300/60`).
- **Accent Top Bar:** `h-1.5 w-full bg-gradient-to-r from-amber-400 via-[#7B121C] to-amber-400`.

---

## 7. Responsive Layout & First-Viewport Guidelines

### 7.1 Breakpoints
- **Mobile (`< 640px`):** Single-column stacked layouts, sticky bottom CTAs, mobile sheet drawers for sidebars.
- **Tablet (`sm: 640px - 767px`):** 2-column grids for cards, compact headers.
- **Desktop (`md: 768px - 1023px`):** Fixed 256px sidebar for admin/dashboard, multi-column forms.
- **Large Desktop (`lg: 1024px+`):** Full 12-column grid systems, side-by-side previews.

### 7.2 First-Viewport Prioritization
For high-importance transactional views (e.g. Booking Confirmation, Payment Acknowledgment, Account Status):
1. **Compact Headers:** Dynamically reduce hero banners to `~140px` (`min-h-[140px]`) when in confirmation state.
2. **Auto-Scroll to Top:** When a booking/order completes, programmatically call `window.scrollTo({ top: 0, behavior: 'smooth' })`.
3. **Vertical Cohesion:** Structure elements vertically with compact spacing (`space-y-4` or `space-y-5`) so the confirmation badge, ticket summary, meeting link, and CTA buttons are immediately visible without deep scrolling.

---

## 8. Dashboard vs. Public Website Guidelines

### 8.1 Public Website (`/`, `/services`, `/store`, `/appointment`, `/gallery`, `/blog`)
- **Navigation:** Frosted glass navbar (`nav-glassmorphism`) with translucent golden rim, logo, multi-language switcher, cart trigger, and auth trigger.
- **Tone:** Devotional, scholarly, serene, inviting.
- **Visual Dividers:** Delicate SVG curved waves (`#D8A868` stroke with `#FCF8ED` fill) separating sections.
- **Watermarks:** Subtle sacred geometric yantras (`/ornaments/clean_yantra.png`, `/ornaments/clean_mandala.png`) at `opacity-5` or `opacity-[0.03]`.

### 8.2 Customer Sanctuary Dashboard (`/dashboard`)
- **Navigation:** Dedicated seeker dashboard layout with full website links preserved in top bar.
- **Key Modules:** Overview with Jyotish chart snapshot, celestial wallet balance & ledger, upcoming consultations, and consecrated order tracker.
- **Color Accent:** Calm parchment with terracotta accents and gold status pills.

### 8.3 Admin Operational Portal (`/admin`)
- **Navigation:** Fixed 256px left sidebar with organized operational groups:
  1. `DASHBOARD`: System Overview & KPIs.
  2. `USER MANAGEMENT`: Seekers & Astrologers.
  3. `OPERATIONS`: Bookings, Orders, Services, Products.
  4. `POOJA SERVICES`: Pooja Services & Availability Schedules (renamed from legacy Finance).
  5. `CONTENT`: Blogs & Gallery.
  6. `SYSTEM`: Audit Activity & System Settings.
- **Breadcrumb Navigation:** Synchronized real-time header (`getBreadcrumbTitle()`).
- **Data Protection:** Access strictly restricted to `ADMIN` (Dr. Pandit Vishal Dubey) and `SUPERADMIN` (Platform Owner). Non-admin roles are redirected cleanly to `/dashboard`.

---

## 9. Catalog & Infinite Scrolling Standards

To guarantee predictable memory consumption and identical performance across devices:
- **Services Catalog (`/services`):** Strictly loaded in batches of **9** items (`SERVICES_BATCH_SIZE = 9`).
- **Store Products Catalog (`/store`):** Strictly loaded in batches of **8** items (`PRODUCTS_BATCH_SIZE = 8`).
- **Gallery Artwork (`/gallery`):** Strictly loaded in batches of **9** items (`GALLERY_BATCH_SIZE = 9`).
- **Pagination in Admin Tabs:** Standardized 10 / 15 items per page with clear total count indicators and previous/next page pills.

---

## 10. Summary Checklist for Future UI Work

When building new features or editing existing UI in AstroVD, verify:
- [ ] Surface uses `#F5EFE6`, `#FAF7F2`, or clean `#FFFFFF` (never dark neon purple).
- [ ] Primary buttons use `#5B0D15` terracotta/maroon with white text and smooth active states.
- [ ] Accent touches use champagne-gold (`#D4AF37`, `#D8B28A`, or amber tints).
- [ ] Emerald is restricted strictly to active, verified, or live states.
- [ ] Typography pairs classical `font-serif` headings with clean sans-serif UI body copy.
- [ ] Modals are scroll-locked via `useScrollLock` and contain overscroll containment.
- [ ] First-viewport layout rules are maintained for confirmation screens and key workflows.
- [ ] Both Hindi (`hi`) and English (`en`) strings are supported via `useLanguage()`.
