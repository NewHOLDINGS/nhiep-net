'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { getDictionary } from '@/data/translations';
import { PROVINCES } from '@/data/provinces';
import { ArrowRight, CalendarPlus, Sparkles, ShieldCheck, Video, Camera, Award, MapPin } from 'lucide-react';

export default function HeroSection({
  locale,
  onOpenAiChat
}: {
  locale: Locale;
  onOpenAiChat?: () => void;
}) {
  const dict = getDictionary(locale);

  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-28">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold shadow-glow animate-pulse-slow">
            <Sparkles className="w-4 h-4 fill-brand" />
            <span>{dict.hero.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
            {dict.hero.titleHighlight}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              {dict.hero.titleSuffix}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {dict.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
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
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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

        {/* Stats Grid Bar */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass-panel rounded-2xl border border-surface-border">
          <div className="text-center p-3 border-r border-surface-border/50 last:border-none">
            <p className="font-heading font-black text-2xl sm:text-3xl text-brand">
              {dict.hero.stat1Number}
            </p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">{dict.hero.stat1Label}</p>
          </div>
          <div className="text-center p-3 border-r border-surface-border/50 last:border-none">
            <p className="font-heading font-black text-2xl sm:text-3xl text-white">
              {dict.hero.stat2Number}
            </p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">{dict.hero.stat2Label}</p>
          </div>
          <div className="text-center p-3 border-r border-surface-border/50 last:border-none">
            <p className="font-heading font-black text-2xl sm:text-3xl text-amber-400">
              {dict.hero.stat3Number}
            </p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">{dict.hero.stat3Label}</p>
          </div>
          <div className="text-center p-3">
            <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
              {dict.hero.stat4Number}
            </p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">{dict.hero.stat4Label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
