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
  QrCode, ExternalLink, Copy, MessageSquare, Sliders, Plus, Minus, Video, Camera, ShoppingBag, Building2, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { PAYMENT_CONFIG, generateVietQrUrl, calculateDepositAmount } from '@/lib/payment';
import { GoogleIcon, FacebookIcon } from '@/components/SocialIcons';

const ADDONS = [
  { id: 'addonExpress', nameVi: 'Hậu kỳ hỏa tốc nhận file trong 24h', nameEn: '24-Hour Express Rapid Delivery', nameZh: '24小时极速出片通道', priceVnd: 1200000 },
  { id: 'addonExtraPhotographer', nameVi: 'Thêm 01 Nhiếp ảnh gia phụ', nameEn: '1 Additional Lead Photographer', nameZh: '增加1位资深副摄影师', priceVnd: 1800000 },
  { id: 'addonMUA', nameVi: 'Chuyên viên Trang điểm & Làm tóc', nameEn: 'On-Location Makeup Artist & Hair Styling', nameZh: '专属造型师跟妆与发型设计', priceVnd: 1000000 },
  { id: 'addonPhotobook', nameVi: 'In thêm 01 Album Photobook cao cấp 30x30cm', nameEn: '1 Additional Luxury Photobook 30x30cm', nameZh: '加印1本30x30cm高档水晶相册', priceVnd: 1500000 },
];

const I18N_BOOKING = {
  vi: {
    systemTag: 'HỆ THỐNG ĐẶT LỊCH TRỰC TUYẾN',
    title: 'Đặt Lịch Trực Tuyến Nhanh Chóng',
    subtitle: 'Chỉ mất 2 phút để lựa chọn cấu hình hoặc gói dịch vụ ưng ý và giữ lịch với ekip xuất sắc nhất',
    step1: '1. Dịch vụ & Địa điểm',
    step2: '2. Gói & Tùy chọn',
    step3: '3. Thời gian & Địa chỉ',
    step4: '4. Thông tin liên hệ',
    step5: '5. Đặt cọc VietQR',
    step6: '6. Hoàn tất đặt lịch',
    // Booking Methods
    bookingMethodTitle: 'Chọn Phương Thức Đặt Lịch',
    methodCustomTitle: 'Tự Tùy Chỉnh Thiết Bị & Nhân Sự Theo Ngân Sách',
    methodCustomSubtitle: 'Chủ động chọn số lượng thợ quay gimbal, máy chụp & flycam cho dự án của bạn',
    methodCategoryTitle: 'Chọn Gói Dịch Vụ Theo Danh Mục',
    methodCategorySubtitle: 'Lựa chọn các gói quay phim, chụp ảnh, sự kiện được thiết kế tối ưu sẵn',
    // Customizer elements
    gimbalLabel: '🎥 Thợ quay Gimbal',
    photoLabel: '📷 Thợ chụp ảnh',
    photoPrice: '2.500.000 ₫ / thợ',
    droneLabel: '🚁 Flycam DJI',
    qualityLabel: '🎬 Chất lượng:',
    stdEditLabel: '🎞️ Dựng phim tiêu chuẩn',
    advEditLabel: '🎬 Dựng phim nâng cao',
    voiceLabel: '🎙️ Voice talent',
    photoRetouchLabel: '🖼️ Hậu kỳ ảnh',
    optNone: 'Không chọn',
    optStandard: 'Tiêu chuẩn',
    optPremium: 'Cao cấp',
    expressLabel: 'Hậu kỳ hỏa tốc 24h (+1.2tr)',
    makeupLabel: 'Makeup MUA (+1.0tr)',
    photobookLabel: 'Photobook 30x30 (+1.5tr)',
    customTotalLabel: 'TỔNG CHI PHÍ DỰ TOÁN THEO CẤU HÌNH:',
    deposit40Prefix: 'Cọc giữ lịch 40%:',
    customPackageName: 'Gói Cấu Hình Tùy Chỉnh Ekip & Thiết Bị',
    customSummaryStep2: 'Cấu hình thiết bị & nhân sự bạn đã thiết lập ở bước 1:',
    // General Step 1
    selectCategory: 'Chọn Danh Mục Dịch Vụ',
    selectProvince: 'Chọn Tỉnh / Thành Phố',
    selectPackage: 'Chọn Gói Dịch Vụ',
    selectedPackageHeader: 'Gói Dịch Vụ Đã Chọn',
    changePackage: 'Đổi gói khác',
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
    dynamicQrTab: 'MÃ QR MBBANK, KHÔNG VAT',
    bizQrTab: 'MÃ QR BIZ MBBANK, CÓ VAT 10%',
    vatIncludedBadge: '(Đã bao gồm 10% VAT)',
    vatBasePrice: 'Giá gốc:',
    depositOptionLabel: 'Mức đặt cọc:',
    deposit40Label: 'Đặt Cọc 40%',
    deposit60Label: 'Đặt Cọc 60%',
    bookingCodeLabel: 'Mã đơn giữ lịch:',
    customerLabel: 'Khách hàng:',
    phoneLabel: 'Số điện thoại:',
    packageLabel: 'Gói dịch vụ & Cấu hình:',
    shootTimeLabel: 'Thời gian chụp:',
    shootAddressLabel: 'Địa điểm:',
    totalCostLabel: 'Tổng chi phí hợp đồng:',
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
    subtitle: 'It takes only 2 minutes to customize your gear & crew or select a package and secure your preferred dates',
    step1: '1. Service & Location',
    step2: '2. Package & Add-ons',
    step3: '3. Schedule & Address',
    step4: '4. Contact Details',
    step5: '5. VietQR Deposit',
    step6: '6. Confirmation',
    // Booking Methods
    bookingMethodTitle: 'Select Booking Method',
    methodCustomTitle: 'Custom Crew & Gear by Budget',
    methodCustomSubtitle: 'Customize number of gimbal operators, photographers & aerial drones for your project',
    methodCategoryTitle: 'Choose Standard Package by Category',
    methodCategorySubtitle: 'Browse predefined packages for photography, videography, and events',
    // Customizer elements
    gimbalLabel: '🎥 Gimbal Operator',
    photoLabel: '📷 Lead Photographer',
    photoPrice: '2,500,000 VND / crew',
    droneLabel: '🚁 DJI Flycam / Drone',
    qualityLabel: '🎬 Quality:',
    stdEditLabel: '🎞️ Standard Video Editing',
    advEditLabel: '🎬 Advanced Video Editing',
    voiceLabel: '🎙️ Voice Talent',
    photoRetouchLabel: '🖼️ Photo Post-Production',
    optNone: 'None',
    optStandard: 'Standard',
    optPremium: 'Premium',
    expressLabel: '24-Hour Express (+1.2M)',
    makeupLabel: 'Makeup & Hair (+1.0M)',
    photobookLabel: 'Photobook 30x30 (+1.5M)',
    customTotalLabel: 'ESTIMATED TOTAL BUDGET:',
    deposit40Prefix: '40% Schedule Deposit:',
    customPackageName: 'Custom Crew & Gear Package',
    customSummaryStep2: 'Custom equipment & crew setup configured in Step 1:',
    // General Step 1
    selectCategory: 'Select Service Category',
    selectProvince: 'Select Province / City',
    selectPackage: 'Select Service Package',
    selectedPackageHeader: 'Selected Service Package',
    changePackage: 'Change package',
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
    dynamicQrTab: 'MBBANK QR, NO VAT',
    bizQrTab: 'BIZ MBBANK QR, INC. 10% VAT',
    vatIncludedBadge: '(Inc. 10% VAT)',
    vatBasePrice: 'Base Price:',
    depositOptionLabel: 'Deposit Amount:',
    deposit40Label: '40% Deposit',
    deposit60Label: '60% Deposit',
    bookingCodeLabel: 'Reservation Code:',
    customerLabel: 'Customer:',
    phoneLabel: 'Phone / WhatsApp:',
    packageLabel: 'Service Package & Config:',
    shootTimeLabel: 'Shoot Schedule:',
    shootAddressLabel: 'Location / Venue:',
    totalCostLabel: 'Total Contract Value:',
    bankNameLabel: 'Beneficiary Bank:',
    bankNameValue: 'MB BANK (Military Commercial Joint Stock Bank)',
    accountNumberLabel: 'Account Number:',
    accountHolderLabel: 'Account Holder:',
    depositAmountLabel: 'Deposit Amount:',
    transferMemoLabel: 'Transfer Memo / Remark:',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    sendZaloBtn: 'Send Receipt via WhatsApp (+84943391369)',
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
    chatZaloBtn: 'Chat via WhatsApp (+84 943 391 369)',
    adminBtn: 'View in Admin Portal',
    fillRequiredAlert: 'Please fill in Full Name, Phone Number, and Shoot Date!',
    connectionErrorAlert: 'Unable to connect to server. Please contact Hotline +84 943 391 369.',
    copiedSuccessAlert: 'Copied to clipboard: '
  },
  zh: {
    systemTag: '在线智能预约系统',
    title: '快速在线预约档期',
    subtitle: '仅需2分钟即可自主定制设备与人员方案或选定标准套餐，锁定优秀团队档期',
    step1: '1. 服务与城市',
    step2: '2. 套餐与增值',
    step3: '3. 时间与地址',
    step4: '4. 联系人信息',
    step5: '5. VietQR订金支付',
    step6: '6. 预约确认成功',
    // Booking Methods
    bookingMethodTitle: '选择预约方式',
    methodCustomTitle: '自主定制设备与人员方案（按预算自由搭配）',
    methodCustomSubtitle: '根据您的项目预算，自由选择电影机云台手、主摄影师与航拍无人机',
    methodCategoryTitle: '按分类选择官方标准套餐',
    methodCategorySubtitle: '浏览专为摄影、影视TVC及商务活动预先设计的标准套餐',
    // Customizer elements
    gimbalLabel: '🎥 稳定器摄影师',
    photoLabel: '📷 专业主摄影师',
    photoPrice: '2,500,000 ₫ / 位',
    droneLabel: '🚁 大疆无人机航拍',
    qualityLabel: '🎬 成片画质：',
    stdEditLabel: '🎞️ 标准视频剪辑',
    advEditLabel: '🎬 高级电影感剪辑',
    voiceLabel: '🎙️ 专业配音旁白',
    photoRetouchLabel: '🖼️ 精修后期处理',
    optNone: '不选择',
    optStandard: '标准版',
    optPremium: '高级版',
    expressLabel: '24小时极速出片 (+120万)',
    makeupLabel: '专属跟妆造型 (+100万)',
    photobookLabel: '30x30水晶相册 (+150万)',
    customTotalLabel: '定制方案预估总费用：',
    deposit40Prefix: '40%档期锁定订金：',
    customPackageName: '自主定制设备与人员专属套餐',
    customSummaryStep2: '您在第一步中配置的设备与人员方案：',
    // General Step 1
    selectCategory: '选择服务类别',
    selectProvince: '选择服务省份/城市',
    selectPackage: '选择精选套餐',
    selectedPackageHeader: '已选服务套餐',
    changePackage: '更换其他套餐',
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
    dynamicQrTab: 'MBBANK 二维码（无增值税）',
    bizQrTab: '企业 BIZ MBBANK 码（含10%增值税）',
    vatIncludedBadge: '(含10%增值税)',
    vatBasePrice: '原始总价：',
    depositOptionLabel: '订金比例：',
    deposit40Label: '支付 40% 订金',
    deposit60Label: '支付 60% 订金',
    bookingCodeLabel: '预约订单编号：',
    customerLabel: '客户姓名：',
    phoneLabel: '联系电话：',
    packageLabel: '服务套餐与定制方案：',
    shootTimeLabel: '拍摄时间：',
    shootAddressLabel: '拍摄地点：',
    totalCostLabel: '合同总金额：',
    bankNameLabel: '收款银行：',
    bankNameValue: 'MB BANK（越南军队商业股份银行）',
    accountNumberLabel: '银行账号：',
    accountHolderLabel: '收款户名：',
    depositAmountLabel: '订金金额：',
    transferMemoLabel: '转账附言/备注：',
    copyBtn: '复制',
    copiedBtn: '已复制',
    sendZaloBtn: '通过 WhatsApp 发送付款凭证 (+84943391369)',
    confirmPaidBtn: '我已完成转账支付',
    nextBtn: '下一步',
    backToEdit: '返回修改预约信息',
    // Step 6 Success
    congratsTitle: '🎉 恭喜您！预约提交成功！',
    congratsSubtitle: '您的专属预约订单号为：',
    congratsMessage: '您的预约需求与订金凭据已成功录入 nhiep.net 系统。专属客服专员将在15分钟内通过电话或 WhatsApp 与您对接确认拍摄脚本并准备优秀团队。',
    orderSummaryTitle: '档期锁定凭证详情',
    emailLabel: '文件接收邮箱：',
    depositPaidLabel: '已选订金：',
    statusLabel: '订单状态：',
    statusValue: '已提交预约（24/7核验处理中）',
    backHomeBtn: '返回网站首页',
    callHotlineBtn: '拨打客服热线 (+84 943 391 369)',
    chatZaloBtn: '通过 WhatsApp 联系客服 (+84 943 391 369)',
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
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [depositPercent, setDepositPercent] = useState<number>(40);
  const [step5QrType, setStep5QrType] = useState<'dynamic' | 'biz'>('dynamic');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Booking Mode: 'custom' (Tự tùy chỉnh thiết bị & nhân sự) or 'category' (Chọn gói theo danh mục)
  const [bookingMode, setBookingMode] = useState<'custom' | 'category'>('custom');

  // Customizer States
  const [gimbalOperators, setGimbalOperators] = useState<number>(1);
  const [photographers, setPhotographers] = useState<number>(1);
  const [drones, setDrones] = useState<number>(0);
  const [editingQuality, setEditingQuality] = useState<'fullhd' | '4k' | '6k'>('fullhd');
  const [standardVideoEditing, setStandardVideoEditing] = useState<number>(0);
  const [advancedVideoEditing, setAdvancedVideoEditing] = useState<number>(0);
  const [voiceTalent, setVoiceTalent] = useState<'none' | 'standard' | 'premium'>('none');
  const [photoRetouch, setPhotoRetouch] = useState<'none' | 'standard' | 'premium'>('none');
  const [express24h, setExpress24h] = useState<boolean>(false);
  const [makeupMUA, setMakeupMUA] = useState<boolean>(false);
  const [luxuryPhotobook, setLuxuryPhotobook] = useState<boolean>(false);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('photography');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceId>('danang');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [showAllPackages, setShowAllPackages] = useState<boolean>(false);
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
        setBookingMode('category');
        setSelectedPackageId(found.id);
        setSelectedCategory(found.categoryId);
        if (found.provinces.length > 0) {
          setSelectedProvince(found.provinces[0]);
        }
        setStep(2);
      }
    }
  }, [preselectedPackageId]);

  // Packages available in selected category
  const availablePackages = useMemo(() => {
    return PACKAGES.filter((p) => p.categoryId === selectedCategory);
  }, [selectedCategory]);

  const activePackage = useMemo(() => {
    if (!selectedPackageId) return null;
    return PACKAGES.find((p) => p.id === selectedPackageId) || null;
  }, [selectedPackageId]);

  // Dynamic pricing calculations for customizer
  // Gimbal: Full HD = 3.2M; 4K = +1.0M (4.2M); 6K RAW = +2.5M (5.7M)
  const priceGimbalPerCrew =
    editingQuality === '6k' ? 5700000 : editingQuality === '4k' ? 4200000 : 3200000;

  // Drone: Full HD = 2.2M; 4K = +1.0M (3.2M); 6K RAW = +2.5M (4.7M)
  const priceDronePerUnit =
    editingQuality === '6k' ? 4700000 : editingQuality === '4k' ? 3200000 : 2200000;

  // Photographer: Flat 2.5M
  const pricePhotoPerCrew = 2500000;

  // Standard Video Edit: Full HD = 1.2M; 4K = 1.5M; 6K RAW = 4.5M per video
  const priceStdEditPerVideo =
    editingQuality === '6k' ? 4500000 : editingQuality === '4k' ? 1500000 : 1200000;

  // Advanced Video Edit: Full HD = 2.8M; 4K = 3.5M; 6K RAW = 6.5M per video
  const priceAdvEditPerVideo =
    editingQuality === '6k' ? 6500000 : editingQuality === '4k' ? 3500000 : 2800000;

  // Voice talent: none = 0; standard = 800k; premium = 2.5M
  const priceVoiceTalent =
    voiceTalent === 'premium' ? 2500000 : voiceTalent === 'standard' ? 800000 : 0;

  // Photo retouch: none = 0; standard = 400k; premium = 1.5M
  const pricePhotoRetouch =
    photoRetouch === 'premium' ? 1500000 : photoRetouch === 'standard' ? 400000 : 0;

  const PRICE_EXPRESS = 1200000;
  const PRICE_MUA = 1000000;
  const PRICE_PHOTOBOOK = 1500000;

  const customTotal = useMemo(() => {
    return (
      gimbalOperators * priceGimbalPerCrew +
      photographers * pricePhotoPerCrew +
      drones * priceDronePerUnit +
      standardVideoEditing * priceStdEditPerVideo +
      advancedVideoEditing * priceAdvEditPerVideo +
      priceVoiceTalent +
      pricePhotoRetouch +
      (express24h ? PRICE_EXPRESS : 0) +
      (makeupMUA ? PRICE_MUA : 0) +
      (luxuryPhotobook ? PRICE_PHOTOBOOK : 0)
    );
  }, [
    gimbalOperators, priceGimbalPerCrew,
    photographers, pricePhotoPerCrew,
    drones, priceDronePerUnit,
    standardVideoEditing, priceStdEditPerVideo,
    advancedVideoEditing, priceAdvEditPerVideo,
    priceVoiceTalent, pricePhotoRetouch,
    express24h, makeupMUA, luxuryPhotobook
  ]);

  const customDeposit40 = useMemo(() => {
    return Math.round((customTotal * 0.4) / 10000) * 10000;
  }, [customTotal]);

  // Standard packages addons total
  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const item = ADDONS.find((a) => a.id === addonId);
      return sum + (item ? item.priceVnd : 0);
    }, 0);
  }, [selectedAddons]);

  // Final Estimated Total depending on booking mode
  const estimatedTotal = useMemo(() => {
    if (bookingMode === 'custom') {
      return customTotal + addonsTotal;
    }
    const base = activePackage ? activePackage.priceVnd : 0;
    return base + addonsTotal;
  }, [bookingMode, customTotal, activePackage, addonsTotal]);

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

  // Full unabbreviated package name including configuration and add-ons
  const fullPackageSummary = useMemo(() => {
    let baseName = '';
    if (bookingMode === 'custom') {
      const extraDetails: string[] = [];
      if (standardVideoEditing > 0) extraDetails.push(`${standardVideoEditing} Dựng tiêu chuẩn`);
      if (advancedVideoEditing > 0) extraDetails.push(`${advancedVideoEditing} Dựng nâng cao`);
      if (voiceTalent !== 'none') extraDetails.push(`Voice: ${voiceTalent}`);
      if (photoRetouch !== 'none') extraDetails.push(`Hậu kỳ ảnh: ${photoRetouch}`);

      if (locale === 'zh') {
        baseName = `自主定制方案：${gimbalOperators}位稳定器摄影师 + ${photographers}位专业摄影师 + ${drones}台航拍机（${editingQuality.toUpperCase()}剪辑标准${extraDetails.length > 0 ? ` • ${extraDetails.join(', ')}` : ''}）`;
      } else if (locale === 'en') {
        baseName = `Custom Setup: ${gimbalOperators} Gimbal Operators + ${photographers} Photographers + ${drones} DJI Drones (${editingQuality.toUpperCase()} Editing${extraDetails.length > 0 ? ` • ${extraDetails.join(', ')}` : ''})`;
      } else {
        baseName = `Cấu hình tự chọn: ${gimbalOperators} Thợ quay Gimbal + ${photographers} Thợ chụp ảnh + ${drones} Flycam DJI (Dựng ${editingQuality.toUpperCase()}${extraDetails.length > 0 ? ` • ${extraDetails.join(', ')}` : ''})`;
      }
    } else {
      baseName = activePackage
        ? (locale === 'zh' ? activePackage.nameZh : locale === 'en' ? activePackage.nameEn : activePackage.nameVi)
        : (locale === 'zh' ? '精选套餐' : locale === 'en' ? 'Selected Package' : 'Gói Dịch Vụ');
    }

    const addonNames = selectedAddons
      .map((id) => {
        const item = ADDONS.find((a) => a.id === id);
        if (!item) return null;
        return locale === 'zh' ? item.nameZh : locale === 'en' ? item.nameEn : item.nameVi;
      })
      .filter(Boolean);

    if (addonNames.length > 0) {
      const addonPrefix = locale === 'zh' ? '【增值选项】' : locale === 'en' ? '【Add-ons】' : '【Bổ sung】';
      return `${baseName} • ${addonPrefix}: ${addonNames.join(', ')}`;
    }

    return baseName;
  }, [bookingMode, gimbalOperators, photographers, drones, editingQuality, standardVideoEditing, advancedVideoEditing, voiceTalent, photoRetouch, selectedAddons, activePackage, locale]);

  // Step 4 -> Step 5 Submit (Save to DB, then go to VietQR Deposit)
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !shootDate) {
      alert(t.fillRequiredAlert);
      return;
    }

    if (locale === 'vi') {
      if (!/^0\d{9}$/.test(phone)) {
        alert('Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số bắt đầu bằng số 0 (Ví dụ: 0943391369).');
        return;
      }
    } else {
      if (!phone || phone.replace(/\D/g, '').length < 5) {
        alert(locale === 'zh' ? '请输入有效的联系电话（仅限数字）。' : 'Please enter a valid phone number (digits only).');
        return;
      }
    }

    setLoading(true);

    let pkgId = '';
    let catId: CategoryId = selectedCategory;

    if (bookingMode === 'custom') {
      pkgId = 'custom-builder-package';
      catId = gimbalOperators > 0 ? 'videography' : 'photography';
    } else {
      pkgId = activePackage ? activePackage.id : (availablePackages[0]?.id || 'pkg-default');
    }

    const customNotesDetails = bookingMode === 'custom'
      ? `[CẤU HÌNH TỰ CHỌN]: ${gimbalOperators} Gimbal, ${photographers} Chụp ảnh, ${drones} Flycam, Dựng ${editingQuality.toUpperCase()}${standardVideoEditing > 0 ? `, ${standardVideoEditing} Dựng tiêu chuẩn` : ''}${advancedVideoEditing > 0 ? `, ${advancedVideoEditing} Dựng nâng cao` : ''}${voiceTalent !== 'none' ? `, Voice: ${voiceTalent}` : ''}${photoRetouch !== 'none' ? `, Hậu kỳ ảnh: ${photoRetouch}` : ''}${express24h ? ', Hậu kỳ 24h' : ''}${makeupMUA ? ', Makeup MUA' : ''}${luxuryPhotobook ? ', Photobook 30x30' : ''}. ${notes}`
      : notes;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          phone,
          email,
          zaloOrWhatsapp: zaloOrWhatsapp || phone,
          categoryId: catId,
          packageId: pkgId,
          packageName: fullPackageSummary,
          provinceId: selectedProvince,
          shootDate,
          shootTime,
          shootAddress: shootAddress || (locale === 'zh' ? '团队顾问推荐地点' : locale === 'en' ? 'As advised by team' : 'Theo tư vấn của ekip'),
          notes: customNotesDetails,
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
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const isStep5Vat10 = step5QrType === 'biz';
  const baseContractAmount = bookingResult?.estimatedTotalVnd || estimatedTotal;
  const effectiveContractAmount = isStep5Vat10 ? Math.round(baseContractAmount * 1.1) : baseContractAmount;

  const depositAmount = useMemo(() => {
    return calculateDepositAmount(effectiveContractAmount, depositPercent);
  }, [effectiveContractAmount, depositPercent]);

  const transferMemo = useMemo(() => {
    const code = bookingResult ? bookingResult.bookingCode : 'DIRECT';
    return isStep5Vat10 ? `COC VAT ${code}` : `COC ${code}`;
  }, [bookingResult, isStep5Vat10]);

  const vietQrSrc = useMemo(() => {
    if (step5QrType === 'biz') {
      return PAYMENT_CONFIG.qrImageBizVat || '/qr_newholdings_bizmbbank.jpg';
    }
    return PAYMENT_CONFIG.qrImageStatic || '/qrmb.jpg';
  }, [step5QrType]);

  const currentStep5AccountNumber = isStep5Vat10
    ? (PAYMENT_CONFIG.bizAccountNumber || '943913689')
    : PAYMENT_CONFIG.accountNumber;
  const currentStep5AccountHolder = isStep5Vat10
    ? (PAYMENT_CONFIG.bizAccountHolder || 'CONG TY TNHH TAP ĐOAN NEW HOLDINGS')
    : PAYMENT_CONFIG.accountHolder;

  const zaloNoticeUrl = useMemo(() => {
    if (!bookingResult) return `https://zalo.me/${PAYMENT_CONFIG.zalo}`;
    const code = bookingResult.bookingCode;
    const name = bookingResult.customerName;
    const phoneNum = bookingResult.phone;
    const pkg = bookingResult.packageName || fullPackageSummary;
    const amountStr = depositAmount.toLocaleString('vi-VN');
    const totalStr = effectiveContractAmount.toLocaleString('vi-VN');

    let msg = '';
    let chatUrl = '';
    if (locale === 'zh') {
      msg = `您好 nhiep.net！我已通过 ${isStep5Vat10 ? '企业 BIZ MBBANK 码（含10%增值税）' : 'MBBANK 二维码（无增值税）'} 完成订金转账：\n- 订单号：${code}\n- 客户姓名：${name}\n- 电话：${phoneNum}\n- 套餐与配置：${pkg}\n- 合同总额：${totalStr} ₫${isStep5Vat10 ? '（含10%增值税）' : ''}\n- 订金金额 (${depositPercent}%)：${amountStr} ₫\n- 收款账户：MB BANK ${currentStep5AccountNumber} (${currentStep5AccountHolder})\n请专员核验并${isStep5Vat10 ? '开具增值税发票及' : ''}确认档期。`;
      chatUrl = `https://wa.me/84943391369?text=${encodeURIComponent(msg)}`;
    } else if (locale === 'en') {
      msg = `Hello nhiep.net! I have completed the deposit payment via ${isStep5Vat10 ? 'BIZ MBBANK QR (INC. 10% VAT)' : 'MBBANK QR (NO VAT)'}:\n- Booking Code: ${code}\n- Customer: ${name}\n- Phone: ${phoneNum}\n- Package & Setup: ${pkg}\n- Total Value: ${totalStr} VND${isStep5Vat10 ? ' (Inc. 10% VAT)' : ''}\n- Deposit Amount (${depositPercent}%): ${amountStr} VND\n- Beneficiary: MB BANK ${currentStep5AccountNumber} (${currentStep5AccountHolder})\nPlease verify and ${isStep5Vat10 ? 'issue VAT invoice & ' : ''}confirm my schedule.`;
      chatUrl = `https://wa.me/84943391369?text=${encodeURIComponent(msg)}`;
    } else {
      msg = `Chào nhiep.net! Tôi vừa hoàn tất chuyển khoản đặt cọc qua ${isStep5Vat10 ? 'MÃ QR BIZ MBBANK (CÓ VAT 10%)' : 'MÃ QR MBBANK (KHÔNG VAT)'} cho mã đơn: ${code} (${name} - ${phoneNum}).\n- Gói & Cấu hình: ${pkg}\n- Tổng giá trị hợp đồng: ${totalStr} ₫${isStep5Vat10 ? ' (Đã bao gồm 10% VAT)' : ''}\n- Số tiền cọc (${depositPercent}%): ${amountStr} ₫\n- Ngân hàng thụ hưởng: MB BANK ${currentStep5AccountNumber} (${currentStep5AccountHolder})\nNhờ chuyên viên kiểm tra và ${isStep5Vat10 ? 'xuất hóa đơn VAT / ' : ''}xác nhận giúp tôi!`;
      chatUrl = `https://zalo.me/${PAYMENT_CONFIG.zalo}?text=${encodeURIComponent(msg)}`;
    }

    return chatUrl;
  }, [bookingResult, depositAmount, effectiveContractAmount, isStep5Vat10, depositPercent, fullPackageSummary, locale, currentStep5AccountNumber, currentStep5AccountHolder]);

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
          <div className="mb-8 p-4 glass-panel rounded-2xl border border-surface-border">
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
          
          {/* ========================================================================= */}
          {/* STEP 1: SELECT BOOKING METHOD (CUSTOM BUILDER OR CATEGORY) & PROVINCE */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Method Switcher Header: 2 Options */}
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-3 flex items-center gap-2">
                  <span>{t.bookingMethodTitle}</span>
                  <span className="text-xs text-brand font-normal">(1 trong 2 phương thức)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Tự Tùy Chỉnh Thiết Bị & Nhân Sự */}
                  <button
                    type="button"
                    onClick={() => setBookingMode('custom')}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-3.5 ${
                      bookingMode === 'custom'
                        ? 'bg-brand/10 border-brand shadow-glow text-white ring-1 ring-brand'
                        : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      bookingMode === 'custom' ? 'bg-brand text-black shadow-glow' : 'bg-surface-elevated text-brand'
                    }`}>
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">
                          {t.methodCustomTitle}
                        </h4>
                        {bookingMode === 'custom' && (
                          <span className="px-2 py-0.5 rounded-full bg-brand text-black text-[9px] font-black uppercase">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {t.methodCustomSubtitle}
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Chọn Gói Dịch Vụ Theo Danh Mục */}
                  <button
                    type="button"
                    onClick={() => setBookingMode('category')}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-3.5 ${
                      bookingMode === 'category'
                        ? 'bg-brand/10 border-brand shadow-glow text-white ring-1 ring-brand'
                        : 'bg-surface-muted hover:bg-surface-elevated border-surface-border text-zinc-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      bookingMode === 'category' ? 'bg-brand text-black shadow-glow' : 'bg-surface-elevated text-brand'
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">
                          {t.methodCategoryTitle}
                        </h4>
                        {bookingMode === 'category' && (
                          <span className="px-2 py-0.5 rounded-full bg-brand text-black text-[9px] font-black uppercase">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {t.methodCategorySubtitle}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* METHOD 1 CONTENT: CUSTOM CREW & GEAR BUILDER */}
              {bookingMode === 'custom' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-brand/40 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-surface-border pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-brand" />
                      <h4 className="font-heading font-black text-sm text-white">
                        {t.methodCustomTitle}
                      </h4>
                    </div>
                    <span className="text-[11px] text-zinc-400 hidden sm:inline">
                      {t.methodCustomSubtitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* 1. Thợ quay Gimbal */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{t.gimbalLabel}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-brand font-bold font-mono">
                            {priceGimbalPerCrew.toLocaleString('vi-VN')} ₫ / thợ
                          </span>
                          <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                            {editingQuality.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">
                          {locale === 'zh' ? 'Full HD: 320万 • 4K: 420万 • 6K: 570万' : locale === 'en' ? 'Full HD: 3.2M • 4K: 4.2M • 6K: 5.7M' : 'Full HD: 3.2tr • 4K: 4.2tr • 6K: 5.7tr'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGimbalOperators(Math.max(0, gimbalOperators - 1))}
                          className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm text-brand w-4 text-center">
                          {gimbalOperators}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGimbalOperators(Math.min(5, gimbalOperators + 1))}
                          className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 2. Thợ chụp ảnh */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{t.photoLabel}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-brand font-bold font-mono">{t.photoPrice}</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">
                          {locale === 'zh' ? '固定价格，不受画质影响' : locale === 'en' ? 'Flat rate for all resolutions' : 'Giá cố định mọi độ phân giải'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPhotographers(Math.max(0, photographers - 1))}
                          className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm text-brand w-4 text-center">
                          {photographers}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPhotographers(Math.min(5, photographers + 1))}
                          className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 3. Flycam DJI */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{t.droneLabel}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-brand font-bold font-mono">
                            {priceDronePerUnit.toLocaleString('vi-VN')} ₫ / máy
                          </span>
                          <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                            {editingQuality.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">
                          {locale === 'zh' ? 'Full HD: 220万 • 4K: 320万 • 6K: 470万' : locale === 'en' ? 'Full HD: 2.2M • 4K: 3.2M • 6K: 4.7M' : 'Full HD: 2.2tr • 4K: 3.2tr • 6K: 4.7tr'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDrones(Math.max(0, drones - 1))}
                          className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm text-brand w-4 text-center">
                          {drones}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDrones(Math.min(3, drones + 1))}
                          className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 4. Voice talent */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{t.voiceLabel}</span>
                        <span className="text-[10px] text-brand font-mono font-semibold">
                          {priceVoiceTalent > 0 ? `+${priceVoiceTalent.toLocaleString('vi-VN')} ₫` : '0 ₫'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'none', label: t.optNone },
                          { id: 'standard', label: `${t.optStandard} (800k)` },
                          { id: 'premium', label: `${t.optPremium} (2.5tr)` }
                        ].map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVoiceTalent(v.id as any)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              voiceTalent === v.id
                                ? 'bg-brand text-black border-brand shadow-glow font-extrabold'
                                : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Post-production & Quality Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    {/* 5. Dựng phim tiêu chuẩn */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{t.stdEditLabel}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-brand font-bold font-mono">
                            {priceStdEditPerVideo.toLocaleString('vi-VN')} ₫ / video
                          </span>
                          <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                            {editingQuality.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">
                          {locale === 'zh' ? 'Full HD: 120万 • 4K: 150万 • 6K: 450万' : locale === 'en' ? 'Full HD: 1.2M • 4K: 1.5M • 6K: 4.5M' : 'Full HD: 1.2tr • 4K: 1.5tr • 6K: 4.5tr'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setStandardVideoEditing(Math.max(0, standardVideoEditing - 1))}
                          className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm text-brand w-4 text-center">
                          {standardVideoEditing}
                        </span>
                        <button
                          type="button"
                          onClick={() => setStandardVideoEditing(Math.min(10, standardVideoEditing + 1))}
                          className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 6. Dựng phim nâng cao */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{t.advEditLabel}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-brand font-bold font-mono">
                            {priceAdvEditPerVideo.toLocaleString('vi-VN')} ₫ / video
                          </span>
                          <span className="px-1 py-0.2 rounded bg-surface-muted border border-surface-border text-[9px] text-zinc-400">
                            {editingQuality.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">
                          {locale === 'zh' ? 'Full HD: 280万 • 4K: 350万 • 6K: 650万' : locale === 'en' ? 'Full HD: 2.8M • 4K: 3.5M • 6K: 6.5M' : 'Full HD: 2.8tr • 4K: 3.5tr • 6K: 6.5tr'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdvancedVideoEditing(Math.max(0, advancedVideoEditing - 1))}
                          className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm text-brand w-4 text-center">
                          {advancedVideoEditing}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdvancedVideoEditing(Math.min(10, advancedVideoEditing + 1))}
                          className="w-7 h-7 rounded-lg bg-brand text-black flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 7. Chất lượng */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-1.5">
                      <span className="font-bold text-white">{t.qualityLabel}</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'fullhd', label: 'Full HD' },
                          { id: '4k', label: '4K' },
                          { id: '6k', label: '6K' }
                        ].map((q) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setEditingQuality(q.id as any)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              editingQuality === q.id
                                ? 'bg-brand text-black border-brand shadow-glow font-extrabold'
                                : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 8. Hậu kỳ ảnh */}
                    <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{t.photoRetouchLabel}</span>
                        <span className="text-[10px] text-brand font-mono font-semibold">
                          {pricePhotoRetouch > 0 ? `+${pricePhotoRetouch.toLocaleString('vi-VN')} ₫` : '0 ₫'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'none', label: t.optNone },
                          { id: 'standard', label: `${t.optStandard} (400k)` },
                          { id: 'premium', label: `${t.optPremium} (1.5tr)` }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPhotoRetouch(p.id as any)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              photoRetouch === p.id
                                ? 'bg-brand text-black border-brand shadow-glow font-extrabold'
                                : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Addons for customizer */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={express24h}
                        onChange={(e) => setExpress24h(e.target.checked)}
                        className="rounded text-brand focus:ring-brand"
                      />
                      <span className="text-zinc-200">{t.expressLabel}</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={makeupMUA}
                        onChange={(e) => setMakeupMUA(e.target.checked)}
                        className="rounded text-brand focus:ring-brand"
                      />
                      <span className="text-zinc-200">{t.makeupLabel}</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={luxuryPhotobook}
                        onChange={(e) => setLuxuryPhotobook(e.target.checked)}
                        className="rounded text-brand focus:ring-brand"
                      />
                      <span className="text-zinc-200">{t.photobookLabel}</span>
                    </label>
                  </div>

                  {/* Realtime Live Price Summary Box */}
                  <div className="p-3.5 rounded-2xl bg-brand/10 border border-brand/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                        {t.customTotalLabel}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading font-black text-2xl text-brand">
                          {customTotal.toLocaleString('vi-VN')} ₫
                        </span>
                        <span className="text-xs text-zinc-300">
                          ({t.deposit40Prefix} <strong className="text-white">{customDeposit40.toLocaleString('vi-VN')} ₫</strong>)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2 CONTENT: CATEGORY SELECTOR */}
              {bookingMode === 'category' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-heading font-bold text-base text-white">
                    {t.selectCategory}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedPackageId('');
                          setShowAllPackages(false);
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
              )}

              {/* LOCATION SELECTOR: 6 PROVINCES / CITIES */}
              <div className="pt-4 border-t border-surface-border">
                <h3 className="font-heading font-bold text-lg text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span>{t.selectProvince}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                      <span className="text-xs sm:text-sm font-bold block truncate">
                        {locale === 'zh' ? prov.nameZh : locale === 'en' ? prov.nameEn : prov.nameVi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
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

          {/* ========================================================================= */}
          {/* STEP 2: SELECT PACKAGE & ADD-ONS */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* If custom mode was selected in Step 1, display Custom Setup Summary card */}
              {bookingMode === 'custom' ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-brand/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-border pb-2">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-brand" />
                      <h4 className="font-bold text-white text-sm">
                        {t.customPackageName}
                      </h4>
                    </div>
                    <span className="font-mono font-black text-brand text-base">
                      {customTotal.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400">{t.customSummaryStep2}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-300 bg-surface-muted p-3 rounded-xl border border-surface-border">
                    <div>
                      <strong className="text-brand">🎥 Gimbal:</strong> {gimbalOperators} thợ
                    </div>
                    <div>
                      <strong className="text-brand">📷 Máy chụp:</strong> {photographers} thợ
                    </div>
                    <div>
                      <strong className="text-brand">🚁 Flycam:</strong> {drones} máy
                    </div>
                    <div>
                      <strong className="text-brand">🎬 Dựng:</strong> {editingQuality.toUpperCase()}
                    </div>
                  </div>

                  {(standardVideoEditing > 0 || advancedVideoEditing > 0 || voiceTalent !== 'none' || photoRetouch !== 'none' || express24h || makeupMUA || luxuryPhotobook) && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-zinc-300">
                      {standardVideoEditing > 0 && <span className="px-2 py-0.5 rounded-lg bg-surface-elevated border border-surface-border text-zinc-200">🎞️ {standardVideoEditing} Dựng tiêu chuẩn</span>}
                      {advancedVideoEditing > 0 && <span className="px-2 py-0.5 rounded-lg bg-surface-elevated border border-surface-border text-zinc-200">🎬 {advancedVideoEditing} Dựng nâng cao</span>}
                      {voiceTalent !== 'none' && <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">🎙️ Voice: {voiceTalent === 'premium' ? 'Cao cấp' : 'Tiêu chuẩn'}</span>}
                      {photoRetouch !== 'none' && <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">🖼️ Hậu kỳ: {photoRetouch === 'premium' ? 'Cao cấp' : 'Tiêu chuẩn'}</span>}
                      {express24h && <span className="px-2 py-0.5 rounded-lg bg-brand/10 border border-brand/30 text-brand font-semibold">⚡ Hậu kỳ 24h</span>}
                      {makeupMUA && <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">💄 Makeup MUA</span>}
                      {luxuryPhotobook && <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-semibold">📖 Photobook 30x30</span>}
                    </div>
                  )}
                </div>
              ) : (
                /* Category Standard Packages */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">
                        {(!selectedPackageId || showAllPackages) ? t.selectPackage : t.selectedPackageHeader}
                      </h3>
                      {!selectedPackageId && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {locale === 'zh' ? '请点击选择下方其中一个套餐：' : locale === 'en' ? 'Please click to select one package below:' : 'Vui lòng bấm chọn 1 gói dịch vụ phù hợp bên dưới:'}
                        </p>
                      )}
                    </div>
                    {selectedPackageId && !showAllPackages && (
                      <button
                        type="button"
                        onClick={() => setShowAllPackages(true)}
                        className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-brand text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.changePackage}</span>
                      </button>
                    )}
                  </div>

                  {(!selectedPackageId || showAllPackages) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availablePackages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        const name = locale === 'zh' ? pkg.nameZh : locale === 'en' ? pkg.nameEn : pkg.nameVi;
                        const deliverables = locale === 'zh' ? pkg.deliverablesZh : locale === 'en' ? pkg.deliverablesEn : pkg.deliverablesVi;

                        return (
                          <div
                            key={pkg.id}
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              setShowAllPackages(false);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between hover:border-brand/70 hover:scale-[1.01] ${
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
                  ) : (
                    /* Display ONLY the single selected package card */
                    activePackage && (() => {
                      const pkg = activePackage;
                      const name = locale === 'zh' ? pkg.nameZh : locale === 'en' ? pkg.nameEn : pkg.nameVi;
                      const deliverables = locale === 'zh' ? pkg.deliverablesZh : locale === 'en' ? pkg.deliverablesEn : pkg.deliverablesVi;

                      return (
                        <div className="rounded-2xl p-4 sm:p-5 border border-brand bg-brand/10 shadow-glow flex flex-col justify-between">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex gap-3.5 items-center">
                              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-brand/40 shadow-md">
                                <Image src={pkg.imageUrl} alt={name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-brand text-black text-[10px] font-black uppercase mb-1 shadow-sm">
                                  {locale === 'zh' ? '已选择套餐' : locale === 'en' ? 'Selected Package' : 'Gói Đã Chọn'}
                                </span>
                                <h4 className="font-bold text-base sm:text-lg text-white">{name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="font-extrabold text-lg sm:text-xl text-brand">{pkg.priceVndFormatted}</span>
                                  <span className="text-xs text-zinc-400">⏱️ {pkg.duration}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowAllPackages(true)}
                              className="self-start sm:self-center px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-zinc-200 hover:text-brand text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-brand" />
                              <span>{t.changePackage}</span>
                            </button>
                          </div>

                          <div className="mt-3.5 pt-3.5 border-t border-surface-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {deliverables.map((del, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-zinc-200">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="truncate">{del}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* Extra Optional Addons */}
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
                    onClick={() => {
                      if (bookingMode === 'category' && !selectedPackageId) {
                        alert(locale === 'zh' ? '请先点击选择一个服务套餐' : locale === 'en' ? 'Please click to select a package first' : 'Vui lòng bấm chọn 1 gói dịch vụ trước khi tiếp tục');
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow"
                  >
                    <span>{t.nextStep}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SCHEDULE & VENUE ADDRESS */}
          {/* ========================================================================= */}
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
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-brand"
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
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-brand"
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
                  className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
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

          {/* ========================================================================= */}
          {/* STEP 4: CONTACT INFO & PROCEED TO DEPOSIT */}
          {/* ========================================================================= */}
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
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
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
                    onChange={(e) => {
                      let val = e.target.value;
                      if (locale === 'vi') {
                        val = val.replace(/\D/g, '').slice(0, 10);
                      } else {
                        val = val.replace(/[^0-9+]/g, '');
                      }
                      setPhone(val);
                    }}
                    placeholder={locale === 'vi' ? '0943391369' : t.phoneNumberPlaceholder}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand font-mono"
                  />
                  {locale === 'vi' && phone && phone.length > 0 && (!phone.startsWith('0') || phone.length !== 10) && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      * Yêu cầu đúng 10 số và bắt đầu bằng số 0 (Đã nhập: {phone.length}/10 số)
                    </p>
                  )}
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
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t.zaloOrWhatsapp}</span>
                    {zaloOrWhatsapp && (
                      <span className="text-[10px] text-emerald-400 font-normal">✓ {t.autoFilled}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={zaloOrWhatsapp}
                    onChange={(e) => setZaloOrWhatsapp(e.target.value)}
                    placeholder={t.zaloOrWhatsappPlaceholder}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Summary Card before proceed to deposit */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-surface-border text-xs space-y-2">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>{t.selectedPackage}</span>
                  <strong className="text-white font-bold">
                    {bookingMode === 'custom'
                      ? t.customPackageName
                      : (activePackage ? (locale === 'zh' ? activePackage.nameZh : locale === 'en' ? activePackage.nameEn : activePackage.nameVi) : '')}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>{t.shootAddressLabel}</span>
                  <strong className="text-white font-medium capitalize">
                    {selectedProvince} {shootAddress ? `(${shootAddress})` : ''}
                  </strong>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>{t.addonsCount} ({selectedAddons.length}):</span>
                    <span className="text-brand font-medium">+{addonsTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}

                <div className="border-t border-surface-border pt-2 flex justify-between items-center">
                  <span className="font-bold text-zinc-200">{t.estimatedTotal}</span>
                  <span className="font-heading font-black text-lg text-brand">
                    {estimatedTotal.toLocaleString('vi-VN')} ₫
                  </span>
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
                  className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-glow disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.savingBooking}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.proceedToDeposit}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: VIETQR MB BANK DEPOSIT SECTION (40% / 60%) */}
          {/* ========================================================================= */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="text-center space-y-2 border-b border-surface-border pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.depositHeader}</span>
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
                  {t.depositHeader}
                </h3>
                <p className="text-xs text-zinc-400 max-w-xl mx-auto">
                  {t.depositNotice}
                </p>
              </div>

              {/* QR Switcher Tabs (Dynamic VietQR vs BIZ MBBANK 10% VAT) */}
              <div className="flex flex-col sm:flex-row bg-surface-muted p-1 rounded-2xl text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setStep5QrType('dynamic')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    step5QrType === 'dynamic'
                      ? 'bg-brand text-black shadow-md font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{t.dynamicQrTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep5QrType('biz')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    step5QrType === 'biz'
                      ? 'bg-amber-500 text-black shadow-md font-black'
                      : 'text-zinc-400 hover:text-amber-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{t.bizQrTab}</span>
                </button>
              </div>

              {/* Deposit Percentage Toggle (40% or 60%) */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-zinc-400 font-bold block">{t.depositOptionLabel}</span>
                  <span className="text-xs text-zinc-300">
                    {depositPercent === 40 ? 'Khóa lịch tiêu chuẩn 40%' : 'Thanh toán ưu tiên 60%'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositPercent(40)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                      depositPercent === 40
                        ? 'bg-brand text-black border-brand shadow-glow'
                        : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                    }`}
                  >
                    {t.deposit40Label} ({calculateDepositAmount(effectiveContractAmount, 40).toLocaleString('vi-VN')} ₫)
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositPercent(60)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                      depositPercent === 60
                        ? 'bg-brand text-black border-brand shadow-glow'
                        : 'bg-surface-muted text-zinc-300 border-surface-border hover:bg-surface'
                    }`}
                  >
                    {t.deposit60Label} ({calculateDepositAmount(effectiveContractAmount, 60).toLocaleString('vi-VN')} ₫)
                  </button>
                </div>
              </div>

              {/* Main VietQR & Transfer Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left QR Column */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white text-black shadow-2xl border-4 border-brand/50">
                  <div className="text-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                      {isStep5Vat10 ? 'MB BANK • MÃ QR BIZ DOANH NGHIỆP' : 'MB BANK • QUÂN ĐỘI VIỆT NAM'}
                    </span>
                    <span className="text-xs font-bold text-zinc-700">
                      {isStep5Vat10 ? 'Quét mã thanh toán có hóa đơn VAT 10%' : 'Quét mã để chuyển khoản tự động'}
                    </span>
                  </div>

                  <div className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-inner border border-zinc-200">
                    {vietQrSrc ? (
                      <img src={vietQrSrc} alt={isStep5Vat10 ? 'MÃ QR BIZ MBBANK CÓ VAT 10%' : 'MÃ QR MBBANK KHÔNG VAT'} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                        <QrCode className="w-16 h-16 text-zinc-400 animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-xs font-mono font-black text-brand-600 block">
                      STK: {currentStep5AccountNumber}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-800 uppercase">
                      {currentStep5AccountHolder}
                    </span>
                  </div>
                </div>

                {/* Right Breakdown Column */}
                <div className="md:col-span-7 space-y-3 text-xs">
                  
                  {/* Order & Amount Highlight Card */}
                  <div className="p-4 rounded-2xl bg-surface-elevated border border-brand/40 space-y-2.5">
                    
                    {/* Booking code */}
                    <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                      <span className="text-zinc-400 font-medium">{t.bookingCodeLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-brand">
                          {bookingResult?.bookingCode || 'NHIEP-XXXXX'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bookingResult?.bookingCode || '', 'code')}
                          className="px-2 py-0.5 rounded bg-surface-muted text-[10px] text-zinc-300 hover:text-white"
                        >
                          {copiedField === 'code' ? t.copiedBtn : t.copyBtn}
                        </button>
                      </div>
                    </div>

                    {/* Total Contract Amount */}
                    <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                      <span className="text-zinc-400 font-medium">{t.totalCostLabel}</span>
                      <div className="text-right">
                        <span className="font-mono font-black text-sm sm:text-base text-brand">
                          {effectiveContractAmount.toLocaleString('vi-VN')} ₫
                        </span>
                        {isStep5Vat10 && (
                          <span className="block text-[10px] text-amber-400 font-bold">
                            {t.vatIncludedBadge} ({t.vatBasePrice} {baseContractAmount.toLocaleString('vi-VN')} ₫)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Deposit Amount */}
                    <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                      <span className="text-zinc-400 font-medium">
                        {t.depositAmountLabel} ({depositPercent}%){isStep5Vat10 ? ' + VAT 10%' : ''}:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black text-base ${isStep5Vat10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {depositAmount.toLocaleString('vi-VN')} ₫
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(String(depositAmount), 'amount')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-black ${isStep5Vat10 ? 'bg-amber-400' : 'bg-brand'}`}
                        >
                          {copiedField === 'amount' ? t.copiedBtn : t.copyBtn}
                        </button>
                      </div>
                    </div>

                    {/* Transfer Memo */}
                    <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                      <span className="text-zinc-400 font-medium">{t.transferMemoLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-brand bg-brand/10 px-2 py-1 rounded-md border border-brand/30">
                          {transferMemo}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(transferMemo, 'memo')}
                          className="px-2 py-0.5 rounded bg-surface-muted text-[10px] text-zinc-300 hover:text-white"
                        >
                          {copiedField === 'memo' ? t.copiedBtn : t.copyBtn}
                        </button>
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                      <span className="text-zinc-400 font-medium">{t.accountNumberLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {currentStep5AccountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(currentStep5AccountNumber, 'acc')}
                          className="px-2 py-0.5 rounded bg-surface-muted text-[10px] text-zinc-300 hover:text-white"
                        >
                          {copiedField === 'acc' ? t.copiedBtn : t.copyBtn}
                        </button>
                      </div>
                    </div>

                    {/* Beneficiary */}
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">{t.accountHolderLabel}</span>
                      <span className="font-bold text-white uppercase text-[11px] sm:text-xs text-right">
                        {currentStep5AccountHolder} ({PAYMENT_CONFIG.bankName})
                      </span>
                    </div>
                  </div>

                  {/* Summary details (Full un-abbreviated descriptions) */}
                  <div className="p-3.5 rounded-xl bg-surface-muted border border-surface-border text-zinc-300 space-y-2">
                    <p className="flex items-start gap-1.5">
                      <span className="text-zinc-400 shrink-0">• {t.customerLabel}</span>
                      <strong className="text-white">{fullName}</strong> ({phone})
                    </p>
                    <div className="flex items-start gap-1.5 pt-0.5">
                      <span className="text-zinc-400 shrink-0">• {t.packageLabel}</span>
                      <span className="font-bold text-white leading-relaxed break-words">
                        {bookingResult?.packageName || fullPackageSummary}
                      </span>
                    </div>
                    <p className="flex items-start gap-1.5 pt-0.5">
                      <span className="text-zinc-400 shrink-0">• {t.shootTimeLabel}</span>
                      <strong className="text-white">{shootTime} ngày {shootDate}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Step 5 */}
              <div className="pt-4 border-t border-surface-border space-y-3">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Send bill receipt to Zalo */}
                  <a
                    href={zaloNoticeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t.sendZaloBtn}</span>
                  </a>

                  {/* Confirm paid & proceed to Step 6 */}
                  <button
                    type="button"
                    onClick={() => handleProceedToSuccess(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.confirmPaidBtn}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs text-zinc-400 hover:text-white underline font-medium"
                  >
                    {t.backToEdit}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProceedToSuccess(false)}
                    className="px-6 py-2.5 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-400 shadow-glow flex items-center gap-1.5"
                  >
                    <span>{t.nextBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: CELEBRATION & FINAL CONFIRMATION */}
          {/* ========================================================================= */}
          {step === 6 && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  {t.congratsTitle}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
                  {t.congratsSubtitle}
                </p>
                <div className="inline-block px-4 py-2 rounded-2xl bg-brand/15 border border-brand/50 text-brand font-mono font-black text-xl sm:text-2xl shadow-glow">
                  {bookingResult?.bookingCode || 'NHIEP-BOOKING-SUCCESS'}
                </div>
              </div>

              <p className="text-xs text-zinc-300 max-w-xl mx-auto leading-relaxed bg-surface-elevated/70 p-4 rounded-2xl border border-surface-border">
                {t.congratsMessage}
              </p>

              {/* Detailed Summary Card */}
              <div className="max-w-lg mx-auto p-5 rounded-2xl bg-surface-elevated border border-surface-border text-left text-xs space-y-2.5 shadow-xl">
                <h4 className="font-bold text-white text-sm border-b border-surface-border pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  <span>{t.orderSummaryTitle}</span>
                </h4>

                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.customerLabel}</span>
                  <strong className="text-white">{fullName}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.phoneLabel}</span>
                  <strong className="text-white font-mono">{phone}</strong>
                </div>

                {email && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">{t.emailLabel}</span>
                    <strong className="text-white">{email}</strong>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.packageLabel}</span>
                  <strong className="text-brand">
                    {bookingMode === 'custom'
                      ? t.customPackageName
                      : (activePackage ? (locale === 'zh' ? activePackage.nameZh : locale === 'en' ? activePackage.nameEn : activePackage.nameVi) : '')}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.shootTimeLabel}</span>
                  <span className="text-white font-medium">{shootTime} • {shootDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.shootAddressLabel}</span>
                  <span className="text-white font-medium capitalize">{selectedProvince} {shootAddress ? `- ${shootAddress}` : ''}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.depositPaidLabel}</span>
                  <span className="text-emerald-400 font-bold">{depositPercent}% ({depositAmount.toLocaleString('vi-VN')} ₫)</span>
                </div>

                <div className="flex justify-between border-t border-surface-border pt-2">
                  <span className="text-zinc-400 font-bold">{t.statusLabel}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.statusValue}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={`/${locale}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-zinc-200 text-xs font-bold transition-colors"
                >
                  {t.backHomeBtn}
                </Link>

                <a
                  href={`tel:${PAYMENT_CONFIG.hotline}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-brand/40 text-brand font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.callHotlineBtn}</span>
                </a>

                <a
                  href={`https://zalo.me/${PAYMENT_CONFIG.zalo}?text=Toi muon hoi ve don dat lich ${bookingResult?.bookingCode || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t.chatZaloBtn}</span>
                </a>
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
    <Suspense fallback={
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
      </div>
    }>
      <BookingForm locale={locale} />
    </Suspense>
  );
}
