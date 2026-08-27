import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Booking, ChatSession, ChatMessage, AdminOtpSession } from '@/types';

const BOOKINGS_DB_FILE = path.join(process.cwd(), 'src', 'data', 'bookings-db.json');
const CHAT_SESSIONS_DB_FILE = path.join(process.cwd(), 'src', 'data', 'chat-sessions-db.json');
const OTP_DB_FILE = path.join(process.cwd(), 'src', 'data', 'admin-otp-cache.json');

const ADMIN_ALLOWED_EMAIL = 'newholding.net@gmail.com';

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-1001',
    bookingCode: 'NHIEP-78219',
    customerName: 'Nguyễn Hoàng Minh',
    phone: '0988123456',
    email: 'minh.nguyen@vietnamholding.vn',
    zaloOrWhatsapp: '0988123456',
    categoryId: 'photography',
    packageId: 'photo-pre-wedding-premium',
    packageName: 'Gói Cưới Pre-Wedding Hoàng Gia Miền Trung',
    provinceId: 'danang',
    shootDate: '2026-09-15',
    shootTime: '06:00',
    shootAddress: 'InterContinental Danang Sun Peninsula Resort & Biển Mỹ Khê',
    notes: 'Chụp concept bình minh biển và phong cách hoàng gia sang trọng',
    addOns: ['addonDrone', 'addonExpress'],
    estimatedTotalVnd: 15200000,
    status: 'confirmed',
    createdAt: '2026-08-18T14:20:00.000Z'
  },
  {
    id: 'bk-1002',
    bookingCode: 'NHIEP-39104',
    customerName: 'Sarah Jenkins',
    phone: '+84912987654',
    email: 'sarah.j@singaporetech.io',
    zaloOrWhatsapp: '+6591234567',
    categoryId: 'videography',
    packageId: 'video-corporate-tvc',
    packageName: 'Sản Xuất TVC Doanh Nghiệp & Video Giới Thiệu Thương Hiệu',
    provinceId: 'khanhhoa',
    shootDate: '2026-09-22',
    shootTime: '08:00',
    shootAddress: 'Vinpearl Luxury Nha Trang Resort & Cam Ranh Innovation Center',
    notes: 'Filming corporate TVC with bilingual voiceover in English & Vietnamese',
    addOns: ['addonDrone'],
    estimatedTotalVnd: 24000000,
    status: 'pending',
    createdAt: '2026-08-19T08:15:00.000Z'
  },
  {
    id: 'bk-1003',
    bookingCode: 'NHIEP-52871',
    customerName: 'Trần Thị Thảo Vy',
    phone: '0905334455',
    email: 'thaovy.hue@gmail.com',
    zaloOrWhatsapp: '0905334455',
    categoryId: 'travel-photography',
    packageId: 'travel-hue-imperial-citadel',
    packageName: 'Phototour Di Sản Cố Đô Huế & Lăng Tẩm Hoàng Gia',
    provinceId: 'hue',
    shootDate: '2026-09-05',
    shootTime: '15:00',
    shootAddress: 'Đại Nội Huế & Lăng Khải Định',
    notes: 'Concept Áo dài Nhật Bình triều Nguyễn hoàng cung',
    addOns: ['addonMUA', 'addonPhotobook'],
    estimatedTotalVnd: 7300000,
    status: 'confirmed',
    createdAt: '2026-08-17T11:45:00.000Z'
  },
  {
    id: 'bk-1004',
    bookingCode: 'NHIEP-91240',
    customerName: 'Lê Văn Hùng',
    phone: '0913556677',
    email: 'hung.le@quangtribuild.vn',
    zaloOrWhatsapp: '0913556677',
    categoryId: 'event-coverage',
    packageId: 'event-grand-opening',
    packageName: 'Chụp Ảnh & Quay Phim Lễ Khai Trương / Ra Mắt Sản Phẩm',
    provinceId: 'quangtri',
    shootDate: '2026-08-28',
    shootTime: '07:30',
    shootAddress: 'Trung tâm Thương mại Đông Hà, TP. Đông Hà, Quảng Trị',
    notes: 'Lễ cắt băng khánh thành tòa nhà mới và tiệc đón khách VIP',
    addOns: ['addonExpress'],
    estimatedTotalVnd: 7000000,
    status: 'completed',
    createdAt: '2026-08-15T09:00:00.000Z'
  }
];

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'ses-101',
    sessionId: 'session_demo_da_nang_wedding',
    locale: 'vi',
    createdAt: '2026-08-21T08:30:00.000Z',
    updatedAt: '2026-08-21T08:45:00.000Z',
    customerInfo: {
      name: 'Vũ Đức Thành',
      phone: '0935123456',
      zalo: '0935123456',
      email: 'ducthanh.dn@gmail.com'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Chào bạn, tôi muốn quay phóng sự cưới tại resort Đà Nẵng quy mô 150 khách vào tháng 10 tới. Cần tư vấn kịch bản và số lượng máy quay.',
        timestamp: '08:30'
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Chào anh Thành! nhiep.net xin gửi đến anh bản phân tích kịch bản và phương án ekip tối ưu:\n\n🎬 **Kịch bản đề xuất:**\n- Buổi sáng: Chuẩn bị cô dâu chú rể, first look cảm xúc tại biệt thự biển.\n- Buổi chiều: Lễ thành hôn hoàng hôn ngoài bãi biển, drone quay toàn cảnh biển.\n- Buổi tối: Tiệc Gala dinner, khiêu vũ First Dance và pháo hoa nghệ thuật.\n\n🎥 **Số lượng máy & nhân sự đề xuất:**\n- 02 Máy quay 4K Cinema (Sony FX3)\n- 01 Máy chụp phóng sự bắt khoảnh khắc (Sony A7R V)\n- 01 Flycam 5.1K quay toàn cảnh resort\n- 01 Đạo diễn hình ảnh & điều phối âm thanh ánh sáng.',
        timestamp: '08:32'
      }
    ],
    scriptSummary: 'Quay phóng sự cưới 150 khách tại Resort Đà Nẵng, 2 máy quay FX3 + 1 máy chụp + Flycam 5.1K',
    filesCount: 0,
    driveLinksCount: 0,
    convertedToLead: true,
    status: 'converted'
  }
];

// ==========================================
// 1. BOOKINGS STORAGE
// ==========================================

export function getBookings(): Booking[] {
  try {
    if (!fs.existsSync(BOOKINGS_DB_FILE)) {
      fs.writeFileSync(BOOKINGS_DB_FILE, JSON.stringify(INITIAL_BOOKINGS, null, 2), 'utf-8');
      return INITIAL_BOOKINGS;
    }
    const raw = fs.readFileSync(BOOKINGS_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBooking(booking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status'>): Booking {
  const all = getBookings();
  const randomCode = `NHIEP-${Math.floor(10000 + Math.random() * 90000)}`;
  const newBooking: Booking = {
    ...booking,
    id: `bk-${Date.now()}`,
    bookingCode: randomCode,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  all.unshift(newBooking);
  
  try {
    fs.writeFileSync(BOOKINGS_DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving booking to file DB:', err);
  }
  
  return newBooking;
}

export function updateBookingStatus(id: string, status: Booking['status']): Booking | null {
  const all = getBookings();
  const index = all.findIndex((b) => b.id === id || b.bookingCode === id);
  if (index === -1) return null;
  
  all[index].status = status;
  
  try {
    fs.writeFileSync(BOOKINGS_DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error updating booking status:', err);
  }
  
  return all[index];
}

export function deleteBooking(id: string): boolean {
  let all = getBookings();
  const initialLength = all.length;
  all = all.filter((b) => b.id !== id && b.bookingCode !== id);
  
  if (all.length === initialLength) return false;
  
  try {
    fs.writeFileSync(BOOKINGS_DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error deleting booking:', err);
  }
  
  return true;
}

// ==========================================
// 2. CHAT SESSIONS & MACHINE LEARNING STORAGE
// ==========================================

export function getChatSessions(): ChatSession[] {
  try {
    if (!fs.existsSync(CHAT_SESSIONS_DB_FILE)) {
      fs.writeFileSync(CHAT_SESSIONS_DB_FILE, JSON.stringify(INITIAL_SESSIONS, null, 2), 'utf-8');
      return INITIAL_SESSIONS;
    }
    const raw = fs.readFileSync(CHAT_SESSIONS_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function getChatSessionById(sessionId: string): ChatSession | null {
  const sessions = getChatSessions();
  return sessions.find((s) => s.sessionId === sessionId || s.id === sessionId) || null;
}

export function saveOrUpdateChatSession(session: ChatSession): void {
  const all = getChatSessions();
  const index = all.findIndex((s) => s.sessionId === session.sessionId || s.id === session.id);
  
  if (index >= 0) {
    all[index] = { ...all[index], ...session, updatedAt: new Date().toISOString() };
  } else {
    all.unshift({
      ...session,
      id: session.id || `ses-${Date.now()}`,
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  try {
    fs.writeFileSync(CHAT_SESSIONS_DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving chat session DB:', err);
  }
}

export function appendChatMessageToSession(
  sessionId: string,
  message: ChatMessage,
  extra?: {
    locale?: ChatSession['locale'];
    customerInfo?: Partial<ChatSession['customerInfo']>;
    scriptSummary?: string;
    filesCount?: number;
    driveLinksCount?: number;
    convertedToLead?: boolean;
  }
): ChatSession {
  const all = getChatSessions();
  let session = all.find((s) => s.sessionId === sessionId);

  if (!session) {
    session = {
      id: `ses-${Date.now()}`,
      sessionId,
      locale: extra?.locale || 'vi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerInfo: extra?.customerInfo || {},
      messages: [message],
      scriptSummary: extra?.scriptSummary || '',
      filesCount: extra?.filesCount || 0,
      driveLinksCount: extra?.driveLinksCount || 0,
      convertedToLead: extra?.convertedToLead || false,
      status: 'active'
    };
    all.unshift(session);
  } else {
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    if (extra?.customerInfo) {
      session.customerInfo = { ...session.customerInfo, ...extra.customerInfo };
    }
    if (extra?.scriptSummary) {
      session.scriptSummary = extra.scriptSummary;
    }
    if (typeof extra?.filesCount === 'number') {
      session.filesCount = (session.filesCount || 0) + extra.filesCount;
    }
    if (typeof extra?.driveLinksCount === 'number') {
      session.driveLinksCount = (session.driveLinksCount || 0) + extra.driveLinksCount;
    }
    if (extra?.convertedToLead) {
      session.convertedToLead = true;
      session.status = 'converted';
    }
  }

  try {
    fs.writeFileSync(CHAT_SESSIONS_DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error updating chat session DB:', err);
  }

  return session;
}

export function deleteChatSession(sessionId: string): boolean {
  let all = getChatSessions();
  const initialLength = all.length;
  all = all.filter((s) => s.id !== sessionId && s.sessionId !== sessionId);
  if (all.length === initialLength) return false;

  try {
    fs.writeFileSync(CHAT_SESSIONS_DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error deleting chat session:', err);
  }
  return true;
}

// ==========================================
// 3. ADMIN OTP AUTHENTICATION
// ==========================================

export function createAdminOtp(email: string): { success: boolean; otp?: string; message: string; expiresAt?: number } {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_ALLOWED_EMAIL) {
    return {
      success: false,
      message: `Chỉ tài khoản quản trị viên ${ADMIN_ALLOWED_EMAIL} được phép đăng nhập vào hệ thống.`
    };
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const otpData: AdminOtpSession = {
    email: cleanEmail,
    otp,
    expiresAt,
    createdAt: Date.now()
  };

  try {
    fs.writeFileSync(OTP_DB_FILE, JSON.stringify(otpData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing OTP file:', err);
  }

  return {
    success: true,
    otp,
    expiresAt,
    message: `Mã OTP đã được gửi đến ${ADMIN_ALLOWED_EMAIL}`
  };
}

export function verifyAdminOtp(email: string, inputOtp: string): { success: boolean; message: string; token?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = inputOtp.trim();

  if (cleanEmail !== ADMIN_ALLOWED_EMAIL) {
    return { success: false, message: 'Email quản trị viên không hợp lệ.' };
  }

  if (!fs.existsSync(OTP_DB_FILE)) {
    return { success: false, message: 'Chưa có yêu cầu mã OTP nào. Vui lòng bấm gửi mã OTP trước.' };
  }

  try {
    const raw = fs.readFileSync(OTP_DB_FILE, 'utf-8');
    const otpData: AdminOtpSession = JSON.parse(raw);

    if (otpData.email !== cleanEmail) {
      return { success: false, message: 'Email không khớp với phiên gửi OTP.' };
    }

    if (Date.now() > otpData.expiresAt) {
      return { success: false, message: 'Mã OTP đã hết hạn (quá 10 phút). Vui lòng yêu cầu mã mới.' };
    }

    if (otpData.otp !== cleanOtp) {
      return { success: false, message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.' };
    }

    // OTP Valid! Create signed admin session token
    const token = crypto
      .createHmac('sha256', process.env.ADMIN_SECRET_KEY || 'nhiep_admin_key_2026')
      .update(`${cleanEmail}:${Date.now()}`)
      .digest('hex');

    // Invalidate OTP after success
    try {
      fs.unlinkSync(OTP_DB_FILE);
    } catch {}

    return {
      success: true,
      message: 'Xác thực OTP thành công!',
      token
    };
  } catch (err: any) {
    return { success: false, message: 'Lỗi kiểm tra OTP: ' + err.message };
  }
}

export function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  // Token verification can check format or simple secret check
  return token.length >= 32;
}

// ==========================================
// 4. DATASET EXPORT GENERATORS FOR MACHINE LEARNING
// ==========================================

/**
 * Xuất toàn bộ dữ liệu database dạng JSON chuẩn
 */
export function exportFullJsonDataset() {
  const bookings = getBookings();
  const sessions = getChatSessions();

  return {
    platform: 'nhiep.net',
    exportedAt: new Date().toISOString(),
    adminEmail: ADMIN_ALLOWED_EMAIL,
    totalBookings: bookings.length,
    totalChatSessions: sessions.length,
    bookings,
    chatSessions: sessions
  };
}

/**
 * Xuất tập dữ liệu JSONL chuẩn OpenAI / Vertex AI / Gemini fine-tuning
 * Mỗi dòng là 1 JSON Object: {"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}
 */
export function exportJsonlFineTuningDataset(): string {
  const sessions = getChatSessions();
  const systemPrompt = `Bạn là trợ lý AI chuyên gia tư vấn sản xuất hình ảnh, video cinema, flycam và chụp ảnh sự kiện/cưới của nhiep.net tại Đà Nẵng, Huế, Quảng Trị, Khánh Hòa. Hotline/Zalo: 0943391369. Luôn tư vấn kịch bản chi tiết, đề xuất số lượng máy quay chụp và mức giá minh bạch.`;

  const lines: string[] = [];

  for (const session of sessions) {
    if (!session.messages || session.messages.length === 0) continue;

    // Filter valid user and assistant exchanges
    const conversation = [
      { role: 'system', content: systemPrompt },
      ...session.messages.map((m) => ({
        role: m.role,
        content: m.content || ''
      }))
    ];

    if (conversation.length >= 3) {
      lines.push(JSON.stringify({ messages: conversation }));
    }
  }

  // If no lines yet, add initial sample training pairs
  if (lines.length === 0) {
    lines.push(
      JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Tư vấn chụp ảnh cưới áo dài tại Cố đô Huế' },
          {
            role: 'assistant',
            content: 'Tại Huế, nhiep.net gợi ý concept Áo dài Nhật Bình tại Đại Nội & Lăng Khải Định. Ekip chuẩn 1 Nhiếp ảnh gia chuyên nghiệp + 1 Chuyên viên MUA trang điểm hoàng cung. Trả toàn bộ ảnh gốc và 25 ảnh chỉnh sửa cao cấp.'
          }
        ]
      })
    );
  }

  return lines.join('\n');
}

/**
 * Xuất dữ liệu Khách hàng & Đơn hàng dạng CSV (kèm UTF-8 BOM cho Excel)
 */
export function exportCsvDataset(): string {
  const bookings = getBookings();
  const sessions = getChatSessions();

  const headers = [
    'Loại Dữ Liệu',
    'Mã Đơn / Mã Session',
    'Tên Khách Hàng',
    'Số Điện Thoại / Zalo',
    'Email',
    'Dịch Vụ / Gói Đã Chọn',
    'Tỉnh Thành',
    'Ngày Tạo',
    'Tổng Giá Trị (VND)',
    'Trạng Thái',
    'Kịch Bản / Ghi Chú'
  ];

  const rows: string[][] = [];

  // Add Bookings
  for (const b of bookings) {
    rows.push([
      'Đơn Đặt Lịch',
      b.bookingCode,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.phone || b.zaloOrWhatsapp || ''}"`,
      `"${b.email || ''}"`,
      `"${b.packageName.replace(/"/g, '""')}"`,
      b.provinceId,
      b.createdAt,
      b.estimatedTotalVnd.toString(),
      b.status,
      `"${(b.notes || '').replace(/"/g, '""')}"`
    ]);
  }

  // Add Chat Sessions with Leads
  for (const s of sessions) {
    rows.push([
      'Tư Vấn AI Chat',
      s.sessionId,
      `"${(s.customerInfo.name || 'Khách Vãng Lai').replace(/"/g, '""')}"`,
      `"${s.customerInfo.phone || s.customerInfo.zalo || ''}"`,
      `"${s.customerInfo.email || ''}"`,
      `"${(s.scriptSummary || 'Tư vấn kịch bản & báo giá').replace(/"/g, '""')}"`,
      s.locale,
      s.createdAt,
      '0',
      s.status,
      `"Tin nhắn: ${s.messages.length} | Tệp: ${s.filesCount}"`
    ]);
  }

  const csvBody = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return '\uFEFF' + csvBody; // UTF-8 BOM
}
