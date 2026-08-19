'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Locale, CategoryId, ProvinceId, ServicePackage } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { PROVINCES } from '@/data/provinces';
import { PACKAGES } from '@/data/packages';
import { getDictionary } from '@/data/translations';
import {
  CalendarPlus, Check, ChevronRight, ChevronLeft, MapPin, Sparkles,
  Phone, Mail, User, Clock, Calendar, CheckCircle2, ShieldCheck, ArrowRight, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ADDONS = [
  { id: 'addonDrone', nameVi: 'Flycam 4K / 5.1K trên không', nameEn: '4K / 5.1K Aerial Drone Flight', nameZh: '4K/5.1K高清航拍无人机', priceVnd: 1500000 },
  { id: 'addonExpress', nameVi: 'Hậu kỳ hỏa tốc nhận file trong 24h', nameEn: '24-Hour Express Rapid Delivery', nameZh: '24小时极速出片通道', priceVnd: 1200000 },
  { id: 'addonExtraPhotographer', nameVi: 'Thêm 01 Nhiếp ảnh gia phụ', nameEn: '1 Additional Lead Photographer', nameZh: '增加1位资深副摄影师', priceVnd: 1800000 },
  { id: 'addonMUA', nameVi: 'Chuyên viên Trang điểm & Làm tóc', nameEn: 'On-Location Makeup Artist & Hair Styling', nameZh: '专属造型师跟妆与发型设计', priceVnd: 1000000 },
  { id: 'addonPhotobook', nameVi: 'In thêm 01 Album Photobook cao cấp 30x30cm', nameEn: '1 Additional Luxury Photobook 30x30cm', nameZh: '加印1本30x30cm高档水晶相册', priceVnd: 1500000 },
];

function BookingForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();
  const preselectedPackageId = searchParams.get('package');

  // Multi-step state (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('photography');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceId>('danang');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [shootDate, setShootDate] = useState<string>('');
  const [shootTime, setShootTime] = useState<string>('08:00');
  const [shootAddress, setShootAddress] = useState<string>('');
  
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [zaloOrWhatsapp, setZaloOrWhatsapp] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Sync if query param package exists
  useEffect(() => {
    if (preselectedPackageId) {
      const found = PACKAGES.find((p) => p.id === preselectedPackageId);
      if (found) {
        setSelectedPackageId(found.id);
        setSelectedCategory(found.categoryId);
        if (found.provinces.length > 0) {
          setSelectedProvince(found.provinces[0]);
        }
        setStep(2);
      }
    } else {
      // Default to first package of category
      const firstInCat = PACKAGES.find((p) => p.categoryId === selectedCategory);
      if (firstInCat && !selectedPackageId) {
        setSelectedPackageId(firstInCat.id);
      }
    }
  }, [preselectedPackageId]);

  // Packages available in selected category and province
  const availablePackages = useMemo(() => {
    return PACKAGES.filter((p) => p.categoryId === selectedCategory);
  }, [selectedCategory]);

  const activePackage = useMemo(() => {
    return PACKAGES.find((p) => p.id === selectedPackageId) || availablePackages[0] || PACKAGES[0];
  }, [selectedPackageId, availablePackages]);

  // Price calculations
  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const item = ADDONS.find((a) => a.id === addonId);
      return sum + (item ? item.priceVnd : 0);
    }, 0);
  }, [selectedAddons]);

  const estimatedTotal = useMemo(() => {
    const base = activePackage ? activePackage.priceVnd : 0;
    return base + addonsTotal;
  }, [activePackage, addonsTotal]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !shootDate) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Ngày chụp!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          phone,
          email,
          zaloOrWhatsapp: zaloOrWhatsapp || phone,
          categoryId: selectedCategory,
          packageId: activePackage.id,
          packageName: activePackage.nameVi,
          provinceId: selectedProvince,
          shootDate,
          shootTime,
          shootAddress: shootAddress || 'Theo tư vấn của ekip',
          notes,
          addOns: selectedAddons,
          estimatedTotalVnd: estimatedTotal
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingResult(data.data);
        setStep(5);
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        alert(data.error || 'Có lỗi xảy ra khi lưu lịch đặt.');
      }
    } catch (err: any) {
      alert('Không thể kết nối đến máy chủ. Vui lòng liên hệ Hotline 0932513678.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Online Booking System
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white mt-1">
            {dict.booking.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            {dict.booking.subtitle}
          </p>
        </div>

        {/* Step Indicator Bar */}
        {step < 5 && (
          <div className="mb-10 p-4 glass-panel rounded-2xl border border-surface-border">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { s: 1, label: dict.booking.step1 },
                { s: 2, label: dict.booking.step2 },
                { s: 3, label: dict.booking.step3 },
                { s: 4, label: dict.booking.step4 },
              ].map((item) => (
                <div
                  key={item.s}
                  onClick={() => item.s < step && setStep(item.s)}
                  className={`flex flex-col items-center gap-1.5 py-1 transition-colors ${
                    item.s < step ? 'cursor-pointer' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      step === item.s
                        ? 'bg-brand text-black shadow-glow'
                        : step > item.s
                        ? 'bg-emerald-500 text-black'
                        : 'bg-surface-elevated text-zinc-500 border border-surface-border'
                    }`}
                  >
                    {step > item.s ? <Check className="w-4 h-4 stroke-[3]" /> : item.s}
                  </div>
                  <span
                    className={`hidden sm:inline font-semibold text-[11px] truncate max-w-full ${
                      step === item.s ? 'text-brand' : step > item.s ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative">
          {/* STEP 1: CATEGORY & PROVINCE */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Category selector */}
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {dict.booking.selectCategory}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        const first = PACKAGES.find((p) => p.categoryId === cat.id);
                        if (first) setSelectedPackageId(first.id);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        selectedCategory === cat.id
                          ? 'bg-brand/10 border-brand shadow-glow text-white'
                          : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedCategory === cat.id ? 'bg-brand text-black font-bold' : 'bg-surface text-brand'
                      }`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {locale === 'zh' ? cat.nameZh : locale === 'en' ? cat.nameEn : cat.nameVi}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {locale === 'zh' ? cat.descriptionZh : locale === 'en' ? cat.descriptionEn : cat.descriptionVi}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Province selector */}
              <div className="pt-4 border-t border-surface-border">
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {dict.booking.selectProvince}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROVINCES.map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setSelectedProvince(prov.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        selectedProvince === prov.id
                          ? 'bg-brand text-black font-black border-brand shadow-glow'
                          : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs sm:text-sm font-bold">
                        {locale === 'zh' ? prov.nameZh : locale === 'en' ? prov.nameEn : prov.nameVi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                >
                  <span>{dict.booking.nextStep}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT PACKAGE & ADD-ONS */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {dict.booking.selectPackage}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePackages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    const name = locale === 'zh' ? pkg.nameZh : locale === 'en' ? pkg.nameEn : pkg.nameVi;
                    const deliverables = locale === 'zh' ? pkg.deliverablesZh : locale === 'en' ? pkg.deliverablesEn : pkg.deliverablesVi;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand/10 border-brand shadow-glow'
                            : 'bg-surface-muted hover:bg-surface-elevated border-surface-border'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                            <Image src={pkg.imageUrl} alt={name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white line-clamp-1">{name}</h4>
                            <p className="font-extrabold text-base text-brand mt-1">{pkg.priceVndFormatted}</p>
                            <p className="text-[11px] text-zinc-400 mt-1">{pkg.duration}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-surface-border/60 space-y-1">
                          {deliverables.slice(0, 2).map((del, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{del}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Addons */}
              <div className="pt-4 border-t border-surface-border">
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {dict.booking.addOnsTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADDONS.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    const name = locale === 'zh' ? addon.nameZh : locale === 'en' ? addon.nameEn : addon.nameVi;

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-brand/10 border-brand text-white'
                            : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-brand border-brand text-black' : 'border-zinc-600'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-200">{name}</p>
                            <p className="text-[11px] text-brand font-semibold">+{addon.priceVnd.toLocaleString('vi-VN')} ₫</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Bar */}
              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block">{dict.booking.estimatedTotal}</span>
                  <span className="font-heading font-black text-2xl text-brand">
                    {estimatedTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                  >
                    {dict.booking.prevStep}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                  >
                    <span>{dict.booking.nextStep}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE & VENUE ADDRESS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                {dict.booking.step3}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {dict.booking.shootDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {dict.booking.shootTime}
                  </label>
                  <input
                    type="time"
                    value={shootTime}
                    onChange={(e) => setShootTime(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {dict.booking.shootAddress} (Khách sạn / Resort / Địa điểm cụ thể)
                </label>
                <input
                  type="text"
                  value={shootAddress}
                  onChange={(e) => setShootAddress(e.target.value)}
                  placeholder="Ví dụ: InterContinental Danang Resort / Phố cổ Hội An / Bãi biển Mỹ Khê..."
                  className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-6 border-t border-surface-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                >
                  {dict.booking.prevStep}
                </button>
                <button
                  type="button"
                  disabled={!shootDate}
                  onClick={() => setStep(4)}
                  className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 disabled:opacity-40 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                >
                  <span>{dict.booking.nextStep}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT INFO & SUBMIT */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-6 animate-in fade-in duration-200">
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                {dict.booking.step4}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {dict.booking.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {dict.booking.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0932xxxxxx"
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {dict.booking.emailAddress}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {dict.booking.zaloOrWhatsapp}
                  </label>
                  <input
                    type="text"
                    value={zaloOrWhatsapp}
                    onChange={(e) => setZaloOrWhatsapp(e.target.value)}
                    placeholder="Số Zalo hoặc WhatsApp nhận liên hệ nhanh"
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {dict.booking.specialNotes}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú về concept chụp, trang phục chuẩn bị, yêu cầu đặc biệt..."
                  className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-brand/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Gói đã chọn: <strong>{activePackage?.nameVi}</strong></span>
                  <span className="font-bold text-brand">{activePackage?.priceVndFormatted}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Tùy chọn bổ sung ({selectedAddons.length}):</span>
                    <span>+{addonsTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="pt-2 border-t border-surface-border flex items-center justify-between font-bold text-sm text-white">
                  <span>{dict.booking.estimatedTotal}</span>
                  <span className="font-heading font-black text-xl text-brand">{estimatedTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-3 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                >
                  {dict.booking.prevStep}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 disabled:opacity-50 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{dict.booking.submitBooking}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 5 && bookingResult && (
            <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  {dict.booking.successTitle}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300">
                  {dict.booking.successDesc}
                </p>
                <div className="inline-block px-6 py-2.5 rounded-2xl bg-brand/20 border-2 border-brand text-brand font-mono font-black text-2xl sm:text-3xl tracking-wider shadow-glow">
                  {bookingResult.bookingCode}
                </div>
              </div>

              <div className="max-w-md mx-auto p-5 rounded-2xl bg-surface-elevated border border-surface-border text-left space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-surface-border">
                  <span className="text-zinc-400">Khách hàng:</span>
                  <span className="font-bold text-white">{bookingResult.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border">
                  <span className="text-zinc-400">Số điện thoại:</span>
                  <span className="font-bold text-white">{bookingResult.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border">
                  <span className="text-zinc-400">Gói dịch vụ:</span>
                  <span className="font-bold text-brand">{bookingResult.packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border">
                  <span className="text-zinc-400">Ngày chụp dự kiến:</span>
                  <span className="font-bold text-white">{bookingResult.shootDate} ({bookingResult.shootTime})</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span className="text-zinc-400">Tổng chi phí ước tính:</span>
                  <span className="text-brand text-base">{bookingResult.estimatedTotalVnd.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                {dict.booking.successNote}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/${locale}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-elevated border border-surface-border hover:bg-surface text-white text-xs font-bold transition-colors"
                >
                  {dict.booking.backHome}
                </Link>
                <Link
                  href={`/${locale}/admin`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand text-black text-xs font-extrabold shadow-glow hover:bg-brand-400 transition-colors"
                >
                  {dict.booking.viewAdmin}
                </Link>
                <a
                  href="tel:0932513678"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi Hotline Xác Nhận Ngay</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-400">Đang tải biểu mẫu đặt lịch...</div>}>
      <BookingForm locale={locale} />
    </Suspense>
  );
}

