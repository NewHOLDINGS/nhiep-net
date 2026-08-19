'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { getDictionary } from '@/data/translations';
import { Camera, Video, SlidersHorizontal, Calendar, Compass, ArrowRight } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  SlidersHorizontal: <SlidersHorizontal className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />
};

export default function CategorySection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="py-16 bg-surface-muted/50 border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Services
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              {dict.categories.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
              {dict.categories.subtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/packages`}
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-300 transition-colors"
          >
            <span>{dict.categories.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/packages?category=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col h-[320px] border border-surface-border"
            >
              {/* Category Background Image */}
              <div className="relative w-full h-40 overflow-hidden">
                <Image
                  src={cat.heroImage}
                  alt={cat.nameVi}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/40 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400">
                  {cat.badge}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/30 text-brand flex items-center justify-center mb-2">
                    {ICON_MAP[cat.icon] || <Camera className="w-4 h-4" />}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white group-hover:text-brand transition-colors line-clamp-1">
                    {locale === 'zh' ? cat.nameZh : locale === 'en' ? cat.nameEn : cat.nameVi}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 mt-1.5 leading-relaxed">
                    {locale === 'zh' ? cat.descriptionZh : locale === 'en' ? cat.descriptionEn : cat.descriptionVi}
                  </p>
                </div>

                <div className="pt-2 flex items-center text-xs font-bold text-brand group-hover:translate-x-1 transition-transform">
                  <span>Khám phá gói</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
