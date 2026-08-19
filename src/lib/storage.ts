import fs from 'fs';
import path from 'path';
import { Booking } from '@/types';

const DB_FILE = path.join(process.cwd(), 'src', 'data', 'bookings-db.json');

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-1001',
    bookingCode: 'NHP-78219',
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
    bookingCode: 'NHP-39104',
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
    bookingCode: 'NHP-52871',
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
    bookingCode: 'NHP-91240',
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

export function getBookings(): Booking[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_BOOKINGS, null, 2), 'utf-8');
      return INITIAL_BOOKINGS;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBooking(booking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status'>): Booking {
  const all = getBookings();
  const randomCode = `NHP-${Math.floor(10000 + Math.random() * 90000)}`;
  const newBooking: Booking = {
    ...booking,
    id: `bk-${Date.now()}`,
    bookingCode: randomCode,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  all.unshift(newBooking);
  
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
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
    fs.writeFileSync(DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
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
    fs.writeFileSync(DB_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error deleting booking:', err);
  }
  
  return true;
}
