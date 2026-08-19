'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Locale } from '@/types';
import { Home, Package, CalendarPlus, BookOpen, PhoneCall } from 'lucide-react';
import { getDictionary } from '@/data/translations';

export default function StickyMobileNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = getDictionary(locale);

  const isActive = (path: string) => {
    if (path === `/${locale}` && pathname === `/${locale}`) return true;
    if (path !== `/${locale}` && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-xl border-t border-surface-border px-3 py-2">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          href={`/${locale}`}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive(`/${locale}`) ? 'text-brand font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{dict.nav.home}</span>
        </Link>

        {/* Packages */}
        <Link
          href={`/${locale}/packages`}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive(`/${locale}/packages`) ? 'text-brand font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>{dict.nav.packages}</span>
        </Link>

        {/* Central Booking CTA Button */}
        <Link
          href={`/${locale}/booking`}
          className="relative -top-3 flex flex-col items-center group"
        >
          <div className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 text-black shadow-glow group-hover:scale-105 transition-transform flex items-center justify-center font-bold">
            <CalendarPlus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-extrabold text-brand mt-0.5 tracking-tight">
            {dict.nav.booking}
          </span>
        </Link>

        {/* Blog Guides */}
        <Link
          href={`/${locale}/blog`}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive(`/${locale}/blog`) ? 'text-brand font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{dict.nav.blog}</span>
        </Link>

        {/* Direct Call */}
        <a
          href="tel:0932513678"
          className="flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium text-emerald-400 hover:text-emerald-300"
        >
          <PhoneCall className="w-5 h-5 animate-bounce" />
          <span>Hotline</span>
        </a>
      </div>
    </div>
  );
}
