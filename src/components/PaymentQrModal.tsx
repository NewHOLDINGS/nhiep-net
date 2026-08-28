'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  QrCode, Copy, Check, ExternalLink, ShieldCheck, X,
  Phone, Sparkles, CheckCircle2, Image as ImageIcon, Download
} from 'lucide-react';
import { Locale } from '@/types';
import { PAYMENT_CONFIG, generateVietQrUrl, calculateDepositAmount } from '@/lib/payment';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  customerName?: string;
  packageName?: string;
  totalAmountVnd: number;
  depositPercentage?: number;
  locale?: Locale;
}

const I18N_MODAL = {
  vi: {
    headerTitle: 'Thanh Toán VietQR MB BANK',
    headerSub: 'MB BANK 89052667799 • NGUYEN XUAN TOI',
    bookingCodeLabel: 'Mã đơn giữ lịch:',
    packageLabel: 'Gói dịch vụ:',
    totalValueLabel: 'Tổng giá trị hợp đồng:',
    depositOptionLabel: 'Mức thanh toán:',
    deposit40: 'Đặt Cọc 40%',
    deposit60: 'Đặt Cọc 60%',
    dynamicQrTab: 'Mã QR Tự Động Điền Tiền',
    officialQrTab: 'Mã QR Gốc MB BANK',
    bankLabel: 'Ngân hàng thụ hưởng:',
    accountLabel: 'Số tài khoản:',
    holderLabel: 'Chủ tài khoản:',
    depositAmountLabel: 'Số tiền cọc',
    memoLabel: 'Nội dung chuyển khoản:',
    copyBtn: 'Sao chép',
    copiedBtn: 'Đã chép',
    sendReceiptZalo: `Gửi Biên Lai Qua Zalo (${PAYMENT_CONFIG.zalo})`,
    confirmPaid: 'Tôi Đã Chuyển Khoản Xong',
    successTitle: 'Xác Nhận Đặt Cọc Thành Công!',
    orderCodePrefix: 'Mã đơn hàng:',
    successDesc: `Hệ thống nhiep.net đã ghi nhận thông tin đặt cọc qua MB BANK (89052667799). Ekip sẽ gọi điện và gửi hợp đồng xác nhận qua Zalo trong vòng 15 phút.`,
    chatZaloNow: `Nhắn Zalo Với Ekip Ngay (${PAYMENT_CONFIG.zalo})`,
    closeBtn: 'Đóng'
  },
  en: {
    headerTitle: 'VietQR MB BANK Payment',
    headerSub: 'MB BANK 89052667799 • NGUYEN XUAN TOI',
    bookingCodeLabel: 'Reservation Code:',
    packageLabel: 'Service Package:',
    totalValueLabel: 'Total Contract Value:',
    depositOptionLabel: 'Deposit Amount:',
    deposit40: '40% Deposit',
    deposit60: '60% Deposit',
    dynamicQrTab: 'Auto-Filled QR Code',
    officialQrTab: 'MB BANK Official QR',
    bankLabel: 'Beneficiary Bank:',
    accountLabel: 'Account Number:',
    holderLabel: 'Account Holder:',
    depositAmountLabel: 'Deposit Amount',
    memoLabel: 'Transfer Memo / Remark:',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    sendReceiptZalo: `Send Receipt via WhatsApp/Zalo (${PAYMENT_CONFIG.zalo})`,
    confirmPaid: 'I Have Completed Transfer',
    successTitle: 'Deposit Notice Received Successfully!',
    orderCodePrefix: 'Order Code:',
    successDesc: `nhiep.net has received your deposit notice via MB BANK (89052667799). Our team will call and send confirmation via WhatsApp/Zalo within 15 minutes.`,
    chatZaloNow: `Chat via WhatsApp/Zalo (${PAYMENT_CONFIG.zalo})`,
    closeBtn: 'Close'
  },
  zh: {
    headerTitle: 'VietQR 越南军队银行扫码支付',
    headerSub: 'MB BANK 89052667799 • NGUYEN XUAN TOI',
    bookingCodeLabel: '预约订单编号：',
    packageLabel: '服务套餐：',
    totalValueLabel: '合同总金额：',
    depositOptionLabel: '订金比例：',
    deposit40: '支付 40% 订金',
    deposit60: '支付 60% 订金',
    dynamicQrTab: '自动填额动态二维码',
    officialQrTab: 'MB BANK 官方固定码',
    bankLabel: '收款银行：',
    accountLabel: '银行账号：',
    holderLabel: '收款户名：',
    depositAmountLabel: '订金金额',
    memoLabel: '转账附言/备注：',
    copyBtn: '复制',
    copiedBtn: '已复制',
    sendReceiptZalo: `发送付款凭证至客服 (${PAYMENT_CONFIG.zalo})`,
    confirmPaid: '我已完成转账支付',
    successTitle: '订金支付确认成功！',
    orderCodePrefix: '订单编号：',
    successDesc: `nhiep.net 系统已记录您的 MB BANK (89052667799) 订金付款凭证。团队将在15分钟内致电并发送档期确认函。`,
    chatZaloNow: `立即联系专属客服 (${PAYMENT_CONFIG.zalo})`,
    closeBtn: '关闭'
  }
};

export default function PaymentQrModal({
  isOpen,
  onClose,
  bookingCode,
  customerName = 'Khách Hàng',
  packageName = 'Dịch Vụ Quay Chụp nhiep.net',
  totalAmountVnd,
  depositPercentage = 40,
  locale = 'vi'
}: PaymentQrModalProps) {
  const t = I18N_MODAL[locale] || I18N_MODAL.vi;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmedPaid, setIsConfirmedPaid] = useState<boolean>(false);
  const [qrType, setQrType] = useState<'dynamic' | 'official'>('dynamic');
  const [customDepositPercent, setCustomDepositPercent] = useState<number>(depositPercentage);

  if (!isOpen) return null;

  const depositPercent = customDepositPercent;
  const currentAmount = calculateDepositAmount(totalAmountVnd, depositPercent);

  const transferMemo = `NHIEP ${bookingCode || 'DIRECT'}`;

  // VietQR Dynamic URL (MB BANK BIN: 970422)
  const dynamicQrUrl = generateVietQrUrl({
    amount: currentAmount,
    bookingCode: bookingCode || 'DIRECT',
    customerName,
    memo: transferMemo
  });

  const activeQrSrc = qrType === 'dynamic' ? dynamicQrUrl : PAYMENT_CONFIG.qrImageStatic;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPaid = () => {
    setIsConfirmedPaid(true);
  };

  let zaloMessage = `Chào nhiep.net! Tôi vừa quét mã VietQR MB BANK đặt cọc cho đơn hàng:\n- Mã đơn: ${bookingCode}\n- Khách hàng: ${customerName}\n- Gói: ${packageName}\n- Số tiền cọc: ${currentAmount.toLocaleString('vi-VN')} ₫\n- Ngân hàng thụ hưởng: MB BANK 89052667799 (NGUYEN XUAN TOI)\nNhờ chuyên viên kiểm tra và gửi xác nhận hợp đồng giữ lịch giúp tôi!`;
  if (locale === 'en') {
    zaloMessage = `Hello nhiep.net! I have completed the deposit payment via VietQR MB BANK:\n- Booking Code: ${bookingCode}\n- Customer: ${customerName}\n- Package: ${packageName}\n- Deposit: ${currentAmount.toLocaleString('vi-VN')} VND\n- Beneficiary: MB BANK 89052667799 (NGUYEN XUAN TOI)\nPlease verify and confirm my reservation!`;
  } else if (locale === 'zh') {
    zaloMessage = `您好 nhiep.net！我已通过 VietQR MB BANK 完成订金转账：\n- 订单号：${bookingCode}\n- 客户姓名：${customerName}\n- 套餐：${packageName}\n- 订金金额：${currentAmount.toLocaleString('vi-VN')} ₫\n- 收款账户：MB BANK 89052667799 (NGUYEN XUAN TOI)\n请专员核验并确认档期！`;
  }

  const zaloNoticeUrl = `https://zalo.me/${PAYMENT_CONFIG.zalo}?text=${encodeURIComponent(zaloMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel bg-surface-card rounded-3xl border border-brand/40 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-glow">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-white flex items-center gap-2">
                {t.headerTitle}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-zinc-400">
                {t.headerSub}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isConfirmedPaid ? (
          <div className="space-y-4">
            {/* Booking & Package Summary Card */}
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-surface-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">{t.bookingCodeLabel}</span>
                <span className="font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/30">
                  {bookingCode || 'NHIEP-DIRECT'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">{t.packageLabel}</span>
                <span className="font-bold text-white max-w-[240px] truncate text-right">
                  {packageName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">{t.totalValueLabel}</span>
                <span className="font-mono font-bold text-zinc-300">
                  {totalAmountVnd.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* Deposit percentage Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 shrink-0 font-medium">{t.depositOptionLabel}</span>
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCustomDepositPercent(40)}
                  className={`py-1.5 rounded-xl font-bold transition-all border ${
                    depositPercent === 40
                      ? 'bg-brand text-black border-brand shadow-glow'
                      : 'bg-surface-elevated text-zinc-300 border-surface-border hover:bg-surface'
                  }`}
                >
                  {t.deposit40} ({calculateDepositAmount(totalAmountVnd, 40).toLocaleString('vi-VN')} ₫)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDepositPercent(60)}
                  className={`py-1.5 rounded-xl font-bold transition-all border ${
                    depositPercent === 60
                      ? 'bg-brand text-black border-brand shadow-glow'
                      : 'bg-surface-elevated text-zinc-300 border-surface-border hover:bg-surface'
                  }`}
                >
                  {t.deposit60} ({calculateDepositAmount(totalAmountVnd, 60).toLocaleString('vi-VN')} ₫)
                </button>
              </div>
            </div>

            {/* QR Switcher Tabs */}
            <div className="flex bg-surface-muted p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setQrType('dynamic')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  qrType === 'dynamic' ? 'bg-brand text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.dynamicQrTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setQrType('official')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  qrType === 'official' ? 'bg-brand text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t.officialQrTab}</span>
              </button>
            </div>

            {/* QR Code Display Card */}
            <div className="p-4 rounded-2xl bg-surface-elevated border border-brand/40 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
              {/* QR Image Box */}
              <div className="relative w-48 h-48 bg-white p-2 rounded-2xl shrink-0 shadow-xl overflow-hidden border-2 border-brand flex items-center justify-center">
                <Image
                  src={activeQrSrc}
                  alt="VietQR MB BANK"
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>

              {/* Bank Details */}
              <div className="flex-1 text-xs space-y-2 w-full">
                <div className="p-2 rounded-xl bg-surface border border-surface-border/60">
                  <span className="text-[10px] text-zinc-400 block">{t.bankLabel}</span>
                  <span className="font-bold text-white text-xs">{PAYMENT_CONFIG.bankName}</span>
                </div>

                <div className="p-2 rounded-xl bg-surface border border-surface-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">{t.accountLabel}</span>
                    <span className="font-mono font-bold text-brand text-sm tracking-wider">
                      {PAYMENT_CONFIG.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(PAYMENT_CONFIG.accountNumber, 'acc')}
                    className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-brand hover:text-black text-zinc-300 text-[10px] font-bold transition-colors flex items-center gap-1"
                  >
                    {copiedField === 'acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'acc' ? t.copiedBtn : t.copyBtn}</span>
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-surface border border-surface-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">{t.holderLabel}</span>
                    <span className="font-bold text-white uppercase text-xs">{PAYMENT_CONFIG.accountHolder}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">{t.depositAmountLabel} ({depositPercent}%):</span>
                    <span className="font-heading font-black text-brand text-base">
                      {currentAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentAmount.toString(), 'amount')}
                    className="px-2 py-1 rounded-lg bg-brand text-black text-[10px] font-extrabold hover:bg-brand-400 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {copiedField === 'amount' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'amount' ? t.copiedBtn : t.copyBtn}</span>
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-surface border border-surface-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">{t.memoLabel}</span>
                    <span className="font-mono font-bold text-amber-400 text-xs">{transferMemo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferMemo, 'memo')}
                    className="px-2 py-1 rounded-lg bg-surface-elevated hover:bg-brand hover:text-black text-zinc-300 text-[10px] font-bold transition-colors flex items-center gap-1"
                  >
                    {copiedField === 'memo' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'memo' ? t.copiedBtn : t.copyBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={zaloNoticeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t.sendReceiptZalo}</span>
              </a>

              <button
                type="button"
                onClick={handleConfirmPaid}
                className="flex-1 py-3 px-4 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 transition-colors flex items-center justify-center gap-2 shadow-glow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.confirmPaid}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Success Screen */
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-heading font-black text-xl text-white">{t.successTitle}</h4>
              <p className="text-xs text-zinc-300 mt-1">
                {t.orderCodePrefix} <strong className="text-brand font-mono font-bold text-sm">{bookingCode}</strong>
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                {t.successDesc}
              </p>
            </div>

            <div className="pt-3 flex flex-col gap-2">
              <a
                href={zaloNoticeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <span>{t.chatZaloNow}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-medium hover:text-white"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
