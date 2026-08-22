'use client';

import React, { useState } from 'react';
import {
  Sliders, Plus, Minus, Check, Video, Camera, Sparkles,
  Send, ExternalLink, QrCode, ArrowRight, ShoppingBag, CheckCircle2
} from 'lucide-react';
import { Locale, CustomBuilderConfig } from '@/types';
import { useCart } from '@/context/CartContext';
import { PAYMENT_CONFIG } from '@/lib/payment';

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

  const deposit30 = Math.round((totalPrice * 0.3) / 10000) * 10000;

  const currentConfigObj: CustomBuilderConfig = {
    gimbalOperators,
    photographers,
    drones,
    editingQuality,
    express24h,
    makeupMUA,
    luxuryPhotobook,
    totalVnd: totalPrice,
    depositVnd: deposit30
  };

  const handleAddToCart = () => {
    addToCart({
      type: 'custom_builder',
      name: `Cấu hình tự chọn: ${gimbalOperators} Gimbal + ${photographers} Chụp + ${drones} Flycam (${editingQuality.toUpperCase()})`,
      priceVnd: totalPrice,
      depositVnd: deposit30,
      quantity: 1,
      details: `Chất lượng: ${editingQuality.toUpperCase()}${express24h ? ' • Hỏa tốc 24h' : ''}${makeupMUA ? ' • Makeup MUA' : ''}${luxuryPhotobook ? ' • Photobook 30x30' : ''}`,
      crewSummary: `${gimbalOperators + photographers + (drones > 0 ? 1 : 0)} Nhân sự kỹ thuật`,
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
              Tự Tùy Chỉnh Thiết Bị & Nhân Sự Theo Ngân Sách
            </h4>
            <p className="text-[10px] text-zinc-400">
              Chủ động chọn số lượng thợ quay gimbal, máy chụp & flycam cho dự án của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* 1. Thợ quay Gimbal */}
        <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">🎥 Thợ quay Gimbal 4K Cinema</span>
            <span className="text-[10px] text-zinc-400">3.500.000 ₫ / thợ</span>
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
            <span className="font-bold text-white block">📷 Thợ chụp ảnh Sony A7R V</span>
            <span className="text-[10px] text-zinc-400">2.200.000 ₫ / thợ</span>
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
            <span className="font-bold text-white block">🚁 Flycam DJI 4K / 5.1K</span>
            <span className="text-[10px] text-zinc-400">1.500.000 ₫ / máy</span>
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
          <span className="font-bold text-white">🎬 Tiêu chuẩn dựng màu sắc:</span>
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
          <span className="text-zinc-200">Hậu kỳ hỏa tốc 24h (+1.2tr)</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={makeupMUA}
            onChange={(e) => setMakeupMUA(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <span className="text-zinc-200">Makeup MUA (+1.0tr)</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={luxuryPhotobook}
            onChange={(e) => setLuxuryPhotobook(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <span className="text-zinc-200">Photobook 30x30 (+1.5tr)</span>
        </label>
      </div>

      {/* Realtime Total Calculation Box */}
      <div className="p-3.5 rounded-2xl bg-brand/10 border border-brand/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
            Tổng chi phí dự toán theo cấu hình:
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-xl sm:text-2xl text-brand">
              {totalPrice.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-[11px] text-zinc-300">
              (Cọc giữ lịch 30%: <strong className="text-white">{deposit30.toLocaleString('vi-VN')} ₫</strong>)
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
                <span className="text-emerald-300 font-bold">Đã Vào Giỏ</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-brand" />
                <span>Thêm Vào Giỏ</span>
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
            <span>Đặt Cọc VietQR MB</span>
          </button>

          {/* Forward to AI Chatbot button */}
          {onApplyConfigToChat && (
            <button
              type="button"
              onClick={() => onApplyConfigToChat(currentConfigObj)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gửi AI Phân Tích Kịch Bản</span>
            </button>
          )}

          {/* Forward to Zalo */}
          <button
            type="button"
            onClick={() => onSendToZalo(currentConfigObj)}
            className="px-4 py-2 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow flex items-center gap-1.5 transition-colors"
          >
            <span>Chốt Gói Qua Zalo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
