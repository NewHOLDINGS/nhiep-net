'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/types';
import { Globe, ChevronDown } from 'lucide-react';
import { getArticleBySlug } from '@/data/articles';

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VI' },
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'zh', label: '中文 (简体)', flag: '🇨🇳', short: 'ZH' },
];

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const current = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  const handleSelect = (targetLocale: string) => {
    setOpen(false);
    if (targetLocale === currentLocale) return;

    const queryString = typeof window !== 'undefined' && window.location.search ? window.location.search : '';
    const segments = pathname.split('/');

    // Handle localized blog article slugs: /[locale]/blog/[slug]
    if (segments.length >= 4 && segments[2] === 'blog' && segments[3]) {
      const currentSlug = decodeURIComponent(segments[3]);
      const article = getArticleBySlug(currentSlug);

      if (article) {
        let localizedSlug = article.slug;
        if (targetLocale === 'vi') localizedSlug = article.slugVi || article.slug;
        else if (targetLocale === 'en') localizedSlug = article.slugEn || article.slug;
        else if (targetLocale === 'zh') localizedSlug = article.slugZh || article.slug;

        router.push(`/${targetLocale}/blog/${encodeURIComponent(localizedSlug)}${queryString}`);
        return;
      }
    }

    // Default route localized transition
    if (segments.length > 1 && ['vi', 'en', 'zh'].includes(segments[1])) {
      segments[1] = targetLocale;
      router.push(`${segments.join('/')}${queryString}`);
    } else {
      router.push(`/${targetLocale}${queryString}`);
    }
  };

  return (
    <div className="relative inline-block text-left z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface-elevated border border-surface-border text-xs font-semibold text-zinc-200 transition-colors"
        aria-label="Change language"
      >
        <span className="text-sm">{current.flag}</span>
        <span>{current.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 rounded-xl glass-panel shadow-2xl z-50 py-1.5 border border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                  lang.code === currentLocale
                    ? 'text-brand font-semibold bg-brand/10'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {lang.code === currentLocale && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
