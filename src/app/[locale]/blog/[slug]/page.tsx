import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Locale, Article } from '@/types';
import { ARTICLES, getArticleBySlug } from '@/data/articles';
import { PACKAGES } from '@/data/packages';
import { getDictionary } from '@/data/translations';
import {
  Clock, Calendar, User, MapPin, Share2, HelpCircle, ArrowLeft, ArrowRight,
  Sparkles, CheckCircle2, ChevronRight, Phone
} from 'lucide-react';
import PackageCard from '@/components/PackageCard';

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  
  for (const art of ARTICLES) {
    params.push({ locale: 'vi', slug: art.slugVi || art.slug });
    params.push({ locale: 'en', slug: art.slugEn || art.slug });
    params.push({ locale: 'zh', slug: art.slugZh || art.slug });
  }

  return params;
}

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale = (params.locale || 'vi') as Locale;
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return { title: 'Bài Viết Không Tồn Tại | nhiep.net' };
  }

  const title = locale === 'zh' ? article.metaTitleZh : locale === 'en' ? article.metaTitleEn : article.metaTitleVi;
  const desc = locale === 'zh' ? article.metaDescZh : locale === 'en' ? article.metaDescEn : article.metaDescVi;

  return {
    title,
    description: desc,
    keywords: article.keywords,
    alternates: {
      canonical: `https://nhiep.net/${locale}/blog/${locale === 'zh' ? article.slugZh : locale === 'en' ? article.slugEn : article.slugVi}`,
      languages: {
        vi: `https://nhiep.net/vi/blog/${article.slugVi}`,
        en: `https://nhiep.net/en/blog/${article.slugEn}`,
        zh: `https://nhiep.net/zh/blog/${article.slugZh}`,
        'x-default': `https://nhiep.net/vi/blog/${article.slugVi}`
      }
    },
    openGraph: {
      title,
      description: desc,
      url: `https://nhiep.net/${locale}/blog/${locale === 'zh' ? article.slugZh : locale === 'en' ? article.slugEn : article.slugVi}`,
      siteName: 'nhiep.net',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'en' ? 'en_US' : 'vi_VN',
      images: [{ url: article.featuredImage, width: 1200, height: 630, alt: title }],
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [article.featuredImage]
    },
    other: {
      'geo.region': article.provinceId === 'danang' ? 'VN-DN' : article.provinceId === 'hue' ? 'VN-26' : article.provinceId === 'quangtri' ? 'VN-25' : article.provinceId === 'hanoi' ? 'VN-HN' : article.provinceId === 'hochiminh' ? 'VN-SG' : 'VN-34',
      'geo.placename': article.provinceId === 'danang' ? 'Đà Nẵng, Việt Nam' : article.provinceId === 'hue' ? 'Thừa Thiên Huế, Việt Nam' : article.provinceId === 'quangtri' ? 'Quảng Trị, Việt Nam' : article.provinceId === 'hanoi' ? 'Hà Nội, Việt Nam' : article.provinceId === 'hochiminh' ? 'TP. Hồ Chí Minh, Việt Nam' : 'Khánh Hòa, Nha Trang, Việt Nam',
      'geo.position': '16.0594;108.1492',
      ICBM: '16.0594, 108.1492',
      'DC.Language': locale
    }
  };
}

export default function ArticleDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const title = locale === 'zh' ? article.titleZh : locale === 'en' ? article.titleEn : article.titleVi;
  const content = locale === 'zh' ? article.contentZh : locale === 'en' ? article.contentEn : article.contentVi;

  // Matching packages
  const relatedPackages = PACKAGES.filter((p) =>
    article.relatedPackageIds.includes(p.id) || p.categoryId === article.categoryId
  ).slice(0, 2);

  // Related articles in same category
  const relatedArticles = ARTICLES.filter((a) => a.id !== article.id && a.categoryId === article.categoryId).slice(0, 3);

  // JSON-LD Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    image: [article.featuredImage, ...article.inContentImages],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: [{ '@type': 'Organization', name: article.author, url: 'https://nhiep.net' }],
    publisher: {
      '@type': 'Organization',
      name: 'nhiep.net',
      logo: { '@type': 'ImageObject', url: 'https://nhiep.net/logo.jpg' }
    },
    description: locale === 'zh' ? article.excerptZh : locale === 'en' ? article.excerptEn : article.excerptVi
  };

  // JSON-LD FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((faq) => ({
      '@type': 'Question',
      name: locale === 'zh' ? faq.questionZh : locale === 'en' ? faq.questionEn : faq.questionVi,
      acceptedAnswer: {
        '@type': 'Answer',
        text: locale === 'zh' ? faq.answerZh : locale === 'en' ? faq.answerEn : faq.answerVi
      }
    }))
  };

  // JSON-LD Breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `https://nhiep.net/${locale}` },
      { '@type': 'ListItem', position: 2, name: dict.nav.blog, item: `https://nhiep.net/${locale}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `https://nhiep.net/${locale}/blog/${locale === 'zh' ? article.slugZh : locale === 'en' ? article.slugEn : article.slugVi}`
      }
    ]
  };

  return (
    <article className="py-10">
      {/* Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-brand transition-colors">
            {dict.nav.home}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${locale}/blog`} className="hover:text-brand transition-colors">
            {dict.nav.blog}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-300 font-medium truncate max-w-[200px] sm:max-w-md">
            {title}
          </span>
        </nav>

        {/* Header Title & Badges */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold uppercase tracking-wider">
              {article.categoryId}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              <span>{article.provinceId}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-elevated border border-surface-border text-zinc-400 text-xs flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTimeMin} {dict.blog.minRead}</span>
            </span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-surface-border">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <User className="w-3.5 h-3.5 text-brand" />
              <span>{article.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.publishedAt}</span>
            </span>
          </div>
        </div>

        {/* Featured Image Banner */}
        <div className="relative w-full h-[320px] sm:h-[460px] rounded-3xl overflow-hidden mb-10 border border-surface-border shadow-2xl bg-black">
          <Image
            src={article.featuredImage}
            alt={title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="prose prose-invert prose-brand max-w-none prose-headings:font-heading prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300 space-y-6 text-sm sm:text-base">
          <div className="whitespace-pre-line leading-relaxed">
            {content}
          </div>

          {/* First in-content image */}
          {article.inContentImages[0] && (
            <div className="my-8 rounded-2xl overflow-hidden border border-surface-border">
              <div className="relative w-full h-[280px] sm:h-[400px]">
                <Image
                  src={article.inContentImages[0]}
                  alt={`${title} - Bối cảnh chụp ảnh đẹp tại ${article.provinceId}`}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center text-[11px] text-zinc-400 py-2 bg-surface-card">
                Hình ảnh thực tế từ các dự án quay chụp tiêu chuẩn của nhiep.net tại {article.provinceId}
              </p>
            </div>
          )}

          {/* Second in-content image */}
          {article.inContentImages[1] && (
            <div className="my-8 rounded-2xl overflow-hidden border border-surface-border">
              <div className="relative w-full h-[280px] sm:h-[400px]">
                <Image
                  src={article.inContentImages[1]}
                  alt={`${title} - Ekip sản xuất và góc máy tại ${article.provinceId}`}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center text-[11px] text-zinc-400 py-2 bg-surface-card">
                Trang thiết bị hiện đại và ekip đạo diễn hình ảnh chuyên nghiệp
              </p>
            </div>
          )}
        </div>

        {/* FAQ Accordion Section */}
        {article.faqs && article.faqs.length > 0 && (
          <div className="mt-14 pt-10 border-t border-surface-border space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-brand" />
              <h3 className="font-heading font-black text-xl text-white">
                {dict.blog.faqTitle}
              </h3>
            </div>

            <div className="space-y-3">
              {article.faqs.map((faq, idx) => {
                const q = locale === 'zh' ? faq.questionZh : locale === 'en' ? faq.questionEn : faq.questionVi;
                const a = locale === 'zh' ? faq.answerZh : locale === 'en' ? faq.answerEn : faq.answerVi;

                return (
                  <div key={idx} className="p-4 rounded-2xl glass-panel border border-surface-border">
                    <h4 className="font-bold text-sm text-white flex items-start gap-2">
                      <span className="text-brand font-black">Q:</span>
                      <span>{q}</span>
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-300 pl-5 leading-relaxed">
                      {a}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Packages Recommendations */}
        {relatedPackages.length > 0 && (
          <div className="mt-14 pt-10 border-t border-surface-border space-y-6">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Recommended Services
              </span>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-white mt-1">
                {dict.blog.relatedPackages}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
              ))}
            </div>
          </div>
        )}

        {/* Back and Navigation CTAs */}
        <div className="mt-14 pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{dict.blog.allArticles} (200 Guides)</span>
          </Link>

          <Link
            href={`/${locale}/booking`}
            className="px-6 py-3 rounded-xl bg-brand text-black font-extrabold text-xs shadow-glow hover:bg-brand-400 transition-colors"
          >
            {dict.booking.title}
          </Link>
        </div>
      </div>
    </article>
  );
}
