'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale, ServicePackage } from '@/types';
import { getDictionary } from '@/data/translations';
import {
  Check, Clock, Users, Camera, Sparkles, ArrowRight, ShieldCheck,
  QrCode, ShoppingBag, CheckCircle2
} from 'lucide-react';
import PaymentQrModal from './PaymentQrModal';
import { useCart } from '@/context/CartContext';

export default function PackageCard({
  pkg,
  locale
}: {
  pkg: ServicePackage;
  locale: Locale;
  onOpenBooking?: () => void;
}) {
  const dict = getDictionary(locale);
  const { addToCart } = useCart();
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const name = locale === 'zh' ? pkg.nameZh : locale === 'en' ? pkg.nameEn : pkg.nameVi;
  const desc = locale === 'zh' ? pkg.descriptionZh : locale === 'en' ? pkg.descriptionEn : pkg.descriptionVi;
  const deliverables = locale === 'zh' ? pkg.deliverablesZh : locale === 'en' ? pkg.deliverablesEn : pkg.deliverablesVi;

  const handleAddToCart = () => {
    addToCart({
      type: 'standard_package',
      name,
      priceVnd: pkg.priceVnd,
      depositVnd: Math.round(pkg.priceVnd * 0.3),
      quantity: 1,
      image: pkg.imageUrl,
      details: `${pkg.duration} • ${pkg.crewSize}`,
      crewSummary: pkg.crewSize,
      deliverables
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <>
      <div
        className={`relative rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col justify-between border ${
          pkg.featured ? 'border-brand/60 shadow-glow' : 'border-surface-border'
        }`}
      >
        {/* Top Image Banner */}
        <div className="relative w-full h-52 overflow-hidden bg-black">
          <Image
            src={pkg.imageUrl}
            alt={name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/30" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {pkg.popular && (
              <span className="px-2.5 py-1 rounded-full bg-brand text-black font-extrabold text-[10px] shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-black" />
                {dict.packages.popularBadge}
              </span>
            )}
            {pkg.featured && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black font-bold text-[10px]">
                {dict.packages.featuredBadge}
              </span>
            )}
          </div>

          {/* Category tag */}
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-zinc-300 border border-white/10 uppercase tracking-wider">
            {pkg.categoryId.replace('-', ' ')}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-heading font-black text-lg text-white group-hover:text-brand transition-colors line-clamp-2">
              {name}
            </h3>
            <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
              {desc}
            </p>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-surface-border/60 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="truncate">{pkg.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Users className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="truncate">{pkg.crewSize}</span>
              </div>
            </div>

            {/* Deliverables bullet list */}
            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {dict.packages.deliverables}:
              </p>
              {deliverables.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & CTA Button */}
          <div className="pt-4 border-t border-surface-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  Giá trọn gói
                </span>
                <span className="font-heading font-black text-xl text-brand">
                  {pkg.priceVndFormatted}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  title="Thêm gói vào giỏ hàng"
                  className="p-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border hover:border-brand/40 text-zinc-300 hover:text-brand font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  {addedNotice ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                </button>

                {/* Direct VietQR Payment */}
                <button
                  type="button"
                  onClick={() => setIsQrOpen(true)}
                  title="Đặt cọc giữ lịch nhanh qua VietQR MB BANK"
                  className="p-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-brand/50 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-brand" />
                </button>

                {/* Book now link */}
                <Link
                  href={`/${locale}/booking?package=${pkg.id}`}
                  className="px-3.5 py-2.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-xs flex items-center gap-1 shadow-glow transition-all hover:scale-105 shrink-0"
                >
                  <span>{dict.packages.bookThis}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct VietQR Payment Modal for Package */}
      <PaymentQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        bookingCode={`NHP-${Math.floor(10000 + Math.random() * 90000)}`}
        packageName={name}
        totalAmountVnd={pkg.priceVnd}
      />
    </>
  );
}
