import { MetadataRoute } from 'next';
import { ARTICLES } from '@/data/articles';
import { PACKAGES } from '@/data/packages';

const BASE_URL = 'https://nhiep.net';
const LOCALES = ['vi', 'en', 'zh'];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. Static Pages for all 3 languages
  for (const locale of LOCALES) {
    routes.push(
      {
        url: `${BASE_URL}/${locale}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/${locale}/packages`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/${locale}/booking`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/${locale}/blog`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      }
    );
  }

  // 2. Package deep link URLs
  for (const pkg of PACKAGES) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE_URL}/${locale}/booking?package=${pkg.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // 3. 200 Localized Articles
  for (const article of ARTICLES) {
    routes.push(
      {
        url: `${BASE_URL}/vi/blog/${article.slugVi || article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/en/blog/${article.slugEn || article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/zh/blog/${article.slugZh || article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    );
  }

  return routes;
}
