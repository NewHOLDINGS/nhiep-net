'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { getDictionary } from '@/data/translations';
import LanguageSwitcher from './LanguageSwitcher';
import { Phone, Menu, X, Sparkles, CalendarCheck, ShieldCheck } from 'lucide-react';

export default function Header({ locale }: { locale: Locale }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dict = getDictionary(locale);

  const navLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/packages`, label: dict.nav.packages },
    { href: `/${locale}/booking`, label: dict.nav.booking, highlight: true },
    { href: `/${locale}/blog`, label: dict.nav.blog },
    { href: `/${locale}/admin`, label: dict.nav.admin, icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-brand/40 group-hover:border-brand transition-colors bg-black flex items-center justify-center shadow-glow">
              <Image
                src="/logo.jpg"
                alt="nhiep.net Logo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl sm:text-2xl tracking-wider text-white flex items-center">
                NHIEP<span className="text-brand">.NET</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                Cinema & Photography
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  link.highlight
                    ? 'bg-brand/10 text-brand border border-brand/30 hover:bg-brand hover:text-black font-semibold'
                    : 'text-zinc-300 hover:text-white hover:bg-surface-elevated'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Direct Click to Call Hotline */}
            <a
              href="tel:0932513678"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 hover:bg-brand/20 border border-brand/40 text-brand text-xs font-bold transition-all shadow-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-brand text-black flex items-center justify-center animate-pulse">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400">{dict.nav.hotline}</span>
                <span className="font-extrabold text-white group-hover:text-brand">{dict.nav.callNow}</span>
              </div>
            </a>

            {/* Language Switcher */}
            <LanguageSwitcher currentLocale={locale} />

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-elevated border border-surface-border"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card/95 backdrop-blur-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  link.highlight
                    ? 'bg-brand text-black font-bold shadow-glow'
                    : 'text-zinc-200 hover:bg-surface-elevated'
                }`}
              >
                <span>{link.label}</span>
                {link.highlight && <CalendarCheck className="w-4 h-4" />}
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-surface-border flex flex-col gap-2">
              <a
                href="tel:0932513678"
                className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-surface-elevated border border-brand/30 text-white font-bold text-sm"
              >
                <Phone className="w-4 h-4 text-brand" />
                <span>Hotline: 0932513678</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
