'use client';

import React, { useState, useMemo } from 'react';
import { Locale, CategoryId, ProvinceId } from '@/types';
import { PACKAGES } from '@/data/packages';
import { CATEGORIES } from '@/data/categories';
import { PROVINCES } from '@/data/provinces';
import { getDictionary } from '@/data/translations';
import PackageCard from '@/components/PackageCard';
import { Search, Filter, Sparkles, MapPin, SlidersHorizontal } from 'lucide-react';

export default function PackagesPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const filteredPackages = useMemo(() => {
    return PACKAGES.filter((pkg) => {
      // Category filter
      if (selectedCategory !== 'all' && pkg.categoryId !== selectedCategory) {
        return false;
      }
      // Province filter
      if (selectedProvince !== 'all' && !pkg.provinces.includes(selectedProvince as ProvinceId)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = pkg.nameVi.toLowerCase().includes(q) || pkg.nameEn.toLowerCase().includes(q) || pkg.nameZh.toLowerCase().includes(q);
        const matchDesc = pkg.descriptionVi.toLowerCase().includes(q) || pkg.descriptionEn.toLowerCase().includes(q) || pkg.descriptionZh.toLowerCase().includes(q);
        const matchTag = pkg.tags.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchTag) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceVnd - b.priceVnd;
      if (sortBy === 'price-desc') return b.priceVnd - a.priceVnd;
      // default: featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [selectedCategory, selectedProvince, searchQuery, sortBy]);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Pricing & Packages
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white mt-1">
            {dict.packages.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            {dict.packages.subtitle}
          </p>
        </div>

        {/* Filter Controls Panel */}
        <div className="p-4 sm:p-6 glass-panel rounded-2xl border border-surface-border space-y-4 mb-10">
          {/* Search bar & Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm gói chụp ảnh cưới, TVC, sự kiện, flycam..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-zinc-400 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface-muted border border-surface-border rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-brand"
              >
                <option value="featured">Nổi bật nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand text-black shadow-glow'
                  : 'bg-surface hover:bg-surface-elevated text-zinc-300 border border-surface-border'
              }`}
            >
              {dict.packages.filterAll}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
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
              <span>Tỉnh thành:</span>
            </span>
            <button
              onClick={() => setSelectedProvince('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedProvince === 'all'
                  ? 'bg-brand/20 border border-brand text-brand'
                  : 'bg-surface text-zinc-400 hover:text-white'
              }`}
            >
              {dict.packages.filterAllProvinces}
            </button>
            {PROVINCES.map((prov) => (
              <button
                key={prov.id}
                onClick={() => setSelectedProvince(prov.id)}
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

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-6 px-1">
          <span>Tìm thấy <strong className="text-brand font-bold">{filteredPackages.length}</strong> gói dịch vụ phù hợp</span>
          {(selectedCategory !== 'all' || selectedProvince !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProvince('all');
                setSearchQuery('');
              }}
              className="text-xs text-brand hover:underline font-semibold"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {/* Packages Grid */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 p-8 glass-panel rounded-2xl border border-surface-border">
            <SlidersHorizontal className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-white">Không tìm thấy gói phù hợp</h3>
            <p className="text-xs text-zinc-400 mt-1">Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
}
