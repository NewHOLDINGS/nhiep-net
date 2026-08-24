import { MetadataRoute } from 'next';
import { ARTICLES } from '@/data/articles';
import { PACKAGES } from '@/data/packages';
import { PROVINCES } from '@/data/provinces';
import { CATEGORIES } from '@/data/categories';

const BASE_URL = 'https://nhiep.net';
const LOCALES = ['vi', 'en', 'zh'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. Static Core Pages with Hreflang Alternates
  for (const locale of LOCALES) {
    routes.push(
      {
        url: `${BASE_URL}/${locale}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi`,
            en: `${BASE_URL}/en`,
            zh: `${BASE_URL}/zh`,
          },
        },
      },
      {
        url: `${BASE_URL}/${locale}/packages`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi/packages`,
            en: `${BASE_URL}/en/packages`,
            zh: `${BASE_URL}/zh/packages`,
          },
        },
      },
      {
        url: `${BASE_URL}/${locale}/booking`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi/booking`,
            en: `${BASE_URL}/en/booking`,
            zh: `${BASE_URL}/zh/booking`,
          },
        },
      },
      {
        url: `${BASE_URL}/${locale}/blog`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi/blog`,
            en: `${BASE_URL}/en/blog`,
            zh: `${BASE_URL}/zh/blog`,
          },
        },
      }
    );
  }

  // 2. GEO Regional Hubs (Da Nang, Hue, Quang Tri, Khanh Hoa)
  for (const prov of PROVINCES) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE_URL}/${locale}/packages?province=${prov.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi/packages?province=${prov.id}`,
            en: `${BASE_URL}/en/packages?province=${prov.id}`,
            zh: `${BASE_URL}/zh/packages?province=${prov.id}`,
          },
        },
      });
    }
  }

  // 3. Service Category Landing URLs
  for (const cat of CATEGORIES) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE_URL}/${locale}/packages?category=${cat.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi/packages?category=${cat.id}`,
            en: `${BASE_URL}/en/packages?category=${cat.id}`,
            zh: `${BASE_URL}/zh/packages?category=${cat.id}`,
          },
        },
      });
    }
  }

  // 4. Package Direct Booking URLs
  for (const pkg of PACKAGES) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE_URL}/${locale}/booking?package=${pkg.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi/booking?package=${pkg.id}`,
            en: `${BASE_URL}/en/booking?package=${pkg.id}`,
            zh: `${BASE_URL}/zh/booking?package=${pkg.id}`,
          },
        },
      });
    }
  }

  // 5. 200 Localized Articles with exact multi-lingual alternate mapping
  for (const article of ARTICLES) {
    const slugVi = article.slugVi || article.slug;
    const slugEn = article.slugEn || article.slug;
    const slugZh = article.slugZh || article.slug;

    for (const locale of LOCALES) {
      const currentSlug = locale === 'zh' ? slugZh : locale === 'en' ? slugEn : slugVi;
      routes.push({
        url: `${BASE_URL}/${locale}/blog/${currentSlug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.75,
        alternates: {
          languages: {
            vi: `${BASE_URL}/vi/blog/${slugVi}`,
            en: `${BASE_URL}/en/blog/${slugEn}`,
            zh: `${BASE_URL}/zh/blog/${slugZh}`,
          },
        },
      });
    }
  }

  return routes;
}
