'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { getFeaturedArticles } from '@/data/articles';
import { getDictionary } from '@/data/translations';
import { BookOpen, Clock, ArrowRight, MapPin } from 'lucide-react';

export default function ArticlesSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const featured = getFeaturedArticles(6);

  return (
    <section className="pt-2 pb-12 sm:pt-4 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Knowledge & Guides
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mt-1">
              {dict.blog.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
              {dict.blog.subtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-amber-300 transition-colors"
          >
            <span>{dict.blog.allArticles} (200)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((art) => {
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
      </div>
    </section>
  );
}
