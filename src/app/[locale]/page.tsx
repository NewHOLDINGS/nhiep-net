import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Locale } from '@/types';
import { getDictionary } from '@/data/translations';
import { PACKAGES } from '@/data/packages';
import HeroSection from '@/components/HeroSection';
import PackageCard from '@/components/PackageCard';
import ProvinceSection from '@/components/ProvinceSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ArticlesSection from '@/components/ArticlesSection';
import { ArrowRight, CalendarPlus, Sparkles } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);

  const title = `nhiep.net — ${dict.hero.badge}`;
  const desc = dict.hero.badge;

  return {
    metadataBase: new URL('https://nhiep.net'),
    title,
    description: desc,
    alternates: {
      canonical: `https://nhiep.net/${locale}`,
      languages: {
        vi: 'https://nhiep.net/vi',
        en: 'https://nhiep.net/en',
        zh: 'https://nhiep.net/zh',
        'x-default': 'https://nhiep.net/vi'
      }
    },
    openGraph: {
      title,
      description: desc,
      url: `https://nhiep.net/${locale}`,
      siteName: 'nhiep.net',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'en' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [
        {
          url: 'https://nhiep.net/nhiep.jpg',
          width: 1200,
          height: 1200,
          alt: `${title} - ${desc}`,
          type: 'image/jpeg'
        },
        {
          url: 'https://nhiep.net/logo.jpg',
          width: 1200,
          height: 1200,
          alt: `${title} - ${desc}`,
          type: 'image/jpeg'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: ['https://nhiep.net/nhiep.jpg']
    },
    other: {
      'og:image:secure_url': 'https://nhiep.net/nhiep.jpg',
      'og:image:type': 'image/jpeg',
      'og:image:width': '1200',
      'og:image:height': '1200',
      'DC.Language': locale
    }
  };
}

export default function HomePage({
  params
}: {
  params: { locale: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);
  const featuredPackages = PACKAGES.filter((p) => p.featured || p.popular).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 1. Hero Section (with 5 Core Categories directly beneath slogan, above CTA buttons) */}
      <HeroSection locale={locale} />

      {/* 2. Featured Packages Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">
                Featured Packages
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mt-1">
                {dict.packages.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
                {dict.packages.subtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/packages`}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-amber-300 transition-colors"
            >
              <span>{dict.categories.viewAll} ({PACKAGES.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/packages`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-surface-muted hover:bg-surface-elevated border border-brand/40 text-white font-bold text-sm shadow-md hover:border-brand transition-all"
            >
              <span>{dict.cta.allPackagesBtn.replace('{count}', String(PACKAGES.length))}</span>
              <ArrowRight className="w-4 h-4 text-brand" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Regional Hubs Showcase */}
      <ProvinceSection locale={locale} />

      {/* 4. Verified Client Testimonials */}
      <TestimonialsSection locale={locale} />

      {/* 5. Content Engine (200 SEO Articles Hub Highlights) */}
      <ArticlesSection locale={locale} />

      {/* 6. Call To Action Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 glass-panel border border-brand/50 text-center space-y-6">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-brand" />
              <span>{dict.cta.badge}</span>
            </span>

            <h2 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white max-w-3xl mx-auto leading-tight">
              {dict.cta.title}
            </h2>

            <p className="text-xs sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {dict.cta.subtitle}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/booking`}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-sm sm:text-base shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-5 h-5 stroke-[2.5]" />
                <span>{dict.booking.title}</span>
              </Link>
              <a
                href="tel:0943391369"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-white font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
              >
                <span>Hotline: 0943391369</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
