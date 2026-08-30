export const PAYMENT_CONFIG = {
  bankName: 'MB BANK (Ngân hàng TMCP Quân Đội)',
  bankShortName: 'MBBank',
  bankCode: '970422', // MB Bank BIN code for VietQR
  accountNumber: '89052667799',
  accountHolder: 'NGUYEN XUAN TOI',
  qrImageStatic: '/qrmb.jpg',
  qrImageBizVat: '/qr_newholdings_bizmbbank.jpg',
  defaultDepositPercentage: 40, // 40% deposit
  hotline: '0943391369',
  zalo: '0943391369'
};

export interface VietQrOptions {
  amount?: number;
  bookingCode?: string;
  customerName?: string;
  memo?: string;
}

/**
 * Sinh đường dẫn VietQR động có sẵn số tiền và nội dung chuyển khoản MB BANK
 */
export function generateVietQrUrl(options: VietQrOptions): string {
  const { amount = 0, bookingCode = '', memo = '' } = options;
  const content = memo || (bookingCode ? `NHIEP ${bookingCode}` : 'NHIEP DAT COC');
  const encodedContent = encodeURIComponent(content.slice(0, 50));
  const encodedAccountName = encodeURIComponent(PAYMENT_CONFIG.accountHolder);

  if (amount > 0) {
    return `https://img.vietqr.io/image/${PAYMENT_CONFIG.bankCode}-${PAYMENT_CONFIG.accountNumber}-compact2.jpg?amount=${Math.round(amount)}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;
  }

  // Without fixed amount
  return `https://img.vietqr.io/image/${PAYMENT_CONFIG.bankCode}-${PAYMENT_CONFIG.accountNumber}-compact2.jpg?addInfo=${encodedContent}&accountName=${encodedAccountName}`;
}

/**
 * Tính số tiền đặt cọc theo tỷ lệ phần trăm (mặc định 40%)
 */
export function calculateDepositAmount(totalVnd: number, percentage = 40): number {
  if (!totalVnd || totalVnd <= 0) return 1000000; // minimum 1 million VND deposit
  const deposit = Math.round((totalVnd * (percentage / 100)) / 10000) * 10000;
  return Math.max(deposit, 500000);
}
