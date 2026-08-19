'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { PROVINCES } from '@/data/provinces';
import { getDictionary } from '@/data/translations';
import { MapPin, ArrowRight } from 'lucide-react';

export default function ProvinceSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Locations & Landmarks
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mt-1">
            {dict.provinces.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            {dict.provinces.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROVINCES.map((prov) => {
            const name = locale === 'zh' ? prov.nameZh : locale === 'en' ? prov.nameEn : prov.nameVi;
            const desc = locale === 'zh' ? prov.descriptionZh : locale === 'en' ? prov.descriptionEn : prov.descriptionVi;

            return (
              <div
                key={prov.id}
                className="group relative rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col justify-between h-[380px] border border-surface-border"
              >
                {/* Background image */}
                <Image
                  src={prov.heroImage}
                  alt={name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 -z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 -z-10" />

                {/* Top Badge */}
                <div className="p-4 flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-brand/90 backdrop-blur-md text-black font-extrabold text-xs flex items-center gap-1 shadow-glow">
                    <MapPin className="w-3.5 h-3.5 fill-black" />
                    <span>{name}</span>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-heading font-black text-xl text-white">
                    {name}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                    {desc}
                  </p>

                  {/* Landmarks preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prov.landmarks.slice(0, 3).map((lm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm text-[10px] text-zinc-200 border border-white/10"
                      >
                        {lm}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/${locale}/packages?province=${prov.id}`}
                    className="pt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand group-hover:text-amber-300 transition-colors"
                  >
                    <span>{dict.provinces.viewPackagesIn} {name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
