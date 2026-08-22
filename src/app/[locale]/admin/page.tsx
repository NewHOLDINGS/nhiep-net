'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Locale, Booking, ChatSession } from '@/types';
import { getDictionary } from '@/data/translations';
import { PROVINCES } from '@/data/provinces';
import { CATEGORIES } from '@/data/categories';
import {
  ShieldCheck, Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle,
  Phone, Mail, Calendar, MapPin, DollarSign, RefreshCw, Trash2, Eye, ExternalLink,
  Sparkles, Download, Lock, KeyRound, Bot, MessageSquare, Database, FileText,
  LogOut, Film, Check, ArrowRight, UserCheck
} from 'lucide-react';

const ADMIN_ALLOWED_EMAIL = 'newholding.net@gmail.com';

export default function AdminPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>(ADMIN_ALLOWED_EMAIL);
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>('');
  const [devOtpHint, setDevOtpHint] = useState<string>('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'chat_sessions' | 'ai_dataset'>('bookings');

  // Bookings Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Chat Sessions Data
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [sessionSearch, setSessionSearch] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  // Check initial Auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Chat Sessions
  const fetchChatSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/admin/chat-sessions');
      const data = await res.json();
      if (data.success) {
        setChatSessions(data.data);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchChatSessions();
    }
  }, [isAuthenticated]);

  // Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setDevOtpHint('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (cleanEmail !== ADMIN_ALLOWED_EMAIL) {
      setAuthError(`Quyền truy cập bị từ chối. Chỉ tài khoản ${ADMIN_ALLOWED_EMAIL} được phép đăng nhập.`);
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email: cleanEmail })
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setAuthSuccessMsg(data.message);
        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
        }
      } else {
        setAuthError(data.error || 'Gửi OTP thất bại.');
      }
    } catch (err: any) {
      setAuthError('Lỗi mạng khi gửi yêu cầu OTP: ' + err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!otpInput.trim()) {
      setAuthError('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: emailInput.trim().toLowerCase(),
          otp: otpInput.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } catch (err: any) {
      setAuthError('Lỗi xác thực: ' + err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setOtpSent(false);
    setOtpInput('');
  };

  // Bookings actions
  const handleUpdateStatus = async (id: string, newStatus: Booking['status']) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      } else {
        alert(data.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      alert('Lỗi mạng khi cập nhật');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch đặt này?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        if (selectedBooking?.id === id) setSelectedBooking(null);
      }
    } catch (err) {
      alert('Lỗi khi xóa lịch đặt');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phiên chat này?')) return;
    try {
      const res = await fetch(`/api/admin/chat-sessions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setChatSessions((prev) => prev.filter((s) => s.id !== id && s.sessionId !== id));
        if (selectedSession?.id === id) setSelectedSession(null);
      }
    } catch (err) {
      alert('Lỗi khi xóa phiên chat');
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const revenue = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.estimatedTotalVnd || 0), 0);

    const totalSessions = chatSessions.length;
    const totalConverted = chatSessions.filter((s) => s.convertedToLead).length;

    return { total, pending, confirmed, completed, revenue, totalSessions, totalConverted };
  }, [bookings, chatSessions]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (provinceFilter !== 'all' && b.provinceId !== provinceFilter) return false;
      if (categoryFilter !== 'all' && b.categoryId !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = b.customerName.toLowerCase().includes(q);
        const matchPhone = b.phone.toLowerCase().includes(q);
        const matchCode = b.bookingCode.toLowerCase().includes(q);
        const matchPkg = b.packageName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCode && !matchPkg) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, provinceFilter, categoryFilter, search]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    if (!sessionSearch.trim()) return chatSessions;
    const q = sessionSearch.toLowerCase();
    return chatSessions.filter(
      (s) =>
        s.sessionId.toLowerCase().includes(q) ||
        (s.customerInfo.name && s.customerInfo.name.toLowerCase().includes(q)) ||
        (s.customerInfo.phone && s.customerInfo.phone.toLowerCase().includes(q)) ||
        (s.scriptSummary && s.scriptSummary.toLowerCase().includes(q)) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [chatSessions, sessionSearch]);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {dict.admin.statusPending}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {dict.admin.statusConfirmed}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {dict.admin.statusCompleted}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[11px] font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {dict.admin.statusCancelled}
          </span>
        );
    }
  };

  // 1. SCREEN: AUTHENTICATION LOCK
  if (!isAuthenticated && !authChecking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass-panel bg-surface-card rounded-3xl border border-brand/50 p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/40 text-brand mx-auto flex items-center justify-center shadow-glow">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-heading font-black text-2xl text-white">Xác Thực Quản Trị Viên</h2>
            <p className="text-xs text-zinc-400">
              Bảo mật hệ thống nhiep.net bằng mã OTP gửi về Email quản trị duy nhất.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          {devOtpHint && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs">
              <strong>Mã OTP của bạn: </strong>
              <span className="font-mono font-bold text-sm text-brand">{devOtpHint}</span>
              <button
                type="button"
                onClick={() => setOtpInput(devOtpHint)}
                className="ml-2 text-[10px] underline text-zinc-300 hover:text-white"
              >
                (Tự động điền)
              </button>
            </div>
          )}

          {!otpSent ? (
            /* Step 1: Input Email */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Email Quản Trị Viên:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="newholding.net@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Chỉ email <strong>{ADMIN_ALLOWED_EMAIL}</strong> có quyền truy cập.
                </p>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow transition-colors flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang gửi mã OTP...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Gửi Mã OTP Xác Thực</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Input OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Nhập mã OTP 6 số (gửi tới {emailInput}):
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Nhập 6 số OTP..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-mono tracking-widest text-center text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-medium"
                >
                  Đổi Email
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || otpInput.length < 6}
                  className="w-2/3 py-2.5 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {otpLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Xác Nhận & Đăng Nhập</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 2. SCREEN: AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Admin Email & Logout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand text-black flex items-center justify-center font-bold shadow-glow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  Trung Tâm Quản Trị & Dữ Liệu AI NHIEP.NET
                </h1>
                <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                  <span>Quản trị viên: <strong className="text-brand">{ADMIN_ALLOWED_EMAIL}</strong></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Đã xác thực OTP</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchBookings();
                fetchChatSessions();
              }}
              disabled={loadingBookings || loadingSessions}
              className="px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-surface-elevated border border-surface-border text-xs font-bold text-zinc-200 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings || loadingSessions ? 'animate-spin text-brand' : ''}`} />
              <span>Làm Mới</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div className="p-4 rounded-2xl glass-panel border border-surface-border">
            <p className="text-[11px] font-semibold text-zinc-400">{dict.admin.totalBookings}</p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5">
            <p className="text-[11px] font-semibold text-amber-400">{dict.admin.pendingBookings}</p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-amber-400 mt-1">{stats.pending}</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-blue-500/30 bg-blue-500/5">
            <p className="text-[11px] font-semibold text-blue-400">{dict.admin.confirmedBookings}</p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-blue-400 mt-1">{stats.confirmed}</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 bg-purple-500/5">
            <p className="text-[11px] font-semibold text-purple-400">Phiên Chat AI</p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-purple-400 mt-1">{stats.totalSessions}</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-500/5">
            <p className="text-[11px] font-semibold text-emerald-400">Chốt Đơn AI (Leads)</p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-400 mt-1">{stats.totalConverted}</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-brand/40 bg-brand/5 col-span-2 md:col-span-1">
            <p className="text-[11px] font-semibold text-brand">{dict.admin.totalRevenue}</p>
            <p className="font-heading font-black text-lg sm:text-xl text-brand mt-1 truncate">
              {stats.revenue.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-4 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'bookings'
                ? 'bg-brand text-black shadow-glow'
                : 'bg-surface-muted text-zinc-300 hover:bg-surface-elevated'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Quản Lý Đơn Đặt Lịch ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat_sessions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'chat_sessions'
                ? 'bg-brand text-black shadow-glow'
                : 'bg-surface-muted text-zinc-300 hover:bg-surface-elevated'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>2. Lịch Sử Tư Vấn AI & Kịch Bản ({chatSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_dataset')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'ai_dataset'
                ? 'bg-brand text-black shadow-glow'
                : 'bg-surface-muted text-zinc-300 hover:bg-surface-elevated'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Tải Dữ Liệu Huấn Luyện AI (Fine-Tuning Dataset)</span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="p-4 glass-panel rounded-2xl border border-surface-border space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên khách, SĐT, mã đặt lịch, gói..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-muted border border-surface-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-brand"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="confirmed">Đã duyệt</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>

                  <select
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                    className="bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-brand"
                  >
                    <option value="all">Tất cả tỉnh thành</option>
                    {PROVINCES.map((p) => (
                      <option key={p.id} value={p.id}>{p.nameVi}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-panel rounded-2xl border border-surface-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted text-zinc-400 uppercase tracking-wider text-[10px] border-b border-surface-border">
                    <tr>
                      <th className="p-4">Mã Đơn</th>
                      <th className="p-4">Khách Hàng</th>
                      <th className="p-4">Dịch Vụ & Gói</th>
                      <th className="p-4">Địa Điểm & Ngày</th>
                      <th className="p-4">Tổng Tiền</th>
                      <th className="p-4">Trạng Thái</th>
                      <th className="p-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/60">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-elevated/40 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/30">
                              {b.bookingCode}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{b.customerName}</div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                              <a href={`tel:${b.phone}`} className="hover:text-brand transition-colors font-medium">
                                {b.phone}
                              </a>
                              {b.zaloOrWhatsapp && (
                                <a
                                  href={`https://zalo.me/${b.zaloOrWhatsapp}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  (Zalo)
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-zinc-200 line-clamp-1">{b.packageName}</div>
                            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{b.categoryId}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-zinc-300 font-medium capitalize">{b.provinceId}</div>
                            <div className="text-[11px] text-zinc-400">{b.shootDate} ({b.shootTime})</div>
                          </td>
                          <td className="p-4 font-bold text-brand whitespace-nowrap">
                            {b.estimatedTotalVnd.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {getStatusBadge(b.status)}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedBooking(b)}
                                className="p-1.5 rounded-lg bg-surface-muted hover:bg-surface-elevated text-zinc-300 hover:text-white transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                  disabled={actionLoading === b.id}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition-colors"
                                >
                                  Duyệt
                                </button>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(b.id, 'completed')}
                                  disabled={actionLoading === b.id}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                                >
                                  Hoàn thành
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                  disabled={actionLoading === b.id}
                                  className="px-2.5 py-1 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-300 text-[10px] transition-colors"
                                >
                                  Hủy
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          Chưa có lịch đặt nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI CHAT SESSIONS & SCRIPT ANALYSIS */}
        {activeTab === 'chat_sessions' && (
          <div className="space-y-4">
            <div className="p-4 glass-panel rounded-2xl border border-surface-border">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Tìm theo mã session, tên khách, SĐT, kịch bản, nội dung chat..."
                  className="w-full pl-10 pr-4 py-2 bg-surface-muted border border-surface-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl glass-panel bg-surface-card border border-surface-border hover:border-brand/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-xs text-brand">{s.sessionId}</span>
                        <p className="text-[10px] text-zinc-400">{new Date(s.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    {s.convertedToLead && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã Chốt Đơn
                      </span>
                    )}
                  </div>

                  {s.customerInfo.name && (
                    <div className="p-2.5 rounded-xl bg-surface-elevated text-xs space-y-0.5">
                      <p className="font-bold text-white">{s.customerInfo.name}</p>
                      <p className="text-zinc-300">SĐT Zalo: <a href={`https://zalo.me/${s.customerInfo.phone}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{s.customerInfo.phone}</a></p>
                    </div>
                  )}

                  {s.scriptSummary && (
                    <div className="p-2.5 rounded-xl bg-brand/5 border border-brand/20 text-xs">
                      <span className="font-bold text-brand block mb-0.5 flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        Kịch bản AI:
                      </span>
                      <p className="text-zinc-200 line-clamp-2">{s.scriptSummary}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-surface-border/60 pt-2">
                    <span>{s.messages.length} tin nhắn • {s.filesCount} tệp • {s.driveLinksCount} link Drive</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Xóa phiên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedSession(s)}
                        className="px-3 py-1 rounded-lg bg-surface-muted hover:bg-surface-elevated text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem Hội Thoại</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI DATASET & BACKUP CENTER */}
        {activeTab === 'ai_dataset' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl glass-panel border border-brand/40 bg-gradient-to-br from-surface-card via-surface-elevated to-brand/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand text-black flex items-center justify-center font-bold shadow-glow">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white">
                    Trung Tâm Dữ Liệu & Huấn Luyện AI (Model Fine-Tuning)
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    Toàn bộ kịch bản, báo giá, câu hỏi của khách và hành vi tư vấn đều được đóng gói theo chuẩn Machine Learning (JSONL / JSON / CSV).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border text-xs text-zinc-300 space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5 text-brand">
                  <Sparkles className="w-4 h-4" />
                  Khả năng tự học & cập nhật khi đổi sang Model API mới:
                </p>
                <p>
                  Khi bạn đổi sang bất kỳ model nào khác (Gemini 2.0 Pro, OpenAI GPT-4o, Claude 3.5, Llama 3 Fine-tune...), bạn chỉ cần tải tập dữ liệu <strong>JSONL</strong> dưới đây để fine-tune hoặc nạp vào Vector Database (RAG). Model mới sẽ ngay lập tức kế thừa toàn bộ tri thức tư vấn thực tế của nhiep.net.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* 1. Download JSONL Training Dataset */}
                <div className="p-5 rounded-2xl bg-surface-elevated border border-brand/40 flex flex-col justify-between space-y-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Dataset JSONL Huấn Luyện AI</h4>
                    <p className="text-[11px] text-zinc-400">
                      Chuẩn định dạng Fine-Tuning Google Vertex AI, Gemini, OpenAI GPT.
                    </p>
                  </div>
                  <a
                    href="/api/admin/export?format=jsonl"
                    download
                    className="w-full py-2.5 px-4 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 transition-colors flex items-center justify-center gap-2 shadow-glow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File .JSONL Huấn Luyện</span>
                  </a>
                </div>

                {/* 2. Download Full JSON Database */}
                <div className="p-5 rounded-2xl bg-surface-elevated border border-blue-500/40 flex flex-col justify-between space-y-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Full JSON Database Backup</h4>
                    <p className="text-[11px] text-zinc-400">
                      Toàn bộ cấu trúc đơn đặt lịch, lịch sử trò chuyện AI, kịch bản và tệp tin.
                    </p>
                  </div>
                  <a
                    href="/api/admin/export?format=json"
                    download
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Full Database (.JSON)</span>
                  </a>
                </div>

                {/* 3. Download CSV Leads */}
                <div className="p-5 rounded-2xl bg-surface-elevated border border-emerald-500/40 flex flex-col justify-between space-y-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Báo Cáo Khách Hàng CSV</h4>
                    <p className="text-[11px] text-zinc-400">
                      Mở bằng Microsoft Excel hoặc Google Sheets để tổng hợp doanh thu và số điện thoại.
                    </p>
                  </div>
                  <a
                    href="/api/admin/export?format=csv"
                    download
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Bảng Tính (.CSV)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Chat Session Details */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-2xl glass-panel bg-surface-card rounded-2xl border border-brand p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-brand" />
                  <span className="font-bold text-sm text-white">Lịch Sử Hội Thoại Session: {selectedSession.sessionId}</span>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedSession.customerInfo.name && (
                <div className="p-3 rounded-xl bg-surface-elevated text-xs">
                  <p className="font-bold text-white">Khách hàng: {selectedSession.customerInfo.name}</p>
                  <p className="text-zinc-300">SĐT Zalo: {selectedSession.customerInfo.phone}</p>
                </div>
              )}

              <div className="space-y-3 text-xs max-h-[400px] overflow-y-auto p-2">
                {selectedSession.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl ${
                      m.role === 'user'
                        ? 'bg-brand/10 border border-brand/30 ml-8 text-zinc-200'
                        : 'bg-surface-elevated border border-surface-border mr-8 text-zinc-200'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-zinc-400 mb-1 flex items-center justify-between">
                      <span>{m.role === 'user' ? 'Khách hàng' : 'Đạo diễn AI nhiep.net'}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-line">{m.content}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-surface-border">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Booking Details */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg glass-panel bg-surface-card rounded-2xl border border-brand/50 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/30">
                    {selectedBooking.bookingCode}
                  </span>
                  <span className="text-sm font-bold text-white">Chi Tiết Lịch Đặt</span>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-elevated space-y-1">
                  <p className="text-zinc-400">Khách hàng:</p>
                  <p className="text-sm font-bold text-white">{selectedBooking.customerName}</p>
                  <p className="text-zinc-300">SĐT: {selectedBooking.phone} | Email: {selectedBooking.email || 'N/A'}</p>
                  {selectedBooking.zaloOrWhatsapp && (
                    <p className="text-brand font-medium">Zalo / WhatsApp: {selectedBooking.zaloOrWhatsapp}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated space-y-1">
                  <p className="text-zinc-400">Dịch vụ & Gói:</p>
                  <p className="text-sm font-bold text-brand">{selectedBooking.packageName}</p>
                  <p className="text-zinc-300">Tỉnh thành: {selectedBooking.provinceId} | Danh mục: {selectedBooking.categoryId}</p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated space-y-1">
                  <p className="text-zinc-400">Lịch chụp & Địa chỉ:</p>
                  <p className="text-white font-semibold">{selectedBooking.shootDate} ({selectedBooking.shootTime})</p>
                  <p className="text-zinc-300">{selectedBooking.shootAddress}</p>
                </div>

                {selectedBooking.notes && (
                  <div className="p-3 rounded-xl bg-surface-elevated space-y-1">
                    <p className="text-zinc-400">Ghi chú ý tưởng / Concept:</p>
                    <p className="text-zinc-200 italic">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-between">
                  <span className="font-bold text-white">Tổng chi phí dự kiến:</span>
                  <span className="font-heading font-black text-lg text-brand">
                    {selectedBooking.estimatedTotalVnd.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
                <button
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  className="px-3 py-2 rounded-xl bg-red-900/40 text-red-300 hover:bg-red-800 text-xs font-bold mr-auto flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-bold"
                >
                  Đóng
                </button>
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
                  >
                    Duyệt Lịch
                  </button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
                  >
                    Hoàn Thành
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
