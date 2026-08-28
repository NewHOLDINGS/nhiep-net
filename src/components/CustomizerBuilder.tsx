'use client';

import React, { useState } from 'react';
import {
  Sliders, Plus, Minus, Check, Video, Camera, Sparkles,
  Send, ExternalLink, QrCode, ArrowRight, ShoppingBag, CheckCircle2
} from 'lucide-react';
import { Locale, CustomBuilderConfig } from '@/types';
import { useCart } from '@/context/CartContext';
import { PAYMENT_CONFIG } from '@/lib/payment';

const I18N_BUILDER = {
  vi: {
    title: 'Tự Tùy Chỉnh Thiết Bị & Nhân Sự Theo Ngân Sách',
    subtitle: 'Chủ động chọn số lượng thợ quay gimbal, máy chụp & flycam cho dự án của bạn',
    gimbalLabel: '🎥 Thợ quay Gimbal 4K Cinema',
    gimbalPrice: '3.500.000 ₫ / thợ',
    photoLabel: '📷 Thợ chụp ảnh Sony A7R V',
    photoPrice: '2.200.000 ₫ / thợ',
    droneLabel: '🚁 Flycam DJI 4K / 5.1K',
    dronePrice: '1.500.000 ₫ / máy',
    qualityLabel: '🎬 Tiêu chuẩn dựng màu sắc:',
    expressLabel: 'Hậu kỳ hỏa tốc 24h (+1.2tr)',
    makeupLabel: 'Makeup MUA (+1.0tr)',
    photobookLabel: 'Photobook 30x30 (+1.5tr)',
    totalLabel: 'Tổng chi phí dự toán theo cấu hình:',
    deposit40Prefix: 'Cọc giữ lịch 40%:',
    addToCart: 'Thêm Vào Giỏ',
    addedToCart: 'Đã Vào Giỏ',
    vietQrDeposit: 'Đặt Cọc VietQR MB',
    sendAiScript: 'Gửi AI Phân Tích Kịch Bản',
    consultZalo: 'Chốt Gói Qua Zalo'
  },
  en: {
    title: 'Custom Crew & Gear Builder',
    subtitle: 'Customize number of gimbal operators, photographers & aerial drones for your project',
    gimbalLabel: '🎥 4K Cinema Gimbal Operator',
    gimbalPrice: '3,500,000 VND / crew',
    photoLabel: '📷 Sony A7R V Lead Photographer',
    photoPrice: '2,200,000 VND / crew',
    droneLabel: '🚁 DJI 4K / 5.1K Aerial Drone',
    dronePrice: '1,500,000 VND / drone',
    qualityLabel: '🎬 Color Grading Standard:',
    expressLabel: '24-Hour Express (+1.2M)',
    makeupLabel: 'Makeup & Hair (+1.0M)',
    photobookLabel: 'Photobook 30x30 (+1.5M)',
    totalLabel: 'Estimated Total Budget:',
    deposit40Prefix: '40% Schedule Deposit:',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart',
    vietQrDeposit: 'VietQR MB Deposit',
    sendAiScript: 'AI Script Analysis',
    consultZalo: 'Consult via WhatsApp/Zalo'
  },
  zh: {
    title: '自主定制设备与人员方案',
    subtitle: '根据您的项目预算，自由选择电影机云台手、主摄影师与航拍无人机',
    gimbalLabel: '🎥 4K电影级稳定器摄影师',
    gimbalPrice: '3,500,000 ₫ / 位',
    photoLabel: '📷 索尼A7R V资深主摄影师',
    photoPrice: '2,200,000 ₫ / 位',
    droneLabel: '🚁 大疆4K/5.1K高清航拍机',
    dronePrice: '1,500,000 ₫ / 台',
    qualityLabel: '🎬 调色与成片标准：',
    expressLabel: '24小时极速出片 (+120万)',
    makeupLabel: '专属跟妆造型 (+100万)',
    photobookLabel: '30x30水晶相册 (+150万)',
    totalLabel: '定制方案预估总费用：',
    deposit40Prefix: '40%档期锁定订金：',
    addToCart: '加入购物车',
    addedToCart: '已加入',
    vietQrDeposit: 'VietQR MB订金支付',
    sendAiScript: '发送AI剧本分析',
    consultZalo: '专属顾问对接'
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
  const [editingQuality, setEditingQuality] = useState<'fullhd' | '4k' | '6k'>('4k');

  // Add-ons
  const [express24h, setExpress24h] = useState<boolean>(false);
  const [makeupMUA, setMakeupMUA] = useState<boolean>(false);
  const [luxuryPhotobook, setLuxuryPhotobook] = useState<boolean>(false);

  // Base pricing
  const PRICE_GIMBAL = 3500000;
  const PRICE_PHOTO = 2200000;
  const PRICE_DRONE = 1500000;
  const PRICE_QUALITY_4K = 1000000;
  const PRICE_QUALITY_6K = 2500000;
  const PRICE_EXPRESS = 1200000;
  const PRICE_MUA = 1000000;
  const PRICE_PHOTOBOOK = 1500000;

  // Calculate realtime total
  const totalPrice =
    gimbalOperators * PRICE_GIMBAL +
    photographers * PRICE_PHOTO +
    drones * PRICE_DRONE +
    (editingQuality === '4k' ? PRICE_QUALITY_4K : editingQuality === '6k' ? PRICE_QUALITY_6K : 0) +
    (express24h ? PRICE_EXPRESS : 0) +
    (makeupMUA ? PRICE_MUA : 0) +
    (luxuryPhotobook ? PRICE_PHOTOBOOK : 0);

  const deposit40 = Math.round((totalPrice * 0.4) / 10000) * 10000;

  const currentConfigObj: CustomBuilderConfig = {
    gimbalOperators,
    photographers,
    drones,
    editingQuality,
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

    addToCart({
      type: 'custom_builder',
      name: customName,
      priceVnd: totalPrice,
      depositVnd: deposit40,
      quantity: 1,
      details: `${locale === 'zh' ? '成片质量：' : locale === 'en' ? 'Quality: ' : 'Chất lượng: '}${editingQuality.toUpperCase()}${express24h ? ' • 24h' : ''}${makeupMUA ? ' • MUA' : ''}${luxuryPhotobook ? ' • Photobook' : ''}`,
      crewSummary: `${gimbalOperators + photographers + (drones > 0 ? 1 : 0)} ${locale === 'zh' ? '位专业人员' : locale === 'en' ? 'Crew Members' : 'Nhân sự kỹ thuật'}`,
      customConfig: {
        gimbalOperators,
        photographers,
        drones,
        editingQuality,
        express24h,
        makeupMUA,
        luxuryPhotobook
      }
    });

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);
  };

  return (
    <div className="p-4 rounded-2xl bg-surface-card border border-brand/40 shadow-xl space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand/20 text-brand flex items-center justify-center border border-brand/40">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-black text-sm text-white">
              {t.title}
            </h4>
            <p className="text-[10px] text-zinc-400">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* 1. Thợ quay Gimbal */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">{t.gimbalLabel}</span>
            <span className="text-[10px] text-zinc-400">{t.gimbalPrice}</span>
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
            <span className="text-[10px] text-zinc-400">{t.photoPrice}</span>
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

        {/* 3. Flycam trên không */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">{t.droneLabel}</span>
            <span className="text-[10px] text-zinc-400">{t.dronePrice}</span>
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

        {/* 4. Chất lượng dựng video */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-1">
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
                className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  editingQuality === q.id
                    ? 'bg-brand text-black border-brand'
                    : 'bg-surface-muted text-zinc-300 border-surface-border'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Addons Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={express24h}
            onChange={(e) => setExpress24h(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <span className="text-zinc-200">{t.expressLabel}</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={makeupMUA}
            onChange={(e) => setMakeupMUA(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <span className="text-zinc-200">{t.makeupLabel}</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
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
      <div className="p-3.5 rounded-2xl bg-brand/10 border border-brand/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
            {t.totalLabel}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-xl sm:text-2xl text-brand">
              {totalPrice.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-[11px] text-zinc-300">
              ({t.deposit40Prefix} <strong className="text-white">{deposit40.toLocaleString('vi-VN')} ₫</strong>)
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border hover:border-brand/40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {addedFeedback ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">{t.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-brand" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>

          {/* Direct VietQR Payment button */}
          <button
            type="button"
            onClick={() => onOpenPaymentQr(currentConfigObj)}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-brand/50 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-brand" />
            <span>{t.vietQrDeposit}</span>
          </button>

          {/* Forward to AI Chatbot button */}
          {onApplyConfigToChat && (
            <button
              type="button"
              onClick={() => onApplyConfigToChat(currentConfigObj)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.sendAiScript}</span>
            </button>
          )}

          {/* Forward to Zalo */}
          <button
            type="button"
            onClick={() => onSendToZalo(currentConfigObj)}
            className="px-4 py-2 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow flex items-center gap-1.5 transition-colors"
          >
            <span>{t.consultZalo}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
