# nhiep.net — Photography & Videography Booking Platform

> **The Premier Visual Production & Booking Platform for Central Vietnam** (Da Nang, Hue, Quang Tri, Khanh Hoa).

![nhiep.net Logo](/logo.jpg)

---

## 1. Overview
**nhiep.net** is a full-stack, production-ready website and Progressive Web App (PWA) designed for booking high-end photography, cinematic videography, post-production, corporate event coverage, and travel photo sessions across the 4 key provinces of Central Vietnam:
- **Đà Nẵng (Da Nang)**
- **Thừa Thiên Huế (Hue)**
- **Quảng Trị (Quang Tri)**
- **Khánh Hòa (Nha Trang / Cam Ranh)**

---

## 2. Tech Stack
- **Framework**: Next.js 14+ (App Router) with React 18, TypeScript.
- **Styling**: TailwindCSS, Obsidian Dark Theme with Brand Amber/Orange (`#ff7a00`), Glassmorphism, Camera Viewfinder HUD accents.
- **Icons & Motion**: Lucide React, Framer Motion, Canvas Confetti.
- **i18n (3 Languages)**: Full localization in **Vietnamese (default)**, **English**, and **Simplified Chinese** (`/vi`, `/en`, `/zh`) with localized URLs and SEO hreflang tags.
- **AI Consultant**: Google Gemini API integration with semantic RAG retriever across all packages, locations, and pricing benchmarks.
- **Data & Storage**: Server-side storage engine (`src/lib/storage.ts`) supporting local SQLite/JSON persistence and seamless migration to Supabase/PostgreSQL.
- **SEO & Schemas**: Dynamic `sitemap.xml` (600+ URLs), `robots.txt`, Open Graph, Twitter Cards, and JSON-LD structured data (`LocalBusiness`, `Service`, `Article`, `FAQPage`, `BreadcrumbList`).
- **PWA**: Installable web application with manifest, custom icons, and theme configuration.

---

## 3. Core Features & Capabilities

### 3.1 5 Service Categories & 40+ Packages
1. **Photography** (Pre-wedding, Artistic Portraits, Heritage Ao Dai, Luxury Resort Architecture, Food Styling, Family).
2. **Videography** (4K Cinematic Wedding Films, Corporate TVC 6K, Event Gala Highlights, Travel Vlogs, FPV Drone).
3. **Post-Production / Editing** (High-End Magazine Retouching, DaVinci Resolve Color Grading, Viral TikTok/Reels edits, 24h Express Turnaround).
4. **Event Coverage** (Annual Gala Dinners, International Summits, Beach Teambuilding, Grand Openings, Concerts, Marathon BIB photography, Live-Photo 30m QR sharing).
5. **Travel Photography** (Escorted phototours at Ba Na Hills, Hoi An, Hue Forbidden Citadel, Nha Trang Luxury Yachts, Cam Ranh Sand Dunes, Hai Van Pass).

*Each package features realistic VND pricing, detailed gear & crew specifications, and a unique high-resolution illustrative image.*

### 3.2 Content Engine (200 SEO/GEO Articles)
- 200 in-depth articles distributed evenly across **5 categories × 4 provinces** (10 articles per topic-province pair).
- 800–1000 words each, published in **Vietnamese, English, and Chinese**.
- 2–3 unique illustrative images per article with zero duplicates.
- Structured `FAQPage` schema and internal links to corresponding packages.

### 3.3 Gemini AI Consultant (RAG)
- Floating widget accessible from any page.
- Auto language detection (VI/EN/ZH).
- Instant quote recommendations and direct deep booking links.
- Direct handoff to Hotline `0932.513.678`, Zalo `0931.513.678`, or WhatsApp `+84932513678`.

### 3.4 Interactive Online Booking Flow
- 5-step intuitive booking process with real-time add-on price calculations.
- Generates instant unique reference codes (`NHP-XXXXX`).
- Automatic synchronization with the database.

### 3.5 Admin Portal (`/[locale]/admin`)
- Real-time KPIs (Total Bookings, Pending, Confirmed, Completed, Revenue).
- Search and filter by status, province, category, customer name, phone.
- One-click status actions (Duyệt lịch, Hoàn thành, Hủy lịch).

### 3.6 Contact Channels (Floating Speed-Dial + Sticky Mobile Nav)
- **Hotline**: `0932513678` (`tel:0932513678`)
- **WhatsApp**: `+84932513678` (`https://wa.me/84932513678`)
- **Zalo**: `0931513678` (`https://zalo.me/0931513678`)

---

## 4. Getting Started Locally

### Prerequisites
- Node.js 18+ or 20+ LTS
- npm or yarn or pnpm

### Installation
```bash
# Clone or navigate to the project directory
cd /Users/mac/Documents/GGA/NHIEP.NET

# Install dependencies (if not already done)
npm install

# Setup environment variables
cp .env.example .env.local
```

### Configure Environment Variables (`.env.local`)
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SECRET_KEY=nhiep_admin_2026
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Build for Production
```bash
npm run build
npm run start
```

---

## 6. Deployment (Vercel)
1. Push this repository to GitHub/GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the environment variable `GEMINI_API_KEY` under Project Settings > Environment Variables.
4. Deploy!

---

## 7. Admin Credentials
- Admin URL: `http://localhost:3000/vi/admin` (or `/en/admin`, `/zh/admin`)
- Passkey: `nhiep_admin_2026`
