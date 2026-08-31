'use client';

import React, { useState } from 'react';
import {
  Sliders, Plus, Minus, Video, Camera, Sparkles,
  ExternalLink, QrCode, ArrowRight, ShoppingBag, CheckCircle2,
  Mic, Image as ImageIcon, Film
} from 'lucide-react';
import { Locale, CustomBuilderConfig } from '@/types';
import { useCart } from '@/context/CartContext';
import { PAYMENT_CONFIG } from '@/lib/payment';

const I18N_BUILDER = {
  vi: {
    title: 'Tự Tùy Chỉnh Thiết Bị & Nhân Sự Theo Ngân Sách',
    subtitle: 'Chủ động chọn số lượng thợ quay gimbal, máy chụp & flycam cho dự án của bạn',
    gimbalLabel: '🎥 Thợ quay Gimbal',
    photoLabel: '📷 Thợ chụp ảnh',
    photoPrice: '2.500.000 ₫ / thợ',
    droneLabel: '🚁 Flycam DJI',
    qualityLabel: '🎬 Tiêu chuẩn dựng màu sắc:',
    stdEditLabel: '🎞️ Dựng phim tiêu chuẩn',
    advEditLabel: '🎬 Dựng phim nâng cao',
    voiceLabel: '🎙️ Voice talent',
    photoRetouchLabel: '🖼️ Hậu kỳ ảnh',
    optNone: 'Không chọn',
    optStandard: 'Tiêu chuẩn',
    optPremium: 'Cao cấp',
    expressLabel: 'Hậu kỳ hỏa tốc 24h (+1.2tr)',
    makeupLabel: 'Makeup MUA (+1.0tr)',
    photobookLabel: 'Photobook 30x30 (+1.5tr)',
    totalLabel: 'TỔNG CHI PHÍ DỰ TOÁN THEO CẤU HÌNH:',
    deposit40Prefix: 'Cọc giữ lịch 40%:',
    addToCart: 'Thêm Vào Giỏ',
    addedToCart: 'Đã Vào Giỏ',
    vietQrDeposit: 'Đặt Cọc VietQR MB',
    sendAiScript: 'Gửi AI Phân Tích Kịch Bản',
    consultCTA: 'Chốt Gói Qua Zalo'
  },
  en: {
    title: 'Custom Crew & Gear Builder',
    subtitle: 'Customize number of gimbal operators, photographers & aerial drones for your project',
    gimbalLabel: '🎥 Gimbal Operator',
    photoLabel: '📷 Lead Photographer',
    photoPrice: '2,500,000 VND / crew',
    droneLabel: '🚁 DJI Flycam / Drone',
    qualityLabel: '🎬 Color Grading Standard:',
    stdEditLabel: '🎞️ Standard Video Editing',
    advEditLabel: '🎬 Advanced Video Editing',
    voiceLabel: '🎙️ Voice Talent',
    photoRetouchLabel: '🖼️ Photo Post-Production',
    optNone: 'None',
    optStandard: 'Standard',
    optPremium: 'Premium',
    expressLabel: '24-Hour Express (+1.2M)',
    makeupLabel: 'Makeup & Hair (+1.0M)',
    photobookLabel: 'Photobook 30x30 (+1.5M)',
    totalLabel: 'ESTIMATED TOTAL BUDGET:',
    deposit40Prefix: '40% Schedule Deposit:',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart',
    vietQrDeposit: 'VietQR MB Deposit',
    sendAiScript: 'AI Script Analysis',
    consultCTA: 'Confirm via WhatsApp'
  },
  zh: {
    title: '自主定制设备与人员方案',
    subtitle: '根据您的项目预算，自由选择电影机云台手、主摄影师与航拍无人机',
    gimbalLabel: '🎥 稳定器摄影师',
    photoLabel: '📷 专业主摄影师',
    photoPrice: '2,500,000 ₫ / 位',
    droneLabel: '🚁 大疆无人机航拍',
    qualityLabel: '🎬 调色与成片标准：',
    stdEditLabel: '🎞️ 标准视频剪辑',
    advEditLabel: '🎬 高级电影感剪辑',
    voiceLabel: '🎙️ 专业配音旁白',
    photoRetouchLabel: '🖼️ 精修后期处理',
    optNone: '不选择',
    optStandard: '标准版',
    optPremium: '高级版',
    expressLabel: '24小时极速出片 (+120万)',
    makeupLabel: '专属跟妆造型 (+100万)',
    photobookLabel: '30x30水晶相册 (+150万)',
    totalLabel: '定制方案预估总费用：',
    deposit40Prefix: '40%档期锁定订金：',
    addToCart: '加入购物车',
    addedToCart: '已加入',
    vietQrDeposit: 'VietQR MB订金支付',
    sendAiScript: '发送AI剧本分析',
    consultCTA: '通过 WhatsApp 确认方案'
  }
};

export default function CustomizerBuilder({
  locale,
  onOpenPaymentQr,
  onSendToZalo,
  onApplyConfigToChat
}: {
  locale: Locale;
  onOpenPaymentQr: (config: CustomBuilderConfig) => void;
  onSendToZalo: (config: CustomBuilderConfig) => void;
  onApplyConfigToChat?: (config: CustomBuilderConfig) => void;
}) {
  const t = I18N_BUILDER[locale] || I18N_BUILDER.vi;
  const { addToCart } = useCart();
  const [addedFeedback, setAddedFeedback] = useState(false);

  // States for Crew and Gear Options
  const [gimbalOperators, setGimbalOperators] = useState<number>(1);
  const [photographers, setPhotographers] = useState<number>(1);
  const [drones, setDrones] = useState<number>(0);
  const [editingQuality, setEditingQuality] = useState<'fullhd' | '4k' | '6k'>('fullhd');

  // Video & Audio Editing Options
  const [standardVideoEditing, setStandardVideoEditing] = useState<number>(0);
  const [advancedVideoEditing, setAdvancedVideoEditing] = useState<number>(0);
  const [voiceTalent, setVoiceTalent] = useState<'none' | 'standard' | 'premium'>('none');
  const [photoRetouch, setPhotoRetouch] = useState<'none' | 'standard' | 'premium'>('none');

  // Add-ons
  const [express24h, setExpress24h] = useState<boolean>(false);
  const [makeupMUA, setMakeupMUA] = useState<boolean>(false);
  const [luxuryPhotobook, setLuxuryPhotobook] = useState<boolean>(false);

  // Dynamic pricing calculation based on resolution
  // Gimbal: Full HD = 3.2M; 4K = +1.0M (4.2M); 6K RAW = +2.5M (5.7M)
  const priceGimbalPerCrew =
    editingQuality === '6k' ? 5700000 : editingQuality === '4k' ? 4200000 : 3200000;

  // Drone: Full HD = 2.2M; 4K = +1.0M (3.2M); 6K RAW = +2.5M (4.7M)
  const priceDronePerUnit =
    editingQuality === '6k' ? 4700000 : editingQuality === '4k' ? 3200000 : 2200000;

  // Photographer: flat 2.5M / crew regardless of resolution
  const pricePhotoPerCrew = 2500000;

  // Standard Video Edit: Full HD = 1.2M; 4K = 1.5M; 6K RAW = 4.5M per video
  const priceStdEditPerVideo =
    editingQuality === '6k' ? 4500000 : editingQuality === '4k' ? 1500000 : 1200000;

  // Advanced Video Edit: Full HD = 2.8M; 4K = 3.5M; 6K RAW = 6.5M per video
  const priceAdvEditPerVideo =
    editingQuality === '6k' ? 6500000 : editingQuality === '4k' ? 3500000 : 2800000;

  // Voice talent: none = 0; standard = 800k; premium = 2.5M
  const priceVoiceTalent =
    voiceTalent === 'premium' ? 2500000 : voiceTalent === 'standard' ? 800000 : 0;

  // Photo retouch: none = 0; standard = 400k; premium = 1.5M
  const pricePhotoRetouch =
    photoRetouch === 'premium' ? 1500000 : photoRetouch === 'standard' ? 400000 : 0;

  // Addons fixed pricing
  const PRICE_EXPRESS = 1200000;
  const PRICE_MUA = 1000000;
  const PRICE_PHOTOBOOK = 1500000;

  // Calculate realtime total
  const totalPrice =
    gimbalOperators * priceGimbalPerCrew +
    photographers * pricePhotoPerCrew +
    drones * priceDronePerUnit +
    standardVideoEditing * priceStdEditPerVideo +
    advancedVideoEditing * priceAdvEditPerVideo +
    priceVoiceTalent +
    pricePhotoRetouch +
    (express24h ? PRICE_EXPRESS : 0) +
    (makeupMUA ? PRICE_MUA : 0) +
    (luxuryPhotobook ? PRICE_PHOTOBOOK : 0);

  const deposit40 = Math.round((totalPrice * 0.4) / 10000) * 10000;

  const currentConfigObj: CustomBuilderConfig = {
    gimbalOperators,
    photographers,
    drones,
    editingQuality,
    standardVideoEditing,
    advancedVideoEditing,
    voiceTalent,
    photoRetouch,
    express24h,
    makeupMUA,
    luxuryPhotobook,
    totalVnd: totalPrice,
    depositVnd: deposit40
  };

  const handleAddToCart = () => {
    let customName = `Cấu hình tự chọn: ${gimbalOperators} Gimbal + ${photographers} Chụp + ${drones} Flycam (${editingQuality.toUpperCase()})`;
    if (locale === 'en') {
      customName = `Custom Package: ${gimbalOperators} Gimbal + ${photographers} Photo + ${drones} Drone (${editingQuality.toUpperCase()})`;
    } else if (locale === 'zh') {
      customName = `定制方案：${gimbalOperators}机位云台 + ${photographers}机位摄影 + ${drones}台航拍 (${editingQuality.toUpperCase()})`;
    }

    const editDetailsList: string[] = [];
    if (standardVideoEditing > 0) editDetailsList.push(`${standardVideoEditing} Dựng tiêu chuẩn`);
    if (advancedVideoEditing > 0) editDetailsList.push(`${advancedVideoEditing} Dựng nâng cao`);
    if (voiceTalent !== 'none') editDetailsList.push(`Voice: ${voiceTalent}`);
    if (photoRetouch !== 'none') editDetailsList.push(`Hậu kỳ ảnh: ${photoRetouch}`);

    addToCart({
      type: 'custom_builder',
      name: customName,
      priceVnd: totalPrice,
      depositVnd: deposit40,
      quantity: 1,
      details: `${locale === 'zh' ? '成片质量：' : locale === 'en' ? 'Quality: ' : 'Chất lượng: '}${editingQuality.toUpperCase()}${editDetailsList.length > 0 ? ` • ${editDetailsList.join(', ')}` : ''}${express24h ? ' • 24h' : ''}${makeupMUA ? ' • MUA' : ''}${luxuryPhotobook ? ' • Photobook' : ''}`,
      crewSummary: `${gimbalOperators + photographers + (drones > 0 ? 1 : 0)} ${locale === 'zh' ? '位专业人员' : locale === 'en' ? 'Crew Members' : 'Nhân sự kỹ thuật'}`,
      customConfig: currentConfigObj
    });

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-brand/40 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/20 text-brand flex items-center justify-center border border-brand/40 shadow-glow">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading font-black text-sm sm:text-base text-white">
              {t.title}
            </h4>
            <p className="text-[11px] text-zinc-400">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Personnel & Gear */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* 1. Thợ quay Gimbal */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">{t.gimbalLabel}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-brand font-bold font-mono">
                {priceGimbalPerCrew.toLocaleString('vi-VN')} ₫ / thợ
              </span>
              <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                {editingQuality.toUpperCase()}
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 block mt-0.5">
              {locale === 'zh' ? 'Full HD: 320万 • 4K: 420万 • 6K: 570万' : locale === 'en' ? 'Full HD: 3.2M • 4K: 4.2M • 6K: 5.7M' : 'Full HD: 3.2tr • 4K: 4.2tr • 6K: 5.7tr'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGimbalOperators(Math.max(0, gimbalOperators - 1))}
              className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-sm text-brand w-4 text-center">
              {gimbalOperators}
            </span>
            <button
              type="button"
              onClick={() => setGimbalOperators(Math.min(5, gimbalOperators + 1))}
              className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Thợ chụp ảnh */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">{t.photoLabel}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-brand font-bold font-mono">{t.photoPrice}</span>
            </div>
            <span className="text-[9px] text-zinc-400 block mt-0.5">
              {locale === 'zh' ? '固定价格，不受画质影响' : locale === 'en' ? 'Flat rate for all resolutions' : 'Giá cố định mọi độ phân giải'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPhotographers(Math.max(0, photographers - 1))}
              className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-sm text-brand w-4 text-center">
              {photographers}
            </span>
            <button
              type="button"
              onClick={() => setPhotographers(Math.min(5, photographers + 1))}
              className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. Flycam DJI */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">{t.droneLabel}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-brand font-bold font-mono">
                {priceDronePerUnit.toLocaleString('vi-VN')} ₫ / máy
              </span>
              <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                {editingQuality.toUpperCase()}
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 block mt-0.5">
              {locale === 'zh' ? 'Full HD: 220万 • 4K: 320万 • 6K: 470万' : locale === 'en' ? 'Full HD: 2.2M • 4K: 3.2M • 6K: 4.7M' : 'Full HD: 2.2tr • 4K: 3.2tr • 6K: 4.7tr'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrones(Math.max(0, drones - 1))}
              className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-sm text-brand w-4 text-center">
              {drones}
            </span>
            <button
              type="button"
              onClick={() => setDrones(Math.min(3, drones + 1))}
              className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 4. Tiêu chuẩn dựng màu sắc */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-1.5">
          <span className="font-bold text-white">{t.qualityLabel}</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'fullhd', label: 'Full HD' },
              { id: '4k', label: '4K Cinema (+1tr)' },
              { id: '6k', label: '6K RAW (+2.5tr)' }
            ].map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setEditingQuality(q.id as any)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  editingQuality === q.id
                    ? 'bg-brand text-black border-brand shadow-glow font-extrabold'
                    : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Post-production & Voice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* 5. Dựng phim tiêu chuẩn */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">{t.stdEditLabel}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-brand font-bold font-mono">
                {priceStdEditPerVideo.toLocaleString('vi-VN')} ₫ / video
              </span>
              <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                {editingQuality.toUpperCase()}
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 block mt-0.5">
              {locale === 'zh' ? 'Full HD: 120万 • 4K: 150万 • 6K: 450万' : locale === 'en' ? 'Full HD: 1.2M • 4K: 1.5M • 6K: 4.5M' : 'Full HD: 1.2tr • 4K: 1.5tr • 6K: 4.5tr'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStandardVideoEditing(Math.max(0, standardVideoEditing - 1))}
              className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-sm text-brand w-4 text-center">
              {standardVideoEditing}
            </span>
            <button
              type="button"
              onClick={() => setStandardVideoEditing(Math.min(10, standardVideoEditing + 1))}
              className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 6. Dựng phim nâng cao */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">{t.advEditLabel}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-brand font-bold font-mono">
                {priceAdvEditPerVideo.toLocaleString('vi-VN')} ₫ / video
              </span>
              <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                {editingQuality.toUpperCase()}
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 block mt-0.5">
              {locale === 'zh' ? 'Full HD: 280万 • 4K: 350万 • 6K: 650万' : locale === 'en' ? 'Full HD: 2.8M • 4K: 3.5M • 6K: 6.5M' : 'Full HD: 2.8tr • 4K: 3.5tr • 6K: 6.5tr'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdvancedVideoEditing(Math.max(0, advancedVideoEditing - 1))}
              className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-sm text-brand w-4 text-center">
              {advancedVideoEditing}
            </span>
            <button
              type="button"
              onClick={() => setAdvancedVideoEditing(Math.min(10, advancedVideoEditing + 1))}
              className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 7. Voice talent */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">{t.voiceLabel}</span>
            <span className="text-[10px] text-brand font-mono font-semibold">
              {priceVoiceTalent > 0 ? `+${priceVoiceTalent.toLocaleString('vi-VN')} ₫` : '0 ₫'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'none', label: t.optNone },
              { id: 'standard', label: `${t.optStandard} (800k)` },
              { id: 'premium', label: `${t.optPremium} (2.5tr)` }
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVoiceTalent(v.id as any)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  voiceTalent === v.id
                    ? 'bg-brand text-black border-brand shadow-glow font-extrabold'
                    : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8. Hậu kỳ ảnh */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">{t.photoRetouchLabel}</span>
            <span className="text-[10px] text-brand font-mono font-semibold">
              {pricePhotoRetouch > 0 ? `+${pricePhotoRetouch.toLocaleString('vi-VN')} ₫` : '0 ₫'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'none', label: t.optNone },
              { id: 'standard', label: `${t.optStandard} (400k)` },
              { id: 'premium', label: `${t.optPremium} (1.5tr)` }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPhotoRetouch(p.id as any)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  photoRetouch === p.id
                    ? 'bg-brand text-black border-brand shadow-glow font-extrabold'
                    : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Addons Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs hover:border-brand/40 transition-colors">
          <input
            type="checkbox"
            checked={express24h}
            onChange={(e) => setExpress24h(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <span className="text-zinc-200">{t.expressLabel}</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs hover:border-brand/40 transition-colors">
          <input
            type="checkbox"
            checked={makeupMUA}
            onChange={(e) => setMakeupMUA(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <span className="text-zinc-200">{t.makeupLabel}</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs hover:border-brand/40 transition-colors">
          <input
            type="checkbox"
            checked={luxuryPhotobook}
            onChange={(e) => setLuxuryPhotobook(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <span className="text-zinc-200">{t.photobookLabel}</span>
        </label>
      </div>

      {/* Realtime Total Calculation Box */}
      <div className="p-4 rounded-2xl bg-brand/10 border border-brand/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
            {t.totalLabel}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-heading font-black text-2xl sm:text-3xl text-brand">
              {totalPrice.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-xs text-zinc-300">
              ({t.deposit40Prefix} <strong className="text-white font-mono">{deposit40.toLocaleString('vi-VN')} ₫</strong>)
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border hover:border-brand/40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {addedFeedback ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">{t.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-brand" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>

          {/* Direct VietQR Payment button */}
          <button
            type="button"
            onClick={() => onOpenPaymentQr(currentConfigObj)}
            className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-brand/50 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <QrCode className="w-4 h-4 text-brand" />
            <span>{t.vietQrDeposit}</span>
          </button>

          {/* Forward to AI Chatbot button */}
          {onApplyConfigToChat && (
            <button
              type="button"
              onClick={() => onApplyConfigToChat(currentConfigObj)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.sendAiScript}</span>
            </button>
          )}

          {/* Forward to Zalo (VI) or WhatsApp (EN/ZH) */}
          <button
            type="button"
            onClick={() => onSendToZalo(currentConfigObj)}
            className="px-4 py-2.5 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow flex items-center gap-1.5 transition-colors"
          >
            <span>{t.consultCTA}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
