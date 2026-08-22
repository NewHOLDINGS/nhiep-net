'use client';

import React, { useState, useEffect } from 'react';
import { Locale, Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import PaymentQrModal from './PaymentQrModal';
import {
  User, Phone, Mail, MapPin, X, Check, Calendar, Clock,
  ShieldCheck, Sparkles, FileText, QrCode, LogOut, ArrowRight,
  ShoppingBag, ExternalLink, Loader2
} from 'lucide-react';
import { PAYMENT_CONFIG } from '@/lib/payment';

export default function CustomerAuthModal({ locale }: { locale: Locale }) {
  const { user, login, logout, isAuthModalOpen, closeAuthModal, savedQuotes, deleteQuote } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'quotes'>('profile');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  // Bookings list state
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // QR Modal for selected booking
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setPhone(user.phone);
      setEmail(user.email || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Fetch bookings when user opens bookings tab
  useEffect(() => {
    if (isAuthModalOpen && user?.phone) {
      setLoadingBookings(true);
      fetch('/api/bookings')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const userPhone = user.phone.replace(/[^0-9]/g, '');
            const filtered = data.data.filter((b: Booking) => {
              const bPhone = (b.phone || '').replace(/[^0-9]/g, '');
              return bPhone && userPhone && (bPhone.includes(userPhone) || userPhone.includes(bPhone));
            });
            setMyBookings(filtered);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingBookings(false));
    }
  }, [isAuthModalOpen, user]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại / Zalo.');
      return;
    }
    login(fullName, phone, email, address);
  };

  const handleOpenQrForBooking = (b: Booking) => {
    setSelectedBookingForQr(b);
    setIsQrOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl max-h-[90vh] glass-panel bg-surface-card rounded-3xl border border-brand/40 shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-surface-elevated to-surface-card border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/20 text-brand border border-brand/40 flex items-center justify-center shadow-glow shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
                  {user ? `Tài Khoản: ${user.name}` : 'Đăng Nhập Khách Hàng'}
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Theo dõi lịch quay chụp, trạng thái đặt cọc VietQR & kịch bản AI
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAuthModal}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          {user && (
            <div className="flex border-b border-surface-border bg-surface-muted/50 px-4 pt-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Thông Tin Cá Nhân</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'bookings'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch Đã Đặt ({myBookings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quotes')}
                className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'quotes'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kịch Bản AI Lưu ({savedQuotes.length})</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {!user ? (
              /* Screen: Quick Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-brand/10 border border-brand/30 text-xs text-zinc-300 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <p>
                    Đăng nhập hoặc nhập thông tin để đồng bộ giỏ hàng, theo dõi hợp đồng quay chụp và nhận mã VietQR MB BANK xác thực giữ lịch nhanh nhất!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Họ và Tên: <span className="text-brand">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Số Điện Thoại / Zalo: <span className="text-brand">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="tel"
                        required
                        placeholder="0932513678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Email nhận file / hợp đồng (tùy chọn):
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Địa điểm dự kiến (Đà Nẵng / Huế / Nha Trang):
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Ví dụ: Hội An, Đà Nẵng"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-xs shadow-glow flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Lưu & Bắt Đầu Sử Dụng Tài Khoản</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : activeTab === 'profile' ? (
              /* Tab 1: Profile Details */
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface-elevated border border-surface-border space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-border pb-2">
                    <span className="font-bold text-white text-sm">{user.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      Khách Hàng Thân Thiết
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Số điện thoại / Zalo:</span>
                      <strong className="text-white font-mono">{user.phone}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Email:</span>
                      <strong className="text-white">{user.email || 'Chưa cập nhật'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Địa chỉ yêu thích:</span>
                      <strong className="text-white">{user.address || 'Miền Trung (Đà Nẵng, Huế, Quảng Trị, Nha Trang)'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Tài khoản VietQR thụ hưởng:</span>
                      <strong className="text-brand font-mono">MB BANK: 89052667799</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="px-4 py-2 rounded-xl bg-surface hover:bg-red-500/20 hover:text-red-400 border border-surface-border text-zinc-400 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng Xuất Tài Khoản</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="px-5 py-2 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : activeTab === 'bookings' ? (
              /* Tab 2: Bookings History */
              <div className="space-y-3 text-xs">
                {loadingBookings ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" />
                    <p className="text-zinc-400 mt-2">Đang tải danh sách lịch đặt...</p>
                  </div>
                ) : myBookings.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-elevated text-zinc-500 mx-auto flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-zinc-300 font-bold">Chưa tìm thấy lịch quay chụp nào với số điện thoại này.</p>
                    <p className="text-[11px] text-zinc-500">
                      Hãy chọn gói dịch vụ để đặt lịch hoặc liên hệ Hotline 0932513678 để kiểm tra hợp đồng!
                    </p>
                  </div>
                ) : (
                  myBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-surface-elevated border border-surface-border hover:border-brand/40 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-brand">{b.bookingCode}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.depositStatus === 'paid_deposit' || b.depositStatus === 'paid_full'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {b.depositStatus === 'paid_deposit' ? 'Đã Cọc 30%' : b.depositStatus === 'paid_full' ? 'Đã Thanh Toán Đủ' : 'Chờ Đặt Cọc VietQR'}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm">{b.packageName}</h4>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                        <div>📅 Ngày: <strong className="text-white">{b.shootDate} ({b.shootTime})</strong></div>
                        <div>📍 Địa điểm: <strong className="text-white">{b.shootAddress || b.provinceId}</strong></div>
                        <div>💰 Tổng tiền: <strong className="text-brand font-mono font-bold">{b.estimatedTotalVnd.toLocaleString('vi-VN')} ₫</strong></div>
                        <div>💳 Cọc 30%: <strong className="text-white font-mono">{Math.round(b.estimatedTotalVnd * 0.3).toLocaleString('vi-VN')} ₫</strong></div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border/60">
                        <button
                          type="button"
                          onClick={() => handleOpenQrForBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-brand text-black font-extrabold text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Mã QR Đặt Cọc MB BANK</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Tab 3: Saved AI Quotes */
              <div className="space-y-3 text-xs">
                {savedQuotes.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-elevated text-zinc-500 mx-auto flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-zinc-300 font-bold">Chưa có kịch bản AI nào được lưu.</p>
                    <p className="text-[11px] text-zinc-500">
                      Khi chat với Trợ lý AI nhiep.net, bạn có thể lưu lại kịch bản yêu thích để xem lại tại đây!
                    </p>
                  </div>
                ) : (
                  savedQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-surface-elevated border border-surface-border space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{q.conceptTitle}</span>
                        <button
                          type="button"
                          onClick={() => deleteQuote(q.id)}
                          className="text-zinc-500 hover:text-red-400 text-[10px]"
                        >
                          Xóa
                        </button>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">{q.summary}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {q.packages.map((pkg) => (
                          <div key={pkg.id} className="p-2 rounded-xl bg-surface border border-surface-border/80">
                            <span className="text-[9px] text-zinc-400 block">{pkg.tier}</span>
                            <span className="font-bold text-white text-xs block truncate">{pkg.name}</span>
                            <span className="font-mono font-bold text-brand text-xs block">{pkg.estimatedPriceVndFormatted}</span>
                            <button
                              type="button"
                              onClick={() => {
                                addToCart({
                                  type: 'ai_package',
                                  name: `${q.conceptTitle} - ${pkg.name}`,
                                  priceVnd: pkg.estimatedPriceVnd,
                                  depositVnd: Math.round(pkg.estimatedPriceVnd * 0.3),
                                  quantity: 1,
                                  details: `${pkg.cameraCount} • ${pkg.gear}`,
                                  crewSummary: pkg.crewDetails
                                });
                                closeAuthModal();
                              }}
                              className="mt-2 w-full py-1 rounded-lg bg-brand/20 hover:bg-brand text-brand hover:text-black font-bold text-[10px] transition-colors"
                            >
                              Thêm Vào Giỏ Hàng
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment QR Modal for Booking */}
      {selectedBookingForQr && (
        <PaymentQrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          bookingCode={selectedBookingForQr.bookingCode}
          packageName={selectedBookingForQr.packageName}
          totalAmountVnd={selectedBookingForQr.estimatedTotalVnd}
        />
      )}
    </>
  );
}
