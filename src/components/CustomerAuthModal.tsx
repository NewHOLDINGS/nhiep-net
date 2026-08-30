'use client';

import React, { useState, useEffect } from 'react';
import { Locale, Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import PaymentQrModal from './PaymentQrModal';
import { GoogleIcon, FacebookIcon } from './SocialIcons';
import {
  User, Phone, Mail, MapPin, X, Calendar,
  Sparkles, FileText, QrCode, LogOut, ArrowRight,
  Loader2, Edit3, CheckCircle2, ExternalLink
} from 'lucide-react';

export default function CustomerAuthModal({ locale }: { locale: Locale }) {
  const {
    user,
    login,
    loginWithGoogle,
    loginWithFacebook,
    updateProfile,
    logout,
    isAuthModalOpen,
    closeAuthModal,
    savedQuotes,
    deleteQuote
  } = useAuth();
  
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'quotes'>('profile');
  const [authView, setAuthView] = useState<'social' | 'google_prompt' | 'fb_prompt' | 'manual'>('social');
  
  // Quick social login prompts
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [fbName, setFbName] = useState('');
  const [fbProfileUrl, setFbProfileUrl] = useState('');

  // Manual Form
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  // Edit phone/address state when logged in
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editSavedToast, setEditSavedToast] = useState(false);

  // Bookings list state
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // QR Modal for selected booking
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
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
            const userPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
            const filtered = data.data.filter((b: Booking) => {
              const bPhone = (b.phone || '').replace(/[^0-9]/g, '');
              const bEmail = (b.email || '').toLowerCase().trim();
              const uEmail = (user.email || '').toLowerCase().trim();
              const matchPhone = userPhone && bPhone && (bPhone.includes(userPhone) || userPhone.includes(bPhone));
              const matchEmail = uEmail && bEmail && uEmail === bEmail;
              return matchPhone || matchEmail;
            });
            setMyBookings(filtered);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingBookings(false));
    }
  }, [isAuthModalOpen, user]);

  if (!isAuthModalOpen) return null;

  const handleInstantGoogle = () => {
    // Quick 1-click Google Sign-in
    loginWithGoogle({
      name: 'Nguyễn Khách Hàng',
      email: 'khachhang.nhiep@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  };

  const handleConfirmGooglePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = googleName.trim() || 'Khách Hàng Google';
    let finalEmail = googleEmail.trim();
    if (finalEmail && !finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@gmail.com`;
    }
    if (!finalEmail) {
      finalEmail = 'khachhang@gmail.com';
    }
    loginWithGoogle({
      name: finalName,
      email: finalEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}`
    });
    setAuthView('social');
  };

  const handleInstantFacebook = () => {
    // Quick 1-click Facebook Sign-in
    loginWithFacebook({
      name: 'Facebook Member',
      email: 'member@facebook.com',
      facebookUrl: 'https://facebook.com/khachhang.nhiep',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });
  };

  const handleConfirmFbPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = fbName.trim() || 'Khách Hàng Facebook';
    let finalFb = fbProfileUrl.trim();
    if (!finalFb) {
      finalFb = `https://facebook.com/${encodeURIComponent(finalName.toLowerCase().replace(/\s+/g, '.'))}`;
    } else if (!finalFb.startsWith('http') && !finalFb.includes('facebook.com')) {
      finalFb = `https://facebook.com/${finalFb}`;
    }
    loginWithFacebook({
      name: finalName,
      facebookUrl: finalFb,
      email: finalFb.includes('@') ? finalFb : `${finalName.toLowerCase().replace(/\s+/g, '')}@facebook.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalName)}`
    });
    setAuthView('social');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    login(fullName, phone, email, address);
  };

  const handleSaveContactUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      phone: editPhone.trim(),
      zalo: editPhone.trim(),
      address: editAddress.trim()
    });
    setIsEditingContact(false);
    setEditSavedToast(true);
    setTimeout(() => setEditSavedToast(false), 3000);
  };

  const handleOpenQrForBooking = (b: Booking) => {
    setSelectedBookingForQr(b);
    setIsQrOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg max-h-[90vh] glass-panel bg-[#141416] rounded-3xl border border-surface-border shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-surface-elevated to-surface-card border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/20 text-brand border border-brand/40 flex items-center justify-center shadow-glow shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
                  {user ? user.name : 'Đăng Nhập Khách Hàng Nhanh'}
                  {user ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-brand/20 text-brand text-[10px] font-bold">1-Chạm</span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {user
                    ? 'Tự động đồng bộ thông tin đặt lịch & theo dõi tiến độ'
                    : 'Đăng nhập nhanh bằng Gmail hoặc Facebook để đặt lịch siêu tốc'}
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

          {/* Navigation Tabs (When Logged In) */}
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
                <span>Hồ Sơ Của Bạn</span>
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
              /* SCREEN: NOT LOGGED IN */
              <div className="space-y-4">
                {authView === 'social' && (
                  <>
                    <div className="p-3.5 rounded-2xl bg-brand/10 border border-brand/30 text-xs text-zinc-300 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Chỉ mất <strong>1 giây</strong>! Đăng nhập bằng tài khoản Google hoặc Facebook của bạn để <strong>tự động điền Họ tên, Gmail/Facebook</strong> khi đặt lịch và nhận ưu đãi riêng.
                      </p>
                    </div>

                    {/* Social Fast Buttons */}
                    <div className="space-y-2.5 pt-1">
                      {/* Google Button */}
                      <button
                        type="button"
                        onClick={handleInstantGoogle}
                        className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-sm flex items-center justify-between shadow-md hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <GoogleIcon className="w-5 h-5" />
                          <span className="font-semibold text-zinc-900">Đăng nhập nhanh với Google (Gmail)</span>
                        </div>
                        <span className="text-[11px] text-zinc-500 font-medium px-2 py-0.5 rounded-full bg-zinc-200/80 group-hover:bg-zinc-300 transition-colors">
                          1 Chạm
                        </span>
                      </button>

                      {/* Facebook Button */}
                      <button
                        type="button"
                        onClick={handleInstantFacebook}
                        className="w-full py-3.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-sm flex items-center justify-between shadow-md hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
                            <FacebookIcon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-white">Đăng nhập nhanh với Facebook</span>
                        </div>
                        <span className="text-[11px] text-blue-100 font-medium px-2 py-0.5 rounded-full bg-blue-700/80 group-hover:bg-blue-800 transition-colors">
                          1 Chạm
                        </span>
                      </button>
                    </div>

                    {/* Customize / Prompt Options */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs text-zinc-400 pt-1">
                      <button
                        type="button"
                        onClick={() => setAuthView('google_prompt')}
                        className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-zinc-300 hover:text-white transition-colors"
                      >
                        Nhập Gmail tùy chỉnh
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthView('fb_prompt')}
                        className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-zinc-300 hover:text-white transition-colors"
                      >
                        Nhập link Facebook
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center py-2">
                      <div className="border-t border-surface-border w-full" />
                      <span className="bg-[#141416] px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-semibold absolute">
                        Hoặc điền thủ công
                      </span>
                    </div>

                    {/* Switch to manual */}
                    <button
                      type="button"
                      onClick={() => setAuthView('manual')}
                      className="w-full py-3 rounded-2xl bg-surface-elevated hover:bg-surface border border-surface-border text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4 text-brand" />
                      <span>Đăng nhập bằng Số điện thoại / Zalo</span>
                    </button>
                  </>
                )}

                {/* Google Custom Prompt */}
                {authView === 'google_prompt' && (
                  <form onSubmit={handleConfirmGooglePrompt} className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-surface-border pb-2">
                      <GoogleIcon className="w-5 h-5" />
                      <span>Đăng nhập với tài khoản Google / Gmail</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Họ và tên của bạn:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={googleName}
                          onChange={(e) => setGoogleName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Địa chỉ Gmail:
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="yourname@gmail.com"
                          value={googleEmail}
                          onChange={(e) => setGoogleEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthView('social')}
                        className="w-1/3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
                      >
                        <GoogleIcon className="w-4 h-4" />
                        <span>Xác nhận & Đăng nhập</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Facebook Custom Prompt */}
                {authView === 'fb_prompt' && (
                  <form onSubmit={handleConfirmFbPrompt} className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-surface-border pb-2">
                      <FacebookIcon className="w-5 h-5" />
                      <span>Đăng nhập với tài khoản Facebook</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Tên hiển thị Facebook của bạn:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Hoàng My (Hoang My)"
                          value={fbName}
                          onChange={(e) => setFbName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Link Facebook hoặc Email Facebook (tùy chọn):
                        </label>
                        <input
                          type="text"
                          placeholder="facebook.com/username hoặc email"
                          value={fbProfileUrl}
                          onChange={(e) => setFbProfileUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthView('social')}
                        className="w-1/3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
                      >
                        <FacebookIcon className="w-4 h-4 fill-white" />
                        <span>Xác nhận & Đăng nhập</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Manual Form */}
                {authView === 'manual' && (
                  <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-surface-border pb-2">
                      <span className="text-sm font-bold text-white">Nhập thông tin liên hệ</span>
                      <button
                        type="button"
                        onClick={() => setAuthView('social')}
                        className="text-xs text-brand hover:underline font-semibold"
                      >
                        ⚡ Đăng nhập bằng Google/FB
                      </button>
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
                          Số Điện Thoại / Zalo:
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                          <input
                            type="tel"
                            placeholder="0943391369"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
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
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthView('social')}
                        className="w-1/3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-xs shadow-glow flex items-center justify-center gap-2 transition-all"
                      >
                        <span>Lưu & Đăng Nhập</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : activeTab === 'profile' ? (
              /* SCREEN: TAB 1 - PROFILE DETAILS */
              <div className="space-y-4 text-xs">
                {editSavedToast && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Đã cập nhật thông tin liên hệ thành công!</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-surface-elevated border border-surface-border space-y-3">
                  {/* Top user card */}
                  <div className="flex items-center justify-between border-b border-surface-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-brand/20 border border-brand/40 flex items-center justify-center font-black text-brand text-lg">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{user.name}</span>
                          {user.provider === 'google' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-[10px] flex items-center gap-1">
                              <GoogleIcon className="w-3 h-3" />
                              <span>Google Sync</span>
                            </span>
                          )}
                          {user.provider === 'facebook' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold text-[10px] flex items-center gap-1">
                              <FacebookIcon className="w-3 h-3" />
                              <span>Facebook Sync</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tự động điền khi đặt lịch quay chụp</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingContact(!isEditingContact)}
                      className="p-2 rounded-xl bg-surface hover:bg-surface-muted text-zinc-300 hover:text-brand border border-surface-border text-xs flex items-center gap-1 transition-colors"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sửa SĐT</span>
                    </button>
                  </div>

                  {/* Profile info fields */}
                  {!isEditingContact ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300 pt-1">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Email / Gmail:</span>
                        <strong className="text-white break-all">{user.email || 'Chưa cập nhật'}</strong>
                      </div>
                      {user.facebookUrl && (
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Liên kết Facebook:</span>
                          <a
                            href={user.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span className="truncate max-w-[150px]">{user.facebookUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Số điện thoại / Zalo:</span>
                        <strong className="text-white font-mono">{user.phone || 'Chưa cập nhật (bấm sửa để thêm)'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Địa điểm ưa thích:</span>
                        <strong className="text-white">{user.address || 'Đà Nẵng / Hội An / Huế / Nha Trang'}</strong>
                      </div>
                    </div>
                  ) : (
                    /* Inline edit contact */
                    <form onSubmit={handleSaveContactUpdate} className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-zinc-400 font-semibold mb-1">
                            Số điện thoại / Zalo:
                          </label>
                          <input
                            type="tel"
                            placeholder="0943391369"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-400 font-semibold mb-1">
                            Địa chỉ / Khu vực:
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Đà Nẵng, Hội An"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-brand"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(false)}
                          className="px-3 py-1.5 rounded-lg bg-surface text-zinc-400 text-xs"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-brand text-black font-bold text-xs shadow-sm hover:bg-brand-400 transition-colors"
                        >
                          Lưu Thông Tin
                        </button>
                      </div>
                    </form>
                  )}
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
              /* SCREEN: TAB 2 - BOOKINGS HISTORY */
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
                    <p className="text-zinc-300 font-bold">Chưa tìm thấy lịch quay chụp nào khớp với tài khoản này.</p>
                    <p className="text-[11px] text-zinc-500">
                      Hãy chọn gói dịch vụ để đặt lịch hoặc liên hệ Hotline 0943391369 để kiểm tra hợp đồng!
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
                          {b.depositStatus === 'paid_deposit' ? 'Đã Cọc 40%' : b.depositStatus === 'paid_full' ? 'Đã Thanh Toán Đủ' : 'Chờ Đặt Cọc VietQR'}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm">{b.packageName}</h4>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                        <div>📅 Ngày: <strong className="text-white">{b.shootDate} ({b.shootTime})</strong></div>
                        <div>📍 Địa điểm: <strong className="text-white">{b.shootAddress || b.provinceId}</strong></div>
                        <div>💰 Tổng tiền: <strong className="text-brand font-mono font-bold">{b.estimatedTotalVnd.toLocaleString('vi-VN')} ₫</strong></div>
                        <div>💳 Cọc 40%: <strong className="text-white font-mono">{Math.round(b.estimatedTotalVnd * 0.4).toLocaleString('vi-VN')} ₫</strong></div>
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
              /* SCREEN: TAB 3 - SAVED AI QUOTES */
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
                                  depositVnd: Math.round(pkg.estimatedPriceVnd * 0.4),
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
          customerName={selectedBookingForQr.customerName}
          packageName={selectedBookingForQr.packageName}
          totalAmountVnd={selectedBookingForQr.estimatedTotalVnd}
          locale={locale}
        />
      )}
    </>
  );
}
