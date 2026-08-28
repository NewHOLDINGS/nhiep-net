'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Locale, CategoryId, ProvinceId } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { PROVINCES } from '@/data/provinces';
import { PACKAGES } from '@/data/packages';
import { getDictionary } from '@/data/translations';
import {
  CalendarPlus, Check, ChevronRight, ChevronLeft, MapPin, Sparkles,
  Phone, Mail, User, Clock, Calendar, CheckCircle2, ShieldCheck, ArrowRight, Loader2,
  QrCode, ExternalLink, Copy, MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { PAYMENT_CONFIG, generateVietQrUrl } from '@/lib/payment';
import { GoogleIcon, FacebookIcon } from '@/components/SocialIcons';

const ADDONS = [
  { id: 'addonDrone', nameVi: 'Flycam 4K / 5.1K trên không', nameEn: '4K / 5.1K Aerial Drone Flight', nameZh: '4K/5.1K高清航拍无人机', priceVnd: 1500000 },
  { id: 'addonExpress', nameVi: 'Hậu kỳ hỏa tốc nhận file trong 24h', nameEn: '24-Hour Express Rapid Delivery', nameZh: '24小时极速出片通道', priceVnd: 1200000 },
  { id: 'addonExtraPhotographer', nameVi: 'Thêm 01 Nhiếp ảnh gia phụ', nameEn: '1 Additional Lead Photographer', nameZh: '增加1位资深副摄影师', priceVnd: 1800000 },
  { id: 'addonMUA', nameVi: 'Chuyên viên Trang điểm & Làm tóc', nameEn: 'On-Location Makeup Artist & Hair Styling', nameZh: '专属造型师跟妆与发型设计', priceVnd: 1000000 },
  { id: 'addonPhotobook', nameVi: 'In thêm 01 Album Photobook cao cấp 30x30cm', nameEn: '1 Additional Luxury Photobook 30x30cm', nameZh: '加印1本30x30cm高档水晶相册', priceVnd: 1500000 },
];

const I18N_BOOKING = {
  vi: {
    systemTag: 'HỆ THỐNG ĐẶT LỊCH TRỰC TUYẾN',
    title: 'Đặt Lịch Trực Tuyến Nhanh Chóng',
    subtitle: 'Chỉ mất 2 phút để lựa chọn gói dịch vụ ưng ý và giữ lịch với ekip xuất sắc nhất',
    step1: '1. Dịch vụ & Địa điểm',
    step2: '2. Gói & Tùy chọn',
    step3: '3. Thời gian & Địa chỉ',
    step4: '4. Thông tin liên hệ',
    step5: '5. Đặt cọc VietQR',
    step6: '6. Hoàn tất đặt lịch',
    selectCategory: 'Chọn Danh Mục Dịch Vụ',
    selectProvince: 'Chọn Tỉnh / Thành Phố',
    selectPackage: 'Chọn Gói Dịch Vụ',
    addOnsTitle: 'Tùy Chọn Bổ Sung (Add-ons)',
    estimatedTotal: 'Tổng Chi Phí Ước Tính:',
    shootDate: 'Ngày chụp / quay dự kiến',
    shootTime: 'Khung giờ bắt đầu',
    shootAddress: 'Địa chỉ cụ thể / Khách sạn / Resort',
    shootAddressPlaceholder: 'Ví dụ: InterContinental Danang Resort / Phố cổ Hội An / Biển Mỹ Khê...',
    fullName: 'Họ và tên khách hàng',
    fullNamePlaceholder: 'Nguyễn Văn A',
    phoneNumber: 'Số điện thoại liên hệ',
    phoneNumberPlaceholder: '0943391369',
    emailAddress: 'Địa chỉ Email (nhận file & hợp đồng)',
    emailAddressPlaceholder: 'example@gmail.com',
    zaloOrWhatsapp: 'Số Zalo hoặc link Facebook / WhatsApp',
    zaloOrWhatsappPlaceholder: 'Số Zalo hoặc link Facebook để ekip liên hệ nhanh',
    specialNotes: 'Ghi chú thêm về concept, trang phục, yêu cầu đặc biệt',
    specialNotesPlaceholder: 'Ghi chú về concept chụp, trang phục chuẩn bị, yêu cầu đặc biệt...',
    autoFilled: 'Đã tự động điền',
    autoSynced: 'Đã tự động đồng bộ thông tin',
    quickFillNotice: 'Chỉ cần 30 giây để hoàn tất thông tin',
    oneTapLogin: 'Đăng nhập 1-chạm để tự động điền Họ tên & Gmail / Facebook:',
    noPasswordRequired: 'Không cần mật khẩu',
    continueGoogle: 'Tiếp tục với Google / Gmail',
    continueFacebook: 'Tiếp tục với Facebook',
    autoFilledFrom: 'Đã tự động điền từ tài khoản',
    readyToBook: 'Thông tin liên hệ đã sẵn sàng để giữ lịch',
    switchAccount: 'Đổi tài khoản',
    selectedPackage: 'Gói đã chọn:',
    addonsCount: 'Tùy chọn bổ sung',
    prevStep: 'Quay Lại',
    nextStep: 'Tiếp Tục',
    proceedToDeposit: 'Tiếp Tục Đến Bước Đặt Cọc',
    savingBooking: 'Đang lưu yêu cầu đặt lịch...',
    // Step 5 Deposit
    depositHeader: 'Mục Đặt Cọc Giữ Lịch Ekip (VietQR MB BANK)',
    depositSub: 'MB BANK 89052667799 • NGUYEN XUAN TOI • Quét mã chuyển khoản tự động 24/7',
    depositNotice: 'Vui lòng hoàn tất thanh toán tiền đặt cọc để hệ thống khóa lịch và giữ ekip ưu tiên cho bạn.',
    depositOptionLabel: 'Mức đặt cọc:',
    deposit40Label: 'Đặt Cọc 40%',
    deposit60Label: 'Đặt Cọc 60%',
    bookingCodeLabel: 'Mã đơn giữ lịch:',
    customerLabel: 'Khách hàng:',
    phoneLabel: 'Số điện thoại:',
    packageLabel: 'Gói dịch vụ:',
    shootTimeLabel: 'Thời gian chụp:',
    shootAddressLabel: 'Địa điểm:',
    totalCostLabel: 'Tổng chi phí:',
    bankNameLabel: 'Ngân hàng thụ hưởng:',
    bankNameValue: 'MB BANK (Ngân hàng TMCP Quân Đội)',
    accountNumberLabel: 'Số tài khoản:',
    accountHolderLabel: 'Chủ tài khoản:',
    depositAmountLabel: 'Số tiền cọc:',
    transferMemoLabel: 'Nội dung chuyển khoản:',
    copyBtn: 'Sao chép',
    copiedBtn: 'Đã chép',
    sendZaloBtn: 'Gửi Hóa Đơn / Biên Lai Qua Zalo (0943391369)',
    confirmPaidBtn: 'Xác Nhận Tôi Đã Thanh Toán',
    nextBtn: 'Tiếp Theo',
    backToEdit: 'Quay lại chỉnh sửa thông tin',
    // Step 6 Success
    congratsTitle: '🎉 Chúc Mừng Bạn Đã Đặt Lịch Thành Công!',
    congratsSubtitle: 'Mã đặt lịch chính thức của bạn là:',
    congratsMessage: 'Yêu cầu đặt lịch và thông tin chuyển khoản cọc của bạn đã được ghi nhận trên hệ thống nhiep.net. Chuyên viên tư vấn sẽ liên hệ trực tiếp qua điện thoại / Zalo trong vòng 15 phút để xác nhận chi tiết kịch bản và chuẩn bị ekip chu đáo nhất.',
    orderSummaryTitle: 'Chi Tiết Phiếu Xác Nhận Giữ Lịch',
    emailLabel: 'Email nhận file:',
    depositPaidLabel: 'Mức đặt cọc:',
    statusLabel: 'Trạng thái đơn:',
    statusValue: 'Đã gửi yêu cầu giữ lịch (Chờ đối soát 24/7)',
    backHomeBtn: 'Về Trang Chủ',
    callHotlineBtn: 'Gọi Hotline Xác Nhận (0943391369)',
    chatZaloBtn: 'Nhắn Zalo Với Chuyên Viên (0943391369)',
    adminBtn: 'Kiểm Tra Trong Quản Trị',
    fillRequiredAlert: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Ngày chụp!',
    connectionErrorAlert: 'Không thể kết nối đến máy chủ. Vui lòng liên hệ Hotline 0943391369.',
    copiedSuccessAlert: 'Đã sao chép vào bộ nhớ tạm: '
  },
  en: {
    systemTag: 'ONLINE RESERVATION SYSTEM',
    title: 'Fast Online Reservation',
    subtitle: 'It takes only 2 minutes to customize your package and secure your preferred dates with top-tier creators',
    step1: '1. Service & Location',
    step2: '2. Package & Add-ons',
    step3: '3. Schedule & Address',
    step4: '4. Contact Details',
    step5: '5. VietQR Deposit',
    step6: '6. Confirmation',
    selectCategory: 'Select Service Category',
    selectProvince: 'Select Province / City',
    selectPackage: 'Select Service Package',
    addOnsTitle: 'Optional Production Add-ons',
    estimatedTotal: 'Estimated Total:',
    shootDate: 'Estimated Shoot Date',
    shootTime: 'Start Time',
    shootAddress: 'Exact Venue / Hotel / Resort Address',
    shootAddressPlaceholder: 'e.g. InterContinental Danang Resort / Hoi An Ancient Town / My Khe Beach...',
    fullName: 'Customer Full Name',
    fullNamePlaceholder: 'John Doe',
    phoneNumber: 'Contact Phone Number',
    phoneNumberPlaceholder: '+84 943 391 369',
    emailAddress: 'Email Address for Deliverables',
    emailAddressPlaceholder: 'example@gmail.com',
    zaloOrWhatsapp: 'WhatsApp / Zalo or Social Link',
    zaloOrWhatsappPlaceholder: 'WhatsApp number or Social link for rapid coordination',
    specialNotes: 'Special Notes / Moodboard / Specific Requests',
    specialNotesPlaceholder: 'Notes about concept, styling, preferred angles or special requests...',
    autoFilled: 'Auto-filled',
    autoSynced: 'Information automatically synced',
    quickFillNotice: 'Takes only 30 seconds to complete',
    oneTapLogin: '1-Tap sign in to auto-fill Name & Email / Facebook:',
    noPasswordRequired: 'No password required',
    continueGoogle: 'Continue with Google / Gmail',
    continueFacebook: 'Continue with Facebook',
    autoFilledFrom: 'Auto-filled from',
    readyToBook: 'Contact information is ready for reservation',
    switchAccount: 'Switch account',
    selectedPackage: 'Selected Package:',
    addonsCount: 'Add-ons',
    prevStep: 'Previous',
    nextStep: 'Continue',
    proceedToDeposit: 'Continue to VietQR Deposit',
    savingBooking: 'Saving your reservation...',
    // Step 5 Deposit
    depositHeader: 'Secure Your Schedule with VietQR MB BANK Deposit',
    depositSub: 'MB BANK 89052667799 • NGUYEN XUAN TOI • 24/7 Automated QR Transfer',
    depositNotice: 'Please complete your deposit transfer to officially hold your shoot schedule and assign our lead creators.',
    depositOptionLabel: 'Deposit Amount:',
    deposit40Label: '40% Deposit',
    deposit60Label: '60% Deposit',
    bookingCodeLabel: 'Reservation Code:',
    customerLabel: 'Customer:',
    phoneLabel: 'Phone / WhatsApp:',
    packageLabel: 'Service Package:',
    shootTimeLabel: 'Shoot Schedule:',
    shootAddressLabel: 'Location / Venue:',
    totalCostLabel: 'Total Value:',
    bankNameLabel: 'Beneficiary Bank:',
    bankNameValue: 'MB BANK (Military Commercial Joint Stock Bank)',
    accountNumberLabel: 'Account Number:',
    accountHolderLabel: 'Account Holder:',
    depositAmountLabel: 'Deposit Amount:',
    transferMemoLabel: 'Transfer Memo / Remark:',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    sendZaloBtn: 'Send Receipt via Zalo / WhatsApp (+84943391369)',
    confirmPaidBtn: 'I Have Completed Transfer',
    nextBtn: 'Next Step',
    backToEdit: 'Back to edit information',
    // Step 6 Success
    congratsTitle: '🎉 Congratulations! Your Booking Is Placed!',
    congratsSubtitle: 'Your official reservation code is:',
    congratsMessage: 'Your booking request and deposit notice have been successfully received by nhiep.net. Our production manager will contact you via Phone/WhatsApp within 15 minutes to confirm all production details and prepare the best team.',
    orderSummaryTitle: 'Reservation Summary Confirmation',
    emailLabel: 'Deliverables Email:',
    depositPaidLabel: 'Deposit Selected:',
    statusLabel: 'Order Status:',
    statusValue: 'Booking Submitted (Pending 24/7 Verification)',
    backHomeBtn: 'Return to Home',
    callHotlineBtn: 'Call Hotline (+84 943 391 369)',
    chatZaloBtn: 'Chat with Specialist (+84 943 391 369)',
    adminBtn: 'View in Admin Portal',
    fillRequiredAlert: 'Please fill in Full Name, Phone Number, and Shoot Date!',
    connectionErrorAlert: 'Unable to connect to server. Please contact Hotline +84 943 391 369.',
    copiedSuccessAlert: 'Copied to clipboard: '
  },
  zh: {
    systemTag: '在线智能预约系统',
    title: '快速在线预约档期',
    subtitle: '仅需2分钟即可定制您的专属拍摄方案，锁定优秀摄影团队档期',
    step1: '1. 服务与城市',
    step2: '2. 套餐与增值',
    step3: '3. 时间与地址',
    step4: '4. 联系人信息',
    step5: '5. VietQR订金支付',
    step6: '6. 预约确认成功',
    selectCategory: '选择服务类别',
    selectProvince: '选择服务省份/城市',
    selectPackage: '选择精选套餐',
    addOnsTitle: '可选增值服务（Add-ons）',
    estimatedTotal: '预估总费用：',
    shootDate: '预计拍摄日期',
    shootTime: '开拍时间',
    shootAddress: '具体拍摄场地 / 酒店 / 度假村名称',
    shootAddressPlaceholder: '例如：岘港洲际度假村 / 会安古镇 / 美溪海滩...',
    fullName: '客户姓名',
    fullNamePlaceholder: '张三',
    phoneNumber: '联系电话',
    phoneNumberPlaceholder: '+84 943 391 369',
    emailAddress: '接收文件电子邮箱',
    emailAddressPlaceholder: 'example@gmail.com',
    zaloOrWhatsapp: '微信 / WhatsApp / Zalo 账号',
    zaloOrWhatsappPlaceholder: '微信号、WhatsApp或联系方式，方便客服对接',
    specialNotes: '拍摄风格期望、参考灵感或其他要求',
    specialNotesPlaceholder: '关于拍摄概念、服装准备、特定机位或特殊要求...',
    autoFilled: '已自动填写',
    autoSynced: '已自动同步信息',
    quickFillNotice: '仅需30秒即可完成填写',
    oneTapLogin: '一键登录自动填入姓名与邮箱 / Facebook：',
    noPasswordRequired: '无需密码',
    continueGoogle: '使用 Google / Gmail 继续',
    continueFacebook: '使用 Facebook 继续',
    autoFilledFrom: '已自动填入自账号',
    readyToBook: '联系信息已就绪，可直接预约档期',
    switchAccount: '切换账号',
    selectedPackage: '已选套餐：',
    addonsCount: '增值项目',
    prevStep: '上一步',
    nextStep: '下一步',
    proceedToDeposit: '下一步：前往支付订金',
    savingBooking: '正在保存预约需求...',
    // Step 5 Deposit
    depositHeader: 'VietQR MB BANK 订金支付锁定团队档期',
    depositSub: 'MB BANK 89052667799 • NGUYEN XUAN TOI • 24/7 扫码自动入账',
    depositNotice: '请完成订金转账以正式锁定摄影团队档期并优先分配主创人员。',
    depositOptionLabel: '订金比例：',
    deposit40Label: '支付 40% 订金',
    deposit60Label: '支付 60% 订金',
    bookingCodeLabel: '预约订单编号：',
    customerLabel: '客户姓名：',
    phoneLabel: '联系电话：',
    packageLabel: '服务套餐：',
    shootTimeLabel: '拍摄时间：',
    shootAddressLabel: '拍摄地点：',
    totalCostLabel: '总费用：',
    bankNameLabel: '收款银行：',
    bankNameValue: 'MB BANK（越南军队商业股份银行）',
    accountNumberLabel: '银行账号：',
    accountHolderLabel: '收款户名：',
    depositAmountLabel: '订金金额：',
    transferMemoLabel: '转账附言/备注：',
    copyBtn: '复制',
    copiedBtn: '已复制',
    sendZaloBtn: '通过 Zalo / WhatsApp 发送付款凭证 (0943391369)',
    confirmPaidBtn: '我已完成转账支付',
    nextBtn: '下一步',
    backToEdit: '返回修改预约信息',
    // Step 6 Success
    congratsTitle: '🎉 恭喜您！预约提交成功！',
    congratsSubtitle: '您的专属预约订单号为：',
    congratsMessage: '您的预约需求与订金凭据已成功录入 nhiep.net 系统。专属客服专员将在15分钟内通过电话或Zalo/微信与您对接确认拍摄脚本并准备优秀团队。',
    orderSummaryTitle: '档期锁定凭证详情',
    emailLabel: '文件接收邮箱：',
    depositPaidLabel: '已选订金：',
    statusLabel: '订单状态：',
    statusValue: '已提交预约（24/7核验处理中）',
    backHomeBtn: '返回网站首页',
    callHotlineBtn: '拨打客服热线 (+84 943 391 369)',
    chatZaloBtn: '联系专属客服 (+84 943 391 369)',
    adminBtn: '前往管理后台查看',
    fillRequiredAlert: '请完整填写客户姓名、联系电话与预计拍摄日期！',
    connectionErrorAlert: '无法连接到服务器，请联系客服热线 +84 943 391 369。',
    copiedSuccessAlert: '已成功复制到剪贴板：'
  }
};

function BookingForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = I18N_BOOKING[locale] || I18N_BOOKING.vi;
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();
  const preselectedPackageId = searchParams.get('package');

  // Multi-step state (1 to 6)
  // Step 1: Category & Province
  // Step 2: Package & Add-ons
  // Step 3: Schedule & Address
  // Step 4: Contact info & Form
  // Step 5: VietQR MB Bank Deposit
  // Step 6: Congratulatory Confirmation Screen
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [depositPercent, setDepositPercent] = useState<number>(40);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('photography');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceId>('danang');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [shootDate, setShootDate] = useState<string>('');
  const [shootTime, setShootTime] = useState<string>('08:00');
  const [shootAddress, setShootAddress] = useState<string>('');
  
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [zaloOrWhatsapp, setZaloOrWhatsapp] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Auto sync user from auth
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.facebookUrl && !zaloOrWhatsapp) {
        setZaloOrWhatsapp(user.facebookUrl);
      } else if (user.zalo && !zaloOrWhatsapp) {
        setZaloOrWhatsapp(user.zalo);
      }
      if (user.address && !shootAddress) setShootAddress(user.address);
    }
  }, [user]);

  // Sync if query param package exists
  useEffect(() => {
    if (preselectedPackageId) {
      const found = PACKAGES.find((p) => p.id === preselectedPackageId);
      if (found) {
        setSelectedPackageId(found.id);
        setSelectedCategory(found.categoryId);
        if (found.provinces.length > 0) {
          setSelectedProvince(found.provinces[0]);
        }
        setStep(2);
      }
    } else {
      // Default to first package of category
      const firstInCat = PACKAGES.find((p) => p.categoryId === selectedCategory);
      if (firstInCat && !selectedPackageId) {
        setSelectedPackageId(firstInCat.id);
      }
    }
  }, [preselectedPackageId]);

  // Packages available in selected category
  const availablePackages = useMemo(() => {
    return PACKAGES.filter((p) => p.categoryId === selectedCategory);
  }, [selectedCategory]);

  const activePackage = useMemo(() => {
    return PACKAGES.find((p) => p.id === selectedPackageId) || availablePackages[0] || PACKAGES[0];
  }, [selectedPackageId, availablePackages]);

  // Price calculations
  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const item = ADDONS.find((a) => a.id === addonId);
      return sum + (item ? item.priceVnd : 0);
    }, 0);
  }, [selectedAddons]);

  const estimatedTotal = useMemo(() => {
    const base = activePackage ? activePackage.priceVnd : 0;
    return base + addonsTotal;
  }, [activePackage, addonsTotal]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Step 4 -> Step 5 Submit (Save to DB, then go to VietQR Deposit)
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !shootDate) {
      alert(t.fillRequiredAlert);
      return;
    }

    setLoading(true);

    const localizedPkgName = locale === 'zh' ? activePackage.nameZh : locale === 'en' ? activePackage.nameEn : activePackage.nameVi;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          phone,
          email,
          zaloOrWhatsapp: zaloOrWhatsapp || phone,
          categoryId: selectedCategory,
          packageId: activePackage.id,
          packageName: localizedPkgName,
          provinceId: selectedProvince,
          shootDate,
          shootTime,
          shootAddress: shootAddress || (locale === 'zh' ? '团队顾问推荐地点' : locale === 'en' ? 'As advised by team' : 'Theo tư vấn của ekip'),
          notes,
          addOns: selectedAddons,
          estimatedTotalVnd: estimatedTotal
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingResult(data.data);
        setStep(5); // Go to Deposit step (Step 5)
        window.scrollTo({ top: 180, behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to submit booking');
      }
    } catch (err: any) {
      alert(t.connectionErrorAlert);
    } finally {
      setLoading(false);
    }
  };

  // Step 5 -> Step 6 (Customer confirms payment or clicks next -> show Congrats Celebration)
  const handleProceedToSuccess = (confirmedPayment: boolean = false) => {
    setStep(6);
    window.scrollTo({ top: 180, behavior: 'smooth' });
    // Trigger celebratory confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const depositAmount = useMemo(() => {
    if (!bookingResult) return Math.round(estimatedTotal * (depositPercent / 100));
    return Math.round(bookingResult.estimatedTotalVnd * (depositPercent / 100));
  }, [bookingResult, estimatedTotal, depositPercent]);

  const transferMemo = useMemo(() => {
    if (!bookingResult) return 'NHIEP DIRECT';
    return `NHIEP ${bookingResult.bookingCode}`;
  }, [bookingResult]);

  const vietQrSrc = useMemo(() => {
    if (!bookingResult) return '';
    return generateVietQrUrl({
      amount: depositAmount,
      bookingCode: bookingResult.bookingCode,
      customerName: bookingResult.customerName,
      memo: transferMemo
    });
  }, [depositAmount, bookingResult, transferMemo]);

  const zaloNoticeUrl = useMemo(() => {
    if (!bookingResult) return `https://zalo.me/${PAYMENT_CONFIG.zalo}`;
    const code = bookingResult.bookingCode;
    const name = bookingResult.customerName;
    const phoneNum = bookingResult.phone;
    const pkg = bookingResult.packageName;
    const amountStr = depositAmount.toLocaleString('vi-VN');

    let msg = '';
    if (locale === 'zh') {
      msg = `您好 nhiep.net！我已完成 VietQR MB BANK 订金转账：\n- 订单号：${code}\n- 客户姓名：${name}\n- 电话：${phoneNum}\n- 套餐：${pkg}\n- 订金金额：${amountStr} ₫\n请专员核验并确认档期。`;
    } else if (locale === 'en') {
      msg = `Hello nhiep.net! I have completed the deposit payment via VietQR MB BANK:\n- Booking Code: ${code}\n- Customer: ${name}\n- Phone: ${phoneNum}\n- Package: ${pkg}\n- Deposit Amount: ${amountStr} VND\nPlease verify and confirm my schedule.`;
    } else {
      msg = `Chào nhiep.net! Tôi vừa hoàn tất chuyển khoản đặt cọc qua VietQR MB BANK cho mã đơn: ${code} (${name} - ${phoneNum}). Gói: ${pkg}. Số tiền cọc: ${amountStr} ₫. Nhờ chuyên viên xác nhận giúp tôi.`;
    }

    return `https://zalo.me/${PAYMENT_CONFIG.zalo}?text=${encodeURIComponent(msg)}`;
  }, [bookingResult, depositAmount, locale]);

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            {t.systemTag}
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white mt-1">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            {t.subtitle}
          </p>
        </div>

        {/* Step Indicator Bar (Steps 1 to 5) */}
        {step < 6 && (
          <div className="mb-10 p-4 glass-panel rounded-2xl border border-surface-border">
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { s: 1, label: t.step1 },
                { s: 2, label: t.step2 },
                { s: 3, label: t.step3 },
                { s: 4, label: t.step4 },
                { s: 5, label: t.step5 },
              ].map((item) => (
                <div
                  key={item.s}
                  onClick={() => item.s < step && item.s <= 4 && setStep(item.s)}
                  className={`flex flex-col items-center gap-1.5 py-1 transition-colors ${
                    item.s < step && item.s <= 4 ? 'cursor-pointer' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      step === item.s
                        ? 'bg-brand text-black shadow-glow'
                        : step > item.s
                        ? 'bg-emerald-500 text-black'
                        : 'bg-surface-elevated text-zinc-500 border border-surface-border'
                    }`}
                  >
                    {step > item.s ? <Check className="w-4 h-4 stroke-[3]" /> : item.s}
                  </div>
                  <span
                    className={`hidden sm:inline font-semibold text-[11px] truncate max-w-full ${
                      step === item.s ? 'text-brand' : step > item.s ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative">
          {/* STEP 1: CATEGORY & PROVINCE */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Category selector */}
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {t.selectCategory}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        const first = PACKAGES.find((p) => p.categoryId === cat.id);
                        if (first) setSelectedPackageId(first.id);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        selectedCategory === cat.id
                          ? 'bg-brand/10 border-brand shadow-glow text-white'
                          : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedCategory === cat.id ? 'bg-brand text-black font-bold' : 'bg-surface text-brand'
                      }`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {locale === 'zh' ? cat.nameZh : locale === 'en' ? cat.nameEn : cat.nameVi}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {locale === 'zh' ? cat.descriptionZh : locale === 'en' ? cat.descriptionEn : cat.descriptionVi}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Province selector */}
              <div className="pt-4 border-t border-surface-border">
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {t.selectProvince}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROVINCES.map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setSelectedProvince(prov.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        selectedProvince === prov.id
                          ? 'bg-brand text-black font-black border-brand shadow-glow'
                          : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs sm:text-sm font-bold">
                        {locale === 'zh' ? prov.nameZh : locale === 'en' ? prov.nameEn : prov.nameVi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                >
                  <span>{t.nextStep}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT PACKAGE & ADD-ONS */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {t.selectPackage}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePackages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    const name = locale === 'zh' ? pkg.nameZh : locale === 'en' ? pkg.nameEn : pkg.nameVi;
                    const deliverables = locale === 'zh' ? pkg.deliverablesZh : locale === 'en' ? pkg.deliverablesEn : pkg.deliverablesVi;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand/10 border-brand shadow-glow'
                            : 'bg-surface-muted hover:bg-surface-elevated border-surface-border'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                            <Image src={pkg.imageUrl} alt={name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white line-clamp-1">{name}</h4>
                            <p className="font-extrabold text-base text-brand mt-1">{pkg.priceVndFormatted}</p>
                            <p className="text-[11px] text-zinc-400 mt-1">{pkg.duration}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-surface-border/60 space-y-1">
                          {deliverables.slice(0, 2).map((del, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{del}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Addons */}
              <div className="pt-4 border-t border-surface-border">
                <h3 className="font-heading font-bold text-lg text-white mb-3">
                  {t.addOnsTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADDONS.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    const name = locale === 'zh' ? addon.nameZh : locale === 'en' ? addon.nameEn : addon.nameVi;

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-brand/10 border-brand text-white'
                            : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-brand border-brand text-black' : 'border-zinc-600'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-200">{name}</p>
                            <p className="text-[11px] text-brand font-semibold">+{addon.priceVnd.toLocaleString('vi-VN')} ₫</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Bar */}
              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block">{t.estimatedTotal}</span>
                  <span className="font-heading font-black text-2xl text-brand">
                    {estimatedTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                  >
                    {t.prevStep}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                  >
                    <span>{t.nextStep}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE & VENUE ADDRESS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                {t.step3}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {t.shootDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {t.shootTime}
                  </label>
                  <input
                    type="time"
                    value={shootTime}
                    onChange={(e) => setShootTime(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t.shootAddress}
                </label>
                <input
                  type="text"
                  value={shootAddress}
                  onChange={(e) => setShootAddress(e.target.value)}
                  placeholder={t.shootAddressPlaceholder}
                  className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-6 border-t border-surface-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                >
                  {t.prevStep}
                </button>
                <button
                  type="button"
                  disabled={!shootDate}
                  onClick={() => setStep(4)}
                  className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 disabled:opacity-40 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                >
                  <span>{t.nextStep}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT INFO & PROCEED TO DEPOSIT */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-surface-border pb-3">
                <h3 className="font-heading font-bold text-lg text-white">
                  {t.step4}
                </h3>
                {user ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.autoSynced}</span>
                  </span>
                ) : (
                  <span className="text-xs text-zinc-400">
                    {t.quickFillNotice}
                  </span>
                )}
              </div>

              {/* Fast Social Sign-In Banner if Not Logged In */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-elevated to-surface-card border border-brand/40 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                      <span>{t.oneTapLogin}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 hidden sm:inline">{t.noPasswordRequired}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => openAuthModal()}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>{t.continueGoogle}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuthModal()}
                      className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95"
                    >
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center p-0.5">
                        <FacebookIcon className="w-3 h-3" />
                      </div>
                      <span>{t.continueFacebook}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Auto-fill confirmation notification when logged in */
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-bold text-xs shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{t.autoFilledFrom} {user.provider === 'google' ? 'Google' : user.provider === 'facebook' ? 'Facebook' : ''}: <strong>{user.name}</strong></span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {user.email || user.facebookUrl || user.phone || t.readyToBook}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="text-[11px] text-brand hover:underline font-bold shrink-0 px-2 py-1 rounded-lg bg-surface-elevated border border-surface-border"
                  >
                    {t.switchAccount}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t.fullName} *</span>
                    {user?.name && fullName === user.name && (
                      <span className="text-[10px] text-emerald-400 font-normal">✓ {t.autoFilled}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t.phoneNumber} *</span>
                    {user?.phone && phone === user.phone && (
                      <span className="text-[10px] text-emerald-400 font-normal">✓ {t.autoFilled}</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phoneNumberPlaceholder}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t.emailAddress}</span>
                    {user?.email && email === user.email && (
                      <span className="text-[10px] text-emerald-400 font-normal">✓ {t.autoFilled}</span>
                    )}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailAddressPlaceholder}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t.zaloOrWhatsapp}</span>
                    {user && (user.facebookUrl || user.zalo) && (
                      <span className="text-[10px] text-emerald-400 font-normal">✓ {t.autoFilled}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={zaloOrWhatsapp}
                    onChange={(e) => setZaloOrWhatsapp(e.target.value)}
                    placeholder={t.zaloOrWhatsappPlaceholder}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t.specialNotes}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.specialNotesPlaceholder}
                  className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-brand/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>{t.selectedPackage} <strong>{locale === 'zh' ? activePackage?.nameZh : locale === 'en' ? activePackage?.nameEn : activePackage?.nameVi}</strong></span>
                  <span className="font-bold text-brand">{activePackage?.priceVndFormatted}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{t.addonsCount} ({selectedAddons.length}):</span>
                    <span>+{addonsTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="pt-2 border-t border-surface-border flex items-center justify-between font-bold text-sm text-white">
                  <span>{t.estimatedTotal}</span>
                  <span className="font-heading font-black text-xl text-brand">{estimatedTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-3 rounded-xl bg-surface-elevated border border-surface-border text-zinc-300 text-xs font-bold"
                >
                  {t.prevStep}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 disabled:opacity-50 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading ? t.savingBooking : t.proceedToDeposit}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: VIETQR MB BANK DEPOSIT SECTION */}
          {step === 5 && bookingResult && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-surface-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/20 text-brand border border-brand/40 flex items-center justify-center font-bold shadow-glow">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">
                      {t.depositHeader}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {t.depositSub}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>{t.bookingCodeLabel} <strong className="font-mono text-brand">{bookingResult.bookingCode}</strong></span>
                </div>
              </div>

              {/* Notice Banner */}
              <p className="text-xs text-zinc-300 bg-surface-muted p-3.5 rounded-2xl border border-surface-border/80 leading-relaxed">
                {t.depositNotice}
              </p>

              {/* Booking Summary Mini Card */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-surface-border space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                  <div>{t.customerLabel} <strong className="text-white">{bookingResult.customerName}</strong> ({bookingResult.phone})</div>
                  <div>{t.packageLabel} <strong className="text-brand">{bookingResult.packageName}</strong></div>
                  <div>{t.shootTimeLabel} <strong className="text-white">{bookingResult.shootDate} ({bookingResult.shootTime})</strong></div>
                  <div>{t.shootAddressLabel} <strong className="text-white">{bookingResult.shootAddress}</strong></div>
                </div>
                <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between font-bold">
                  <span className="text-zinc-400">{t.totalCostLabel}</span>
                  <span className="text-brand font-mono text-base">{bookingResult.estimatedTotalVnd.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              {/* Deposit Percentage Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                <span className="text-zinc-400 shrink-0 font-medium">{t.depositOptionLabel}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositPercent(40)}
                    className={`py-2.5 px-3 rounded-xl font-bold transition-all border text-center ${
                      depositPercent === 40
                        ? 'bg-brand text-black border-brand shadow-glow'
                        : 'bg-surface-elevated text-zinc-300 border-surface-border hover:bg-surface'
                    }`}
                  >
                    {t.deposit40Label} ({Math.round(bookingResult.estimatedTotalVnd * 0.4).toLocaleString('vi-VN')} ₫)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositPercent(60)}
                    className={`py-2.5 px-3 rounded-xl font-bold transition-all border text-center ${
                      depositPercent === 60
                        ? 'bg-brand text-black border-brand shadow-glow'
                        : 'bg-surface-elevated text-zinc-300 border-surface-border hover:bg-surface'
                    }`}
                  >
                    {t.deposit60Label} ({Math.round(bookingResult.estimatedTotalVnd * 0.6).toLocaleString('vi-VN')} ₫)
                  </button>
                </div>
              </div>

              {/* VietQR Bank Payment Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-surface-card border border-brand/50 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                {/* QR Image Box */}
                <div className="relative w-52 h-52 bg-white p-2 rounded-2xl shrink-0 shadow-xl overflow-hidden border-2 border-brand flex items-center justify-center">
                  <Image
                    src={vietQrSrc}
                    alt="VietQR MB BANK"
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>

                {/* Bank Details Table */}
                <div className="flex-1 text-xs space-y-2.5 w-full">
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-surface-border/60">
                    <span className="text-[10px] text-zinc-400 block">{t.bankNameLabel}</span>
                    <span className="font-bold text-white text-xs">{t.bankNameValue}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-surface-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">{t.accountNumberLabel}</span>
                      <span className="font-mono font-bold text-brand text-sm tracking-wider">
                        {PAYMENT_CONFIG.accountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(PAYMENT_CONFIG.accountNumber, 'acc')}
                      className="px-3 py-1.5 rounded-lg bg-surface hover:bg-brand hover:text-black text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'acc' ? t.copiedBtn : t.copyBtn}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-surface-border/60">
                    <span className="text-[10px] text-zinc-400 block">{t.accountHolderLabel}</span>
                    <span className="font-bold text-white text-xs uppercase">{PAYMENT_CONFIG.accountHolder}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">{t.depositAmountLabel} ({depositPercent}%)</span>
                      <span className="font-heading font-black text-brand text-base sm:text-lg">
                        {depositAmount.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(depositAmount.toString(), 'amount')}
                      className="px-3 py-1.5 rounded-lg bg-brand text-black text-xs font-extrabold hover:bg-brand-400 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      {copiedField === 'amount' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'amount' ? t.copiedBtn : t.copyBtn}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-surface-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">{t.transferMemoLabel}</span>
                      <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">{transferMemo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(transferMemo, 'memo')}
                      className="px-3 py-1.5 rounded-lg bg-surface hover:bg-brand hover:text-black text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'memo' ? t.copiedBtn : t.copyBtn}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: 1. Send Zalo Receipt, 2. Confirm I Have Paid, 3. Next to Success */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={zaloNoticeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.sendZaloBtn}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleProceedToSuccess(true)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-brand text-black font-extrabold text-xs sm:text-sm hover:bg-brand-400 transition-colors flex items-center justify-center gap-2 shadow-glow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.confirmPaidBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProceedToSuccess(false)}
                  className="py-3.5 px-6 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t.nextBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-xs text-zinc-400 hover:text-white underline transition-colors"
                >
                  {t.backToEdit}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: CONGRATULATORY CONFIRMATION SCREEN */}
          {step === 6 && bookingResult && (
            <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-glow animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-black text-2xl sm:text-4xl text-white">
                  {t.congratsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300">
                  {t.congratsSubtitle}
                </p>
                <div className="inline-block px-8 py-3 rounded-2xl bg-brand/20 border-2 border-brand text-brand font-mono font-black text-3xl sm:text-4xl tracking-wider shadow-glow">
                  {bookingResult.bookingCode}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed bg-surface-elevated p-4 rounded-2xl border border-surface-border">
                {t.congratsMessage}
              </p>

              {/* Full Reservation Summary Details */}
              <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-3xl bg-surface-card border border-surface-border text-left space-y-3 text-xs sm:text-sm shadow-xl">
                <h4 className="font-bold text-white border-b border-surface-border pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.orderSummaryTitle}</span>
                </h4>

                <div className="flex justify-between py-1 border-b border-surface-border/60">
                  <span className="text-zinc-400">{t.customerLabel}</span>
                  <span className="font-bold text-white">{bookingResult.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/60">
                  <span className="text-zinc-400">{t.phoneLabel}</span>
                  <span className="font-bold text-white font-mono">{bookingResult.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/60">
                  <span className="text-zinc-400">{t.emailLabel}</span>
                  <span className="font-bold text-zinc-200">{bookingResult.email || (locale === 'zh' ? '未提供' : locale === 'en' ? 'Not provided' : 'Chưa cung cấp')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/60">
                  <span className="text-zinc-400">{t.packageLabel}</span>
                  <span className="font-bold text-brand">{bookingResult.packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/60">
                  <span className="text-zinc-400">{t.shootTimeLabel}</span>
                  <span className="font-bold text-white">{bookingResult.shootDate} ({bookingResult.shootTime})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/60">
                  <span className="text-zinc-400">{t.shootAddressLabel}</span>
                  <span className="font-bold text-white max-w-[280px] truncate text-right">{bookingResult.shootAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/60">
                  <span className="text-zinc-400">{t.depositPaidLabel}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {depositPercent}% ({depositAmount.toLocaleString('vi-VN')} ₫)
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span className="text-zinc-400">{t.totalCostLabel}</span>
                  <span className="text-brand text-base sm:text-lg font-heading">{bookingResult.estimatedTotalVnd.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{t.statusValue}</span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/${locale}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-elevated border border-surface-border hover:bg-surface text-white text-xs font-bold transition-colors"
                >
                  {t.backHomeBtn}
                </Link>

                <a
                  href={`tel:${PAYMENT_CONFIG.hotline}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.callHotlineBtn}</span>
                </a>

                <a
                  href={zaloNoticeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.chatZaloBtn}</span>
                </a>

                <Link
                  href={`/${locale}/admin`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand text-black text-xs font-extrabold shadow-glow hover:bg-brand-400 transition-colors"
                >
                  {t.adminBtn}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = (params.locale || 'vi') as Locale;
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-400">Loading booking form...</div>}>
      <BookingForm locale={locale} />
    </Suspense>
  );
}
