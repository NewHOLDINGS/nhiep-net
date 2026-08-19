import { Article, CategoryId, ProvinceId } from '@/types';
import rawArticles from './articles.json';

export const ARTICLES: Article[] = rawArticles as Article[];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(
    (a) => a.slug === slug || a.slugVi === slug || a.slugEn === slug || a.slugZh === slug || a.id === slug
  );
}

export function getArticlesByCategory(categoryId: CategoryId): Article[] {
  return ARTICLES.filter((a) => a.categoryId === categoryId);
}

export function getArticlesByProvince(provinceId: ProvinceId): Article[] {
  return ARTICLES.filter((a) => a.provinceId === provinceId);
}

export function getFeaturedArticles(limit = 6): Article[] {
  return ARTICLES.slice(0, limit);
}
