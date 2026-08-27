'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import PaymentQrModal from './PaymentQrModal';
import {
  ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, QrCode,
  ShieldCheck, Check, Sparkles, ExternalLink, Calendar
} from 'lucide-react';
import { PAYMENT_CONFIG } from '@/lib/payment';

export default function CartDrawer({ locale }: { locale: Locale }) {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    depositAmount,
    totalCount
  } = useCart();
  const { user } = useAuth();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [currentBookingCode, setCurrentBookingCode] = useState('');

  if (!isCartOpen) return null;

  const handleOpenDepositQr = () => {
    const code = `NHIEP-CART-${Math.floor(10000 + Math.random() * 90000)}`;
    setCurrentBookingCode(code);
    setIsQrModalOpen(true);
  };

  const handleSendCartToZalo = () => {
    const code = currentBookingCode || `NHIEP-CART-${Math.floor(10000 + Math.random() * 90000)}`;
    const itemsSummary = items
      .map((item, idx) => `${idx + 1}. ${item.name} (x${item.quantity}): ${item.priceVnd.toLocaleString('vi-VN')} ₫`)
      .join('\n');

    const message = encodeURIComponent(
      `Chào nhiep.net! Tôi muốn đặt các dịch vụ trong giỏ hàng:\n` +
      `- Mã đơn: ${code}\n` +
      `- Khách hàng: ${user?.name || 'Khách Hàng'}\n` +
      `- SĐT: ${user?.phone || 'Chưa cung cấp'}\n` +
      `Danh sách dịch vụ:\n${itemsSummary}\n\n` +
      `- Tổng chi phí: ${totalAmount.toLocaleString('vi-VN')} ₫\n` +
      `- Tiền cọc 40%: ${depositAmount.toLocaleString('vi-VN')} ₫\n` +
      `Nhờ chuyên viên hỗ trợ giữ lịch cho tôi!`
    );

    window.open(`https://zalo.me/${PAYMENT_CONFIG.zalo}?text=${message}`, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          onClick={closeCart}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-surface-card border-l border-brand/30 shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-surface-border bg-gradient-to-r from-surface-elevated to-surface-card flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand/20 text-brand flex items-center justify-center border border-brand/40 shadow-glow">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
                    Giỏ Hàng Dịch Vụ
                    <span className="px-2 py-0.5 rounded-full bg-brand text-black font-extrabold text-[10px]">
                      {totalCount}
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Sản xuất hình ảnh & video chuyên nghiệp nhiep.net
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-elevated text-zinc-500 mx-auto flex items-center justify-center border border-surface-border">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Giỏ hàng của bạn đang trống</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      Hãy chọn gói quay chụp từ Bảng Giá hoặc để AI nhiep.net phân tích kịch bản riêng cho bạn!
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/packages`}
                    onClick={closeCart}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-400 shadow-glow"
                  >
                    <span>Xem Bảng Gói Dịch Vụ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-surface-border/50">
                    <span>Dịch vụ đã chọn ({items.length})</span>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-red-400 hover:text-red-300 text-[11px] font-medium transition-colors"
                    >
                      Xóa tất cả
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-surface-elevated border border-surface-border hover:border-brand/40 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/30">
                            {item.type === 'custom_builder'
                              ? 'Cấu hình tùy biến'
                              : item.type === 'ai_package'
                              ? 'Gói kịch bản AI'
                              : 'Gói tiêu chuẩn'}
                          </span>
                          <h4 className="font-bold text-sm text-white mt-1 leading-snug">
                            {item.name}
                          </h4>
                          {item.details && (
                            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                              {item.details}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                          title="Xóa mục này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Pricing and Quantity */}
                      <div className="flex items-center justify-between pt-2 border-t border-surface-border/60">
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Đơn giá:</span>
                          <span className="font-mono font-bold text-brand text-sm">
                            {(item.priceVnd * item.quantity).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-surface rounded-xl p-1 border border-surface-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-surface-elevated hover:bg-surface text-white flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-brand text-black flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-4 border-t border-surface-border bg-surface-card space-y-3 shadow-2xl">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Tổng tiền dịch vụ:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {totalAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand/10 border border-brand/30">
                    <div>
                      <span className="text-[10px] text-zinc-300 font-bold">
                        Tiền cọc giữ lịch (40%):
                      </span>
                      <span className="text-[9px] text-zinc-400">
                        Quét VietQR MB BANK 89052667799
                      </span>
                    </div>
                    <span className="font-heading font-black text-brand text-base">
                      {depositAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenDepositQr}
                    className="w-full py-3 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Đặt Cọc Ngay Bằng Mã VietQR MB BANK</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/${locale}/booking`}
                      onClick={closeCart}
                      className="py-2.5 px-3 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand" />
                      <span>Điền Lịch Chi Tiết</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleSendCartToZalo}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Gửi Qua Zalo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VietQR Deposit Modal for Cart */}
      <PaymentQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        bookingCode={currentBookingCode || `NHIEP-CART-${Math.floor(10000 + Math.random() * 90000)}`}
        packageName={`Giỏ hàng ${items.length} dịch vụ (${items.map((i) => i.name).slice(0, 2).join(', ')})`}
        totalAmountVnd={totalAmount}
      />
    </>
  );
}
