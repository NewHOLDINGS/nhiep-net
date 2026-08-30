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

const I18N_CART = {
  vi: {
    cartTitle: 'Giỏ Hàng Dịch Vụ',
    cartSubtitle: 'Sản xuất hình ảnh & video chuyên nghiệp nhiep.net',
    emptyTitle: 'Giỏ hàng của bạn đang trống',
    emptyDesc: 'Hãy chọn gói quay chụp từ Bảng Giá hoặc để AI nhiep.net phân tích kịch bản riêng cho bạn!',
    viewPackages: 'Xem Bảng Gói Dịch Vụ',
    selectedItems: 'Dịch vụ đã chọn',
    clearAll: 'Xóa tất cả',
    customBuilderType: 'Cấu hình tùy biến',
    aiPackageType: 'Gói kịch bản AI',
    standardPackageType: 'Gói tiêu chuẩn',
    unitPrice: 'Đơn giá:',
    totalAmountLabel: 'Tổng tiền dịch vụ:',
    deposit40Label: 'Tiền cọc giữ lịch (40%):',
    vietQrSub: 'Quét VietQR MB BANK 89052667799',
    instantVietQrBtn: 'Đặt Cọc Ngay Bằng Mã VietQR MB BANK',
    fillBookingFormBtn: 'Điền Lịch Chi Tiết',
    sendZaloBtn: 'Gửi Qua Zalo',
    cartSummaryPrefix: 'Giỏ hàng'
  },
  en: {
    cartTitle: 'Service Cart',
    cartSubtitle: 'Professional photo & cinema production nhiep.net',
    emptyTitle: 'Your cart is currently empty',
    emptyDesc: 'Choose a production package from our Pricing or let nhiep.net AI craft a custom script for you!',
    viewPackages: 'Explore Service Packages',
    selectedItems: 'Selected Services',
    clearAll: 'Clear All',
    customBuilderType: 'Custom Builder',
    aiPackageType: 'AI Script Package',
    standardPackageType: 'Standard Package',
    unitPrice: 'Price:',
    totalAmountLabel: 'Total Service Value:',
    deposit40Label: '40% Schedule Deposit:',
    vietQrSub: 'Scan VietQR MB BANK 89052667799',
    instantVietQrBtn: 'Instant VietQR MB BANK Deposit',
    fillBookingFormBtn: 'Complete Reservation Details',
    sendZaloBtn: 'Send via WhatsApp/Zalo',
    cartSummaryPrefix: 'Cart with'
  },
  zh: {
    cartTitle: '服务购物车',
    cartSubtitle: 'nhiep.net 电影级专业影视摄影团队',
    emptyTitle: '您的购物车当前为空',
    emptyDesc: '请从价格套餐中选择心仪方案，或让 nhiep.net AI 专属定制拍摄剧本！',
    viewPackages: '浏览精选服务套餐',
    selectedItems: '已选服务项目',
    clearAll: '清空全部',
    customBuilderType: '自由定制方案',
    aiPackageType: 'AI 剧本套餐',
    standardPackageType: '标准套餐',
    unitPrice: '单价：',
    totalAmountLabel: '服务总金额：',
    deposit40Label: '40% 档期锁定订金：',
    vietQrSub: '支持 VietQR MB BANK 89052667799 扫码',
    instantVietQrBtn: '立即通过 VietQR 扫码支付订金',
    fillBookingFormBtn: '填写详细预约信息',
    sendZaloBtn: '通过客服咨询',
    cartSummaryPrefix: '购物车共'
  }
};

export default function CartDrawer({ locale }: { locale: Locale }) {
  const t = I18N_CART[locale] || I18N_CART.vi;
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

    let message = '';
    if (locale === 'zh') {
      message = encodeURIComponent(
        `您好 nhiep.net！我想预约购物车中的服务：\n` +
        `- 订单编号：${code}\n` +
        `- 客户姓名：${user?.name || '客户'}\n` +
        `- 电话：${user?.phone || '未提供'}\n` +
        `服务列表：\n${itemsSummary}\n\n` +
        `- 总金额：${totalAmount.toLocaleString('vi-VN')} ₫\n` +
        `- 40%订金：${depositAmount.toLocaleString('vi-VN')} ₫\n` +
        `请专属顾问协助锁定档期！`
      );
    } else if (locale === 'en') {
      message = encodeURIComponent(
        `Hello nhiep.net! I would like to reserve the services in my cart:\n` +
        `- Booking Code: ${code}\n` +
        `- Customer: ${user?.name || 'Customer'}\n` +
        `- Phone: ${user?.phone || 'Not provided'}\n` +
        `Services List:\n${itemsSummary}\n\n` +
        `- Total Value: ${totalAmount.toLocaleString('vi-VN')} VND\n` +
        `- 40% Deposit: ${depositAmount.toLocaleString('vi-VN')} VND\n` +
        `Please assist me in confirming the schedule!`
      );
    } else {
      message = encodeURIComponent(
        `Chào nhiep.net! Tôi muốn đặt các dịch vụ trong giỏ hàng:\n` +
        `- Mã đơn: ${code}\n` +
        `- Khách hàng: ${user?.name || 'Khách Hàng'}\n` +
        `- SĐT: ${user?.phone || 'Chưa cung cấp'}\n` +
        `Danh sách dịch vụ:\n${itemsSummary}\n\n` +
        `- Tổng chi phí: ${totalAmount.toLocaleString('vi-VN')} ₫\n` +
        `- Tiền cọc 40%: ${depositAmount.toLocaleString('vi-VN')} ₫\n` +
        `Nhờ chuyên viên hỗ trợ giữ lịch cho tôi!`
      );
    }

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
                    {t.cartTitle}
                    <span className="px-2 py-0.5 rounded-full bg-brand text-black font-extrabold text-[10px]">
                      {totalCount}
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {t.cartSubtitle}
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
                    <h4 className="font-bold text-white text-sm">{t.emptyTitle}</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      {t.emptyDesc}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/packages`}
                    onClick={closeCart}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-400 shadow-glow"
                  >
                    <span>{t.viewPackages}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-surface-border/50">
                    <span>{t.selectedItems} ({items.length})</span>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-red-400 hover:text-red-300 text-[11px] font-medium transition-colors"
                    >
                      {t.clearAll}
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
                              ? t.customBuilderType
                              : item.type === 'ai_package'
                              ? t.aiPackageType
                              : t.standardPackageType}
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
                          <span className="text-[10px] text-zinc-400 block">{t.unitPrice}</span>
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
                    <span>{t.totalAmountLabel}</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {totalAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand/10 border border-brand/30">
                    <div>
                      <span className="text-[10px] text-zinc-300 font-bold">
                        {t.deposit40Label}
                      </span>
                      <span className="text-[9px] text-zinc-400 block">
                        {t.vietQrSub}
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
                    <span>{t.instantVietQrBtn}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/${locale}/booking`}
                      onClick={closeCart}
                      className="py-2.5 px-3 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand" />
                      <span>{t.fillBookingFormBtn}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleSendCartToZalo}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t.sendZaloBtn}</span>
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
        packageName={items.map((i) => `${i.name}${i.details ? ` (${i.details})` : ''}`).join(' • ')}
        totalAmountVnd={totalAmount}
        locale={locale}
      />
    </>
  );
}
