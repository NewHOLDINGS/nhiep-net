'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Locale, Booking, CategoryId, ProvinceId } from '@/types';
import { getDictionary } from '@/data/translations';
import { PROVINCES } from '@/data/provinces';
import { CATEGORIES } from '@/data/categories';
import {
  ShieldCheck, Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle,
  Phone, Mail, Calendar, MapPin, DollarSign, RefreshCw, Trash2, Eye, ExternalLink, Sparkles
} from 'lucide-react';

export default function AdminPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const handleDelete = async (id: string) => {
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

  // Metrics
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const revenue = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.estimatedTotalVnd || 0), 0);

    return { total, pending, confirmed, completed, revenue };
  }, [bookings]);

  // Filtered List
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

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand text-black flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                {dict.admin.title}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {dict.admin.subtitle}
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-muted hover:bg-surface-elevated border border-surface-border text-xs font-bold text-zinc-200 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand' : ''}`} />
            <span>Làm Mới Dữ Liệu</span>
          </button>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
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
          <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-500/5">
            <p className="text-[11px] font-semibold text-emerald-400">{dict.admin.completedBookings}</p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-brand/40 bg-brand/5 col-span-2 md:col-span-1">
            <p className="text-[11px] font-semibold text-brand">{dict.admin.totalRevenue}</p>
            <p className="font-heading font-black text-xl sm:text-2xl text-brand mt-1 truncate">
              {stats.revenue.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 glass-panel rounded-2xl border border-surface-border space-y-3 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={dict.admin.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-surface-muted border border-surface-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-brand"
              >
                <option value="all">{dict.admin.filterStatus}</option>
                <option value="pending">{dict.admin.statusPending}</option>
                <option value="confirmed">{dict.admin.statusConfirmed}</option>
                <option value="completed">{dict.admin.statusCompleted}</option>
                <option value="cancelled">{dict.admin.statusCancelled}</option>
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

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-brand"
              >
                <option value="all">Tất cả danh mục</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameVi}</option>
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
                  <th className="p-4">{dict.admin.tableCode}</th>
                  <th className="p-4">{dict.admin.tableCustomer}</th>
                  <th className="p-4">{dict.admin.tableService}</th>
                  <th className="p-4">{dict.admin.tableLocation}</th>
                  <th className="p-4">{dict.admin.tableTotal}</th>
                  <th className="p-4">{dict.admin.tableStatus}</th>
                  <th className="p-4 text-right">{dict.admin.tableAction}</th>
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
                          <a href={`tel:${b.phone}`} className="hover:text-brand transition-colors">
                            {b.phone}
                          </a>
                          {b.email && <span>• {b.email}</span>}
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
                      {dict.admin.noBookings}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal View Details */}
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

                {selectedBooking.addOns && selectedBooking.addOns.length > 0 && (
                  <div className="p-3 rounded-xl bg-surface-elevated space-y-1">
                    <p className="text-zinc-400">Tùy chọn bổ sung:</p>
                    <p className="text-amber-400 font-medium">{selectedBooking.addOns.join(', ')}</p>
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
                  onClick={() => handleDelete(selectedBooking.id)}
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
