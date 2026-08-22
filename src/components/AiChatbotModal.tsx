'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { Locale, ChatMessage, ChatAttachment, CustomPackageOption, AiScriptPlan } from '@/types';
import { getDictionary } from '@/data/translations';
import VoiceInputButton from './VoiceInputButton';
import AttachmentPicker, { AttachmentListPreview } from './AttachmentPicker';
import CustomizerBuilder from './CustomizerBuilder';
import PaymentQrModal from './PaymentQrModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  Bot, Send, X, Sparkles, Phone, MessageSquare, ArrowRight, Loader2,
  User, Film, Camera, Video, CheckCircle2, ShieldCheck, Check,
  ExternalLink, Calendar, PlusCircle, Sliders, QrCode, CreditCard,
  ShoppingBag, Bookmark, Trash2
} from 'lucide-react';
import { PAYMENT_CONFIG } from '@/lib/payment';
import { CustomBuilderConfig } from '@/types';

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
  const { addToCart } = useCart();
  const { user, saveQuote, openAuthModal } = useAuth();

  const [sessionId] = useState<string>(() => `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  // Added to cart notification
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);

  // Lead / Order Closing Modal State
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [selectedPackageToOrder, setSelectedPackageToOrder] = useState<CustomPackageOption | null>(null);
  const [customerNameInput, setCustomerNameInput] = useState(user?.name || '');
  const [customerPhoneInput, setCustomerPhoneInput] = useState(user?.phone || '');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [submittedOrderInfo, setSubmittedOrderInfo] = useState<any>(null);

  // Payment QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    bookingCode: string;
    customerName: string;
    packageName: string;
    totalAmountVnd: number;
  }>({
    bookingCode: '',
    customerName: '',
    packageName: '',
    totalAmountVnd: 6800000
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content:
        locale === 'zh'
          ? '您好！我是 **nhiep.net** 智能摄制总监。您可以语音输入，或上传策划图片、Word/PDF/Excel (.xlsx, .ods)/PowerPoint (.pptx)/CSV/HTML 文件或 Google Drive 链接。我将深度解析并为您量身定制机位、分镜剧本与报价！'
          : locale === 'en'
          ? 'Hello! I am the Senior AI Production Director of **nhiep.net**. You can use voice input, upload concept images, Word/PDF/Excel (.xlsx, .ods)/PowerPoint (.pptx)/CSV/HTML briefs, or Google Drive links. I will analyze your project to create custom shooting scripts, gear & crew proposals, and exact quotes!'
          : 'Xin chào! Tôi là Trợ lý Đạo diễn AI của **nhiep.net**. Bạn có thể nhập yêu cầu, bấm Micro nói, hoặc tải lên ảnh mẫu, file Word, PDF, Excel (.xlsx, .ods), HTML, .csv, PowerPoint (.pptx), file voice hoặc link Google Drive. Tôi sẽ phân tích chi tiết yêu cầu, lập kịch bản, đề xuất số lượng thợ quay/chụp & Flycam theo ngân sách của bạn!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading, showBuilder]);

  useEffect(() => {
    if (user) {
      if (!customerNameInput && user.name) setCustomerNameInput(user.name);
      if (!customerPhoneInput && (user.phone || user.email || user.facebookUrl)) {
        setCustomerPhoneInput(user.phone || user.email || user.facebookUrl || '');
      }
    }
  }, [user]);

  const handleAddAttachment = (att: ChatAttachment) => {
    setAttachments((prev) => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleVoiceTranscript = (transcriptText: string) => {
    setInput((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
  };

  const handleSend = async (customPrompt?: string, manualConfig?: CustomBuilderConfig) => {
    const textToSend = customPrompt || input.trim();
    if ((!textToSend && attachments.length === 0 && !manualConfig) || loading) return;

    const currentAttachments = [...attachments];
    const driveAttachment = currentAttachments.find((a) => a.type === 'drive');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content:
        textToSend ||
        (manualConfig
          ? `Yêu cầu cấu hình tùy biến: ${manualConfig.gimbalOperators} Thợ quay Gimbal Cinema, ${manualConfig.photographers} Thợ chụp Sony A7R V, ${manualConfig.drones} Flycam, Dựng ${manualConfig.editingQuality.toUpperCase()}`
          : `Đã gửi ${attachments.length} tệp tin đính kèm để phân tích kịch bản.`),
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
          customerInfo: {
            name: user?.name || customerNameInput || 'Khách Hàng',
            phone: user?.phone || customerPhoneInput || ''
          },
          attachments: currentAttachments,
          driveLink: driveAttachment?.url || '',
          customConfig: manualConfig || null
        })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          recommendedPackages: data.recommendedPackages,
          scriptPlan: data.scriptPlan,
          customPackages: data.customPackages,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Chat API returned false');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Đã xảy ra sự cố kết nối AI. Bạn có thể liên hệ trực tiếp hotline / Zalo: 0932513678 hoặc chọn cấu hình thủ công bên dưới để chốt lịch nhanh nhất!`,
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

  const handleOpenQrForCustomPackage = (pkg: CustomPackageOption) => {
    const randomCode = `NHP-${Math.floor(10000 + Math.random() * 90000)}`;
    setQrModalData({
      bookingCode: randomCode,
      customerName: user?.name || customerNameInput || 'Khách Hàng',
      packageName: `${pkg.tier}: ${pkg.name} (${pkg.cameraCount})`,
      totalAmountVnd: pkg.estimatedPriceVnd
    });
    setIsQrModalOpen(true);
  };

  const handleOpenQrFromCustomizer = (config: CustomBuilderConfig) => {
    const randomCode = `NHP-${Math.floor(10000 + Math.random() * 90000)}`;
    setQrModalData({
      bookingCode: randomCode,
      customerName: user?.name || customerNameInput || 'Khách Hàng',
      packageName: `Cấu hình ${config.gimbalOperators} Máy quay + ${config.photographers} Máy chụp + ${config.drones} Flycam`,
      totalAmountVnd: config.totalVnd
    });
    setIsQrModalOpen(true);
  };

  const handleAddToCartFromAi = (pkg: CustomPackageOption, planTitle?: string) => {
    addToCart({
      type: 'ai_package',
      name: `${planTitle || 'Kịch bản AI'}: ${pkg.name}`,
      priceVnd: pkg.estimatedPriceVnd,
      depositVnd: Math.round(pkg.estimatedPriceVnd * 0.3),
      quantity: 1,
      details: `${pkg.cameraCount} • ${pkg.gear}`,
      crewSummary: pkg.crewDetails,
      deliverables: pkg.deliverables
    });

    setCartSuccessNotice(`Đã thêm "${pkg.name}" vào giỏ hàng!`);
    setTimeout(() => setCartSuccessNotice(null), 3000);
  };

  const handleSaveQuoteFromPlan = (plan: AiScriptPlan) => {
    saveQuote({
      conceptTitle: plan.conceptTitle,
      summary: plan.summary,
      packages: plan.customPackages
    });
    setCartSuccessNotice('Đã lưu kịch bản vào mục Báo Giá của bạn!');
    setTimeout(() => setCartSuccessNotice(null), 3000);
  };

  const handleSendCustomizerToZalo = (config: CustomBuilderConfig) => {
    const randomCode = `NHP-${Math.floor(10000 + Math.random() * 90000)}`;
    const zaloMsg = encodeURIComponent(
      `Chào nhiep.net! Tôi muốn đặt cấu hình quay chụp tùy biến:\n` +
      `- Mã tạm: ${randomCode}\n` +
      `- Thợ quay Gimbal: ${config.gimbalOperators} thợ\n` +
      `- Thợ chụp ảnh: ${config.photographers} thợ\n` +
      `- Flycam: ${config.drones} máy\n` +
      `- Tiêu chuẩn dựng: ${config.editingQuality.toUpperCase()}\n` +
      `- Tùy chọn thêm: ${config.express24h ? 'Hậu kỳ 24h, ' : ''}${config.makeupMUA ? 'Makeup MUA, ' : ''}${config.luxuryPhotobook ? 'Photobook 30x30' : ''}\n` +
      `- Tổng chi phí ước tính: ${config.totalVnd.toLocaleString('vi-VN')} ₫\n` +
      `Nhờ chuyên viên liên hệ chốt lịch giúp tôi!`
    );
    window.open(`https://zalo.me/0932513678?text=${zaloMsg}`, '_blank');
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

      const zaloUrl = `https://zalo.me/0932513678?text=${zaloMessage}`;

      setSubmittedOrderInfo({
        bookingCode,
        customerName: customerNameInput.trim(),
        phone: customerPhoneInput.trim(),
        packageName: pkgName,
        price: selectedPackageToOrder?.estimatedPriceVndFormatted || `${pkgPrice.toLocaleString('vi-VN')} ₫`,
        totalVnd: pkgPrice,
        zaloUrl
      });

      setOrderSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } catch (err) {
      console.error('Order submission error:', err);
      window.open('https://zalo.me/0932513678', '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl h-[720px] max-h-[94vh] glass-panel bg-surface-card rounded-3xl border border-brand/40 shadow-2xl flex flex-col overflow-hidden">
          
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
                  Đạo Diễn AI • Phân Tích .xlsx .ods .html .csv .pptx • MB BANK 89052667799
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBuilder(!showBuilder)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
                  showBuilder
                    ? 'bg-brand text-black border-brand shadow-glow'
                    : 'bg-surface-elevated text-zinc-300 border-surface-border hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showBuilder ? 'Ẩn Bộ Tùy Chỉnh' : 'Tự Chỉnh Thợ & Máy'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Alert / Notice Banner */}
          {cartSuccessNotice && (
            <div className="bg-emerald-500/90 text-black px-4 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{cartSuccessNotice}</span>
              </div>
              <button onClick={() => setCartSuccessNotice(null)} className="text-black font-bold">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Builder Drawer inside modal */}
          {showBuilder && (
            <div className="p-3 bg-surface-muted/90 border-b border-surface-border animate-in slide-in-from-top-2">
              <CustomizerBuilder
                locale={locale}
                onOpenPaymentQr={handleOpenQrFromCustomizer}
                onSendToZalo={handleSendCustomizerToZalo}
                onApplyConfigToChat={(cfg) => {
                  handleSend(
                    `Tôi muốn cấu hình: ${cfg.gimbalOperators} Thợ quay Gimbal Cinema, ${cfg.photographers} Thợ chụp Sony A7R V, ${cfg.drones} Flycam, chuẩn dựng ${cfg.editingQuality.toUpperCase()}. Bạn hãy lên kịch bản và phân cảnh cho tôi.`,
                    cfg
                  );
                  setShowBuilder(false);
                }}
              />
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-brand text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-glow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs space-y-3 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-brand text-black font-medium rounded-tr-none'
                      : 'bg-surface-elevated text-zinc-200 border border-surface-border/80 rounded-tl-none'
                  }`}
                >
                  {/* User Attachments Preview inside chat bubble */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2 border-b border-black/10">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="px-2.5 py-1 rounded-lg bg-black/10 text-black text-[10px] font-bold flex items-center gap-1.5"
                        >
                          <span>📁 {att.name}</span>
                          {att.textContent && <span className="text-[9px] bg-black/20 px-1 rounded">Đã Phân Tích</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Markdown Content */}
                  <div className="leading-relaxed whitespace-pre-line prose-invert font-sans">
                    {msg.content}
                  </div>

                  {/* Rich AI Script Plan Proposal */}
                  {msg.scriptPlan && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-surface-card border border-brand/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-surface-border pb-2">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-brand" />
                          <h4 className="font-bold text-white text-xs">
                            {msg.scriptPlan.conceptTitle}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveQuoteFromPlan(msg.scriptPlan!)}
                          className="px-2 py-0.5 rounded-lg bg-surface-elevated hover:bg-brand hover:text-black text-[10px] font-bold text-zinc-300 transition-colors flex items-center gap-1"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Lưu Kịch Bản</span>
                        </button>
                      </div>

                      {/* Crew & Camera Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300 bg-surface-muted p-2.5 rounded-xl border border-surface-border">
                        <div>
                          <strong className="text-brand">🎥 Máy quay:</strong> {msg.scriptPlan.cameraCrewProposal.videoCameras}
                        </div>
                        <div>
                          <strong className="text-brand">📷 Máy chụp:</strong> {msg.scriptPlan.cameraCrewProposal.photoCameras}
                        </div>
                        <div>
                          <strong className="text-brand">🚁 Flycam:</strong> {msg.scriptPlan.cameraCrewProposal.drones}
                        </div>
                        <div>
                          <strong className="text-brand">👥 Tổng ekip:</strong> {msg.scriptPlan.cameraCrewProposal.recommendedTotalCrew}
                        </div>
                      </div>

                      {/* Custom Package Tiers */}
                      {msg.customPackages && msg.customPackages.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[10px] font-bold uppercase text-zinc-400">
                            Các Gói Tùy Chọn Đề Xuất Theo Ngân Sách:
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {msg.customPackages.map((pkg) => (
                              <div
                                key={pkg.id}
                                className="p-3 rounded-xl bg-surface border border-surface-border hover:border-brand/50 transition-all flex flex-col justify-between space-y-2 group"
                              >
                                <div>
                                  <span className="text-[9px] font-bold text-zinc-400 block uppercase">
                                    {pkg.tier}
                                  </span>
                                  <h5 className="font-bold text-white text-xs line-clamp-1 group-hover:text-brand transition-colors">
                                    {pkg.name}
                                  </h5>
                                  <span className="font-mono font-extrabold text-brand text-xs block mt-1">
                                    {pkg.estimatedPriceVndFormatted}
                                  </span>
                                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                                    {pkg.highlights}
                                  </p>
                                </div>

                                <div className="space-y-1.5 pt-1 border-t border-surface-border/60">
                                  {/* Add to cart */}
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCartFromAi(pkg, msg.scriptPlan?.conceptTitle)}
                                    className="w-full py-1.5 rounded-lg bg-surface-elevated hover:bg-surface text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-surface-border"
                                  >
                                    <ShoppingBag className="w-3 h-3 text-brand" />
                                    <span>Thêm Vào Giỏ</span>
                                  </button>

                                  {/* Direct VietQR MB Bank */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQrForCustomPackage(pkg)}
                                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
                                  >
                                    <QrCode className="w-3 h-3" />
                                    <span>Cọc MB BANK 30%</span>
                                  </button>

                                  {/* Choose Package & Forward */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCloseModal(pkg)}
                                    className="w-full py-1.5 rounded-lg bg-brand text-black text-[10px] font-bold hover:bg-brand-400 flex items-center justify-center gap-1 transition-colors shadow-glow"
                                  >
                                    <span>Chốt Gói Này</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-right font-mono ${
                      msg.role === 'user' ? 'text-black/60' : 'text-zinc-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-surface-border text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-brand text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-glow">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-surface-elevated border border-surface-border text-xs text-zinc-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                  <span>Đạo diễn AI đang phân tích dữ liệu & tính toán số lượng máy quay...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer Area */}
          <div className="p-3 sm:p-4 bg-surface-card border-t border-surface-border space-y-2">
            {/* Attachment preview list */}
            <AttachmentListPreview
              attachments={attachments}
              onRemove={handleRemoveAttachment}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {/* Attachment Picker for .xlsx, .ods, .html, .csv, .pptx, Word, PDF, Image, Audio, Drive */}
              <AttachmentPicker
                attachments={attachments}
                onAddAttachment={handleAddAttachment}
                onRemoveAttachment={handleRemoveAttachment}
                disabled={loading}
              />

              {/* Voice recording input */}
              <VoiceInputButton
                locale={locale}
                onTranscript={handleVoiceTranscript}
                disabled={loading}
              />

              {/* Text input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nhập yêu cầu sự kiện, ngân sách, số lượng máy quay, hoặc đính kèm file..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="w-full bg-surface-muted border border-surface-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-colors"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-brand text-black font-extrabold text-xs sm:text-sm hover:bg-brand-400 disabled:opacity-40 disabled:hover:bg-brand transition-all flex items-center gap-1.5 shadow-glow"
              >
                <span>Gửi</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Direct VietQR Payment Modal */}
      <PaymentQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        bookingCode={qrModalData.bookingCode}
        customerName={qrModalData.customerName}
        packageName={qrModalData.packageName}
        totalAmountVnd={qrModalData.totalAmountVnd}
      />

      {/* Closing / Lead Modal */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel bg-surface-card rounded-3xl border border-brand/50 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <h4 className="font-bold text-sm text-white">Xác Nhận Giữ Lịch Ekip</h4>
              </div>
              <button
                onClick={() => setIsClosingModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!orderSuccess ? (
              <form onSubmit={handleSubmitOrderToZalo} className="space-y-3">
                <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-xs space-y-1">
                  <span className="text-zinc-400 text-[10px]">Gói đã chọn:</span>
                  <p className="font-bold text-white text-xs">
                    {selectedPackageToOrder?.name || 'Gói Tư Vấn Kịch Bản AI'}
                  </p>
                  <p className="font-mono font-bold text-brand text-xs">
                    {selectedPackageToOrder?.estimatedPriceVndFormatted || 'Liên hệ'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Họ và Tên Quý Khách:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Số Điện Thoại / Zalo để nhận kịch bản:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0932513678"
                    value={customerPhoneInput}
                    onChange={(e) => setCustomerPhoneInput(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsClosingModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand text-black text-xs font-extrabold hover:bg-brand-400 shadow-glow flex items-center gap-1.5"
                  >
                    <span>Xác Nhận Giữ Lịch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-white">Đã Tạo Yêu Cầu Giữ Lịch!</h4>
                <p className="text-xs text-zinc-300">
                  Mã đơn: <strong className="text-brand font-mono">{submittedOrderInfo?.bookingCode}</strong>
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={submittedOrderInfo?.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở Zalo Để Chốt Kịch Bản Ngay</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setIsClosingModalOpen(false);
                      handleOpenQrForCustomPackage(selectedPackageToOrder!);
                    }}
                    className="w-full py-2.5 rounded-xl bg-brand text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-glow"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Quét VietQR MB BANK Đặt Cọc 30%</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
