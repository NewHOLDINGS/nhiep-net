'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { Locale, ChatMessage, ChatAttachment, CustomPackageOption, AiScriptPlan } from '@/types';
import { getDictionary } from '@/data/translations';
import VoiceInputButton from './VoiceInputButton';
import AttachmentPicker, { AttachmentListPreview } from './AttachmentPicker';
import {
  Bot, Send, X, Sparkles, Phone, MessageSquare, ArrowRight, Loader2,
  User, Film, Camera, Video, CheckCircle2, ShieldCheck, Check,
  ExternalLink, Calendar, PlusCircle
} from 'lucide-react';

export default function AiChatbotModal({
  locale,
  isOpen,
  onClose
}: {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
}) {
  const dict = getDictionary(locale);
  const [sessionId] = useState<string>(() => `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  // Lead / Order Closing Modal State
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [selectedPackageToOrder, setSelectedPackageToOrder] = useState<CustomPackageOption | null>(null);
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [submittedOrderInfo, setSubmittedOrderInfo] = useState<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content:
        locale === 'zh'
          ? '您好！我是 **nhiep.net** 智能摄制总监与策划顾问。您可以输入文字、点击麦克风语音输入，或上传概念图片、Word/PDF需求文档、录音或Google Drive链接。我将为您实时制定拍摄剧本、推荐机位配置并提供报价！'
          : locale === 'en'
          ? 'Hello! I am the AI Production Director of **nhiep.net**. You can type, use the microphone voice input, or upload concept photos, Word/PDF briefs, audio recordings, or Google Drive links. I will generate a shooting script, recommend camera crew sizes, and offer custom package quotes!'
          : 'Xin chào! Tôi là Trợ lý Đạo diễn AI của **nhiep.net**. Bạn có thể nhập văn bản, bấm Micro nói trực tiếp, hoặc tải lên ảnh mẫu, file Word/PDF kịch bản, file voice thu âm sẵn hoặc link Google Drive. Tôi sẽ phân tích tạo kịch bản, đề xuất số lượng máy quay/chụp và dự toán các gói dịch vụ tối ưu nhất cho bạn!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleAddAttachment = (att: ChatAttachment) => {
    setAttachments((prev) => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleVoiceTranscript = (transcriptText: string) => {
    setInput((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if ((!textToSend && attachments.length === 0) || loading) return;

    const currentAttachments = [...attachments];
    const driveAttachment = currentAttachments.find((a) => a.type === 'drive');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend || (attachments.length > 0 ? `Đã gửi ${attachments.length} tệp tin đính kèm để phân tích kịch bản.` : ''),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      driveLink: driveAttachment?.url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          locale,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          })),
          attachments: currentAttachments,
          driveLink: driveAttachment?.url,
          customerInfo: {
            name: customerNameInput || undefined,
            phone: customerPhoneInput || undefined,
            zalo: customerPhoneInput || undefined
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          scriptPlan: data.scriptPlan,
          customPackages: data.customPackages,
          recommendedPackages: data.recommendedPackages,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Chat request failed');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Đã xảy ra lỗi kết nối. Bạn có thể liên hệ trực tiếp hotline / Zalo: 0932513678 để được tư vấn kịch bản và báo giá tức thì!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCloseModal = (pkg?: CustomPackageOption) => {
    setSelectedPackageToOrder(pkg || null);
    setIsClosingModalOpen(true);
    setOrderSuccess(false);
  };

  const handleSubmitOrderToZalo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerNameInput.trim() || !customerPhoneInput.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại (có Zalo).');
      return;
    }

    const pkgName = selectedPackageToOrder?.name || 'Gói Tư Vấn Kịch Bản AI nhiep.net';
    const pkgPrice = selectedPackageToOrder?.estimatedPriceVnd || 6800000;
    const pkgCameras = selectedPackageToOrder?.cameraCount || 'Theo kịch bản AI đề xuất';

    try {
      // 1. Save to Bookings DB
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerNameInput.trim(),
          phone: customerPhoneInput.trim(),
          zaloOrWhatsapp: customerPhoneInput.trim(),
          packageName: pkgName,
          packageId: selectedPackageToOrder?.id || 'ai-custom-package',
          categoryId: 'videography',
          provinceId: 'danang',
          shootDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          shootTime: '08:00',
          shootAddress: 'Khu vực miền Trung (Đà Nẵng / Huế / Quảng Trị / Nha Trang)',
          notes: `[ĐẶT TỪ AI CHAT NHIEP.NET] Cấu hình: ${pkgCameras}. Giá: ${selectedPackageToOrder?.estimatedPriceVndFormatted || 'Liên hệ'}`,
          estimatedTotalVnd: pkgPrice,
          addOns: []
        })
      });

      const data = await res.json();
      const bookingCode = data?.data?.bookingCode || `NHP-${Math.floor(10000 + Math.random() * 90000)}`;

      // 2. Format Zalo message content
      const zaloMessage = encodeURIComponent(
        `Chào nhiep.net! Tôi muốn chốt lịch dịch vụ qua AI:\n` +
        `- Mã đơn: ${bookingCode}\n` +
        `- Khách hàng: ${customerNameInput.trim()}\n` +
        `- SĐT Zalo: ${customerPhoneInput.trim()}\n` +
        `- Gói dịch vụ: ${pkgName} (${selectedPackageToOrder?.estimatedPriceVndFormatted || ''})\n` +
        `- Số máy quay/chụp: ${pkgCameras}\n` +
        `- Ekip & Thiết bị: ${selectedPackageToOrder?.gear || 'Sony FX3 Cinema & Sony A7R V'}\n` +
        `Nhờ chuyên viên liên hệ lại xác nhận kịch bản chi tiết giúp tôi.`
      );

      // Zalo URL
      const zaloUrl = `https://zalo.me/0932513678?text=${zaloMessage}`;

      setSubmittedOrderInfo({
        bookingCode,
        customerName: customerNameInput.trim(),
        phone: customerPhoneInput.trim(),
        packageName: pkgName,
        price: selectedPackageToOrder?.estimatedPriceVndFormatted || `${pkgPrice.toLocaleString('vi-VN')} ₫`,
        zaloUrl
      });

      setOrderSuccess(true);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Open Zalo
      window.open(zaloUrl, '_blank');
    } catch (err) {
      console.error('Order submission error:', err);
      alert('Không thể lưu đơn, mở liên hệ trực tiếp Zalo 0932513678');
      window.open('https://zalo.me/0932513678', '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[700px] max-h-[92vh] glass-panel bg-surface-card rounded-2xl border border-brand/40 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-surface-elevated via-surface-card to-brand/10 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-brand/50 shadow-glow shrink-0">
              <Image src="/logo.jpg" alt="nhiep.net Logo" fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                {dict.chat.widgetTitle}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-zinc-400">
                Đạo Diễn AI • Phân Tích Kịch Bản • Gợi Ý Máy Quay & Báo Giá 24/7
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCloseModal()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chốt Đơn Zalo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-brand/40 shrink-0 mt-0.5 shadow-sm">
                  <Image src="/logo.jpg" alt="nhiep.net" fill className="object-cover" />
                </div>
              )}

              <div
                className={`max-w-[90%] rounded-2xl p-4 leading-relaxed space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-brand text-black font-medium rounded-tr-none shadow-glow'
                    : 'bg-surface-elevated text-zinc-200 border border-surface-border rounded-tl-none'
                }`}
              >
                {/* User Attachments Preview inside User Bubble */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-2 border-b border-black/20">
                    {msg.attachments.map((att) => (
                      <span
                        key={att.id}
                        className="px-2 py-0.5 rounded-md bg-black/10 text-[10px] font-bold flex items-center gap-1"
                      >
                        📎 {att.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-line prose prose-invert prose-xs text-xs sm:text-sm">
                  {msg.content}
                </div>

                {/* 1. AI SCRIPT & CREW PROPOSAL CARD */}
                {msg.scriptPlan && (
                  <div className="mt-3 p-3.5 rounded-xl bg-surface/90 border border-brand/40 space-y-3">
                    <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider">
                      <Film className="w-4 h-4 text-brand" />
                      <span>{msg.scriptPlan.conceptTitle}</span>
                    </div>

                    {/* Camera & Crew Proposal Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-surface-muted border border-surface-border/60">
                        <span className="text-zinc-400 block font-medium">🎥 Máy quay phim:</span>
                        <span className="text-white font-bold">{msg.scriptPlan.cameraCrewProposal.videoCameras}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-muted border border-surface-border/60">
                        <span className="text-zinc-400 block font-medium">📷 Máy chụp ảnh:</span>
                        <span className="text-white font-bold">{msg.scriptPlan.cameraCrewProposal.photoCameras}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-muted border border-surface-border/60">
                        <span className="text-zinc-400 block font-medium">🚁 Flycam trên không:</span>
                        <span className="text-white font-bold">{msg.scriptPlan.cameraCrewProposal.drones}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-muted border border-surface-border/60">
                        <span className="text-zinc-400 block font-medium">👥 Quy mô ekip:</span>
                        <span className="text-brand font-bold">{msg.scriptPlan.cameraCrewProposal.recommendedTotalCrew}</span>
                      </div>
                    </div>

                    {/* Timeline Breakdown Accordion */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-zinc-300">Phân cảnh & Kịch bản thực hiện:</p>
                      {msg.scriptPlan.timelineBreakdown.map((tl, i) => (
                        <div key={i} className="p-2 rounded-lg bg-surface-elevated/70 border border-surface-border text-[11px]">
                          <div className="flex items-center justify-between gap-1 text-white font-bold">
                            <span>{tl.scene}</span>
                            <span className="text-[10px] text-amber-400 font-normal">{tl.time}</span>
                          </div>
                          <p className="text-zinc-300 text-[10px] mt-1">{tl.description}</p>
                          <p className="text-zinc-500 text-[9px] mt-0.5">Thiết bị: {tl.recommendedGear}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. DYNAMIC CUSTOM PACKAGES TIERS */}
                {msg.customPackages && msg.customPackages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="font-bold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Bảng Tùy Chọn Gói Theo Số Lượng Máy:</span>
                    </p>

                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.customPackages.map((cp) => (
                        <div
                          key={cp.id}
                          className="p-3 rounded-xl bg-surface/90 border border-surface-border hover:border-brand/60 transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                                {cp.tier}
                              </span>
                              <h5 className="font-bold text-xs text-white group-hover:text-brand transition-colors">
                                {cp.name}
                              </h5>
                            </div>
                            <span className="font-extrabold text-sm text-brand shrink-0">
                              {cp.estimatedPriceVndFormatted}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-300 space-y-1 bg-surface-muted/60 p-2 rounded-lg">
                            <p><strong className="text-white">Máy quay:</strong> {cp.cameraCount}</p>
                            <p><strong className="text-white">Ekip & Thiết bị:</strong> {cp.gear}</p>
                            <p className="text-[10px] text-zinc-400 italic">{cp.highlights}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenCloseModal(cp)}
                            className="w-full py-1.5 px-3 rounded-lg bg-brand hover:bg-brand-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform group-hover:scale-[1.01]"
                          >
                            <span>⚡ Chốt Gói Này & Gửi Zalo 0932513678</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. STANDARD RECOMMENDED PACKAGES */}
                {msg.recommendedPackages && msg.recommendedPackages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-border space-y-2">
                    <p className="font-bold text-[11px] text-zinc-300 uppercase tracking-wider">
                      Gói Tiêu Chuẩn Tham Khảo:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.recommendedPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-surface-border hover:border-brand/50 transition-colors"
                        >
                          <div className="relative w-11 h-11 rounded-md overflow-hidden shrink-0">
                            <Image src={pkg.imageUrl} alt={pkg.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-white truncate">{pkg.name}</h5>
                            <p className="text-[11px] font-extrabold text-brand">{pkg.price}</p>
                          </div>
                          <Link
                            href={`/${locale}/booking?package=${pkg.id}`}
                            onClick={onClose}
                            className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-brand hover:text-black text-zinc-200 font-bold text-[10px] shrink-0 flex items-center gap-1 transition-colors border border-surface-border"
                          >
                            <span>Xem Gói</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-1 text-[9px] opacity-60 text-right">{msg.timestamp}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs pl-10">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Đạo diễn AI đang phân tích dữ liệu & lập kịch bản...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-3 py-1.5 bg-surface border-t border-surface-border flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            'Quay phóng sự cưới 2 máy tại Đà Nẵng',
            'Báo giá quay sự kiện & Flycam Nha Trang',
            'Chụp concept áo dài Cố đô Huế',
            'Tư vấn gói TVC doanh nghiệp 3 máy'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-surface-muted hover:bg-surface-elevated border border-surface-border text-[10px] font-medium text-zinc-300 hover:text-brand hover:border-brand/40 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 bg-surface-card border-t border-surface-border">
          {/* Active Attachments Preview */}
          <AttachmentListPreview attachments={attachments} onRemove={handleRemoveAttachment} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            {/* Attachment Button (Images, Word, PDF, Audio, Drive Link) */}
            <AttachmentPicker
              attachments={attachments}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              disabled={loading}
            />

            {/* Voice Input Button (Gemini Mic with Waveform) */}
            <VoiceInputButton
              locale={locale}
              onTranscript={handleVoiceTranscript}
              disabled={loading}
            />

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập yêu cầu, kịch bản hoặc bấm Micro / Đính kèm tệp..."
              className="flex-1 bg-surface-muted border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || loading}
              className="p-2.5 rounded-xl bg-brand text-black font-bold hover:bg-brand-400 disabled:opacity-40 disabled:hover:bg-brand transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Hotline & Zalo Contact Footer */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
            <span>
              Tư vấn trực tiếp 24/7: <a href="tel:0932513678" className="text-brand font-bold hover:underline">0932513678</a>
            </span>
            <a
              href="https://zalo.me/0932513678"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-brand transition-colors font-medium flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Zalo Tư Vấn: 0932513678</span>
            </a>
          </div>
        </div>
      </div>

      {/* LEAD CLOSING & ZALO CONFIRMATION MODAL */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md glass-panel bg-surface-card rounded-2xl border border-brand p-5 sm:p-6 space-y-4 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/20 text-brand flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Chốt Đơn & Giữ Lịch Ekip</h4>
                  <p className="text-[10px] text-zinc-400">Tự động gửi thông tin qua Zalo 0932513678</p>
                </div>
              </div>
              <button
                onClick={() => setIsClosingModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!orderSuccess ? (
              <form onSubmit={handleSubmitOrderToZalo} className="space-y-3.5">
                {selectedPackageToOrder && (
                  <div className="p-3 rounded-xl bg-surface-elevated border border-brand/30 space-y-1">
                    <p className="text-[10px] text-zinc-400">Gói dịch vụ đã chọn:</p>
                    <p className="font-bold text-xs text-white">{selectedPackageToOrder.name}</p>
                    <p className="font-extrabold text-sm text-brand">{selectedPackageToOrder.estimatedPriceVndFormatted}</p>
                    <p className="text-[10px] text-zinc-300">{selectedPackageToOrder.cameraCount}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1">
                    Họ và Tên của bạn: <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Hoàng Nam"
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1">
                    Số điện thoại (có Zalo): <span className="text-brand">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912345678"
                    value={customerPhoneInput}
                    onChange={(e) => setCustomerPhoneInput(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Hệ thống sẽ chuyển thông tin đơn hàng này qua Zalo nhân viên tư vấn <strong>0932513678</strong>.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClosingModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand text-black text-xs font-extrabold hover:bg-brand-400 shadow-glow flex items-center gap-1.5"
                  >
                    <span>Gửi Đơn & Mở Zalo 0932513678</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Đã Tạo Đơn Hàng Thành Công!</h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    Mã đơn: <strong className="text-brand">{submittedOrderInfo?.bookingCode}</strong>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Thông tin kịch bản và báo giá đã được chuẩn bị để gửi tới chuyên viên tư vấn qua Zalo.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={submittedOrderInfo?.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Mở Zalo Tiếp Tục Trò Chuyện (0932513678)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      setIsClosingModalOpen(false);
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-medium hover:text-white"
                  >
                    Hoàn Tất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
