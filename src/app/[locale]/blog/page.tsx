'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale, CategoryId, ProvinceId } from '@/types';
import { ARTICLES } from '@/data/articles';
import { CATEGORIES } from '@/data/categories';
import { PROVINCES } from '@/data/provinces';
import { getDictionary } from '@/data/translations';
import { Search, BookOpen, Clock, MapPin, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function BlogPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((art) => {
      if (selectedCategory !== 'all' && art.categoryId !== selectedCategory) {
        return false;
      }
      if (selectedProvince !== 'all' && art.provinceId !== selectedProvince) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = art.titleVi.toLowerCase().includes(q) || art.titleEn.toLowerCase().includes(q) || art.titleZh.toLowerCase().includes(q);
        const matchExcerpt = art.excerptVi.toLowerCase().includes(q) || art.excerptEn.toLowerCase().includes(q) || art.excerptZh.toLowerCase().includes(q);
        if (!matchTitle && !matchExcerpt) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedProvince, searchQuery]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            200 SEO/GEO Guides & Articles
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white mt-1">
            {dict.blog.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            {dict.blog.subtitle}
          </p>
        </div>

        {/* Filter Controls Panel */}
        <div className="p-4 sm:p-6 glass-panel rounded-2xl border border-surface-border space-y-4 mb-10">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm bài viết theo địa điểm (Đà Nẵng, Huế, Nha Trang...), kinh nghiệm, báo giá..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand text-black shadow-glow'
                  : 'bg-surface hover:bg-surface-elevated text-zinc-300 border border-surface-border'
              }`}
            >
              {dict.blog.allArticles} (200)
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-brand text-black shadow-glow'
                    : 'bg-surface hover:bg-surface-elevated text-zinc-300 border border-surface-border'
                }`}
              >
                {locale === 'zh' ? cat.nameZh : locale === 'en' ? cat.nameEn : cat.nameVi}
              </button>
            ))}
          </div>

          {/* Province Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-surface-border/40">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              <span>{dict.blog.filterProvince}:</span>
            </span>
            <button
              onClick={() => {
                setSelectedProvince('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedProvince === 'all'
                  ? 'bg-brand/20 border border-brand text-brand'
                  : 'bg-surface text-zinc-400 hover:text-white'
              }`}
            >
              Tất cả tỉnh
            </button>
            {PROVINCES.map((prov) => (
              <button
                key={prov.id}
                onClick={() => {
                  setSelectedProvince(prov.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedProvince === prov.id
                    ? 'bg-brand/20 border border-brand text-brand'
                    : 'bg-surface text-zinc-400 hover:text-white'
                }`}
              >
                {locale === 'zh' ? prov.nameZh : locale === 'en' ? prov.nameEn : prov.nameVi}
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-6 px-1">
          <span>
            Hiển thị <strong>{paginatedArticles.length}</strong> / <strong>{filteredArticles.length}</strong> bài viết (Trang {currentPage}/{totalPages})
          </span>
          {(selectedCategory !== 'all' || selectedProvince !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProvince('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-xs text-brand hover:underline font-semibold"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map((art) => {
            const title = locale === 'zh' ? art.titleZh : locale === 'en' ? art.titleEn : art.titleVi;
            const excerpt = locale === 'zh' ? art.excerptZh : locale === 'en' ? art.excerptEn : art.excerptVi;
            const slug = locale === 'zh' ? art.slugZh : locale === 'en' ? art.slugEn : art.slugVi;

            return (
              <Link
                key={art.id}
                href={`/${locale}/blog/${slug}`}
                className="group rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col justify-between border border-surface-border"
              >
                <div className="relative w-full h-48 overflow-hidden bg-black">
                  <Image
                    src={art.featuredImage}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/20" />
                  
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-brand border border-white/10 uppercase">
                      {art.categoryId.replace('-', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-zinc-200 border border-white/10 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand" />
                      <span>{art.provinceId}</span>
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{art.readingTimeMin} {dict.blog.minRead}</span>
                    </div>
                    <span className="text-xs font-bold text-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{dict.blog.readMore}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl bg-surface-muted hover:bg-surface-elevated disabled:opacity-30 border border-surface-border text-zinc-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-2 text-zinc-600 text-xs">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      currentPage === p
                        ? 'bg-brand text-black shadow-glow'
                        : 'bg-surface-muted hover:bg-surface-elevated text-zinc-300 border border-surface-border'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl bg-surface-muted hover:bg-surface-elevated disabled:opacity-30 border border-surface-border text-zinc-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
