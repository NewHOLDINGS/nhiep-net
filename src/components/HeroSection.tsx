'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { getDictionary } from '@/data/translations';
import { PROVINCES } from '@/data/provinces';
import { CATEGORIES } from '@/data/categories';
import {
  ArrowRight,
  CalendarPlus,
  Sparkles,
  Camera,
  Video,
  SlidersHorizontal,
  Calendar,
  Compass,
  MapPin
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
  SlidersHorizontal: <SlidersHorizontal className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />
};

export default function HeroSection({
  locale,
  onOpenAiChat
}: {
  locale: Locale;
  onOpenAiChat?: () => void;
}) {
  const dict = getDictionary(locale);

  return (
    <section className="relative overflow-hidden pt-4 pb-4 sm:pt-6 sm:pb-6">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Header with Slogan Badge */}
        <div className="text-center max-w-4xl mx-auto mb-5">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs sm:text-base font-black shadow-glow tracking-wider uppercase">
            <Sparkles className="w-4 h-4 fill-brand" />
            <span>{dict.hero.badge}</span>
          </div>
        </div>

        {/* 2. 5 Core Service Categories (Placed directly under the slogan, above the action buttons) */}
        <div className="mt-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/packages?category=${cat.id}`}
                className="group relative rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col h-[320px] border border-surface-border text-left hover:border-brand/60 transition-all duration-300 hover:shadow-glow-sm"
              >
                {/* Category Thumbnail */}
                <div className="relative w-full h-36 overflow-hidden">
                  <Image
                    src={cat.heroImage}
                    alt={locale === 'zh' ? cat.nameZh : locale === 'en' ? cat.nameEn : cat.nameVi}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/40 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400">
                    {cat.badge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/30 text-brand flex items-center justify-center mb-2 group-hover:bg-brand group-hover:text-black transition-colors">
                      {ICON_MAP[cat.icon] || <Camera className="w-4 h-4" />}
                    </div>
                    <h3 className="font-heading font-bold text-sm text-white group-hover:text-brand transition-colors line-clamp-1">
                      {locale === 'zh' ? cat.nameZh : locale === 'en' ? cat.nameEn : cat.nameVi}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {locale === 'zh' ? cat.descriptionZh : locale === 'en' ? cat.descriptionEn : cat.descriptionVi}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-[11px] font-bold text-brand group-hover:translate-x-1 transition-transform">
                    <span>
                      {locale === 'zh' ? '查看所有服务' : locale === 'en' ? 'Explore packages' : 'Khám phá gói'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Action CTAs & Province Selector (Placed below the 5 categories) */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={`/${locale}/booking`}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-glow hover:shadow-glow-lg transition-all transform hover:-translate-y-0.5"
            >
              <CalendarPlus className="w-5 h-5 stroke-[2.5]" />
              <span>{dict.hero.instantBooking}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/${locale}/packages`}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-surface-muted hover:bg-surface-elevated border border-surface-border text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
            >
              <span>{dict.hero.explorePackages}</span>
            </Link>

            {onOpenAiChat && (
              <button
                onClick={onOpenAiChat}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/40 text-brand font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 fill-brand" />
                <span>{dict.hero.aiConsultant}</span>
              </button>
            )}
          </div>

          {/* Province selector pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mr-1">
              {dict.nav.selectProvince}:
            </span>
            {PROVINCES.map((prov) => (
              <Link
                key={prov.id}
                href={`/${locale}/packages?province=${prov.id}`}
                className="px-3.5 py-1.5 rounded-full bg-surface border border-surface-border hover:border-brand text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span>{locale === 'zh' ? prov.nameZh : locale === 'en' ? prov.nameEn : prov.nameVi}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
