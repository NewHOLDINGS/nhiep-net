export type Locale = 'vi' | 'en' | 'zh';

export type ProvinceId = 'danang' | 'hue' | 'quangtri' | 'khanhhoa';

export type CategoryId = 
  | 'photography'
  | 'videography'
  | 'post-production'
  | 'event-coverage'
  | 'travel-photography';

export interface Province {
  id: ProvinceId;
  name: string;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  slug: string;
  heroImage: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionZh: string;
  landmarks: string[];
}

export interface ServiceCategory {
  id: CategoryId;
  slug: string;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionZh: string;
  icon: string;
  badge: string;
  heroImage: string;
}

export interface ServicePackage {
  id: string;
  slug: string;
  categoryId: CategoryId;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionZh: string;
  priceVnd: number;
  priceVndFormatted: string;
  duration: string;
  deliverablesVi: string[];
  deliverablesEn: string[];
  deliverablesZh: string[];
  crewSize: string;
  gear: string;
  turnaround: string;
  imageUrl: string;
  featured?: boolean;
  popular?: boolean;
  provinces: ProvinceId[];
  tags: string[];
}

export interface ArticleFaq {
  questionVi: string;
  questionEn: string;
  questionZh: string;
  answerVi: string;
  answerEn: string;
  answerZh: string;
}

export interface Article {
  id: string;
  slug: string;
  slugVi: string;
  slugEn: string;
  slugZh: string;
  categoryId: CategoryId;
  provinceId: ProvinceId;
  titleVi: string;
  titleEn: string;
  titleZh: string;
  excerptVi: string;
  excerptEn: string;
  excerptZh: string;
  contentVi: string;
  contentEn: string;
  contentZh: string;
  featuredImage: string;
  inContentImages: string[];
  author: string;
  publishedAt: string;
  readingTimeMin: number;
  metaTitleVi: string;
  metaTitleEn: string;
  metaTitleZh: string;
  metaDescVi: string;
  metaDescEn: string;
  metaDescZh: string;
  keywords: string[];
  faqs: ArticleFaq[];
  relatedPackageIds: string[];
}

export interface BookingAddon {
  id: string;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  priceVnd: number;
}

export interface CustomBuilderConfig {
  gimbalOperators: number;
  photographers: number;
  drones: number;
  editingQuality: 'fullhd' | '4k' | '6k';
  express24h: boolean;
  makeupMUA: boolean;
  luxuryPhotobook: boolean;
  totalVnd: number;
  depositVnd: number;
  shootDate?: string;
  location?: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  phone: string;
  email: string;
  zaloOrWhatsapp?: string;
  categoryId: CategoryId;
  packageId: string;
  packageName: string;
  provinceId: ProvinceId;
  shootDate: string;
  shootTime: string;
  shootAddress: string;
  notes?: string;
  addOns: string[];
  estimatedTotalVnd: number;
  depositAmountVnd?: number;
  depositStatus?: 'unpaid' | 'paid_deposit' | 'paid_full';
  paymentMethod?: 'vietqr' | 'cash';
  qrPaymentUrl?: string;
  customConfig?: {
    gimbalOperators?: number;
    photographers?: number;
    drones?: number;
    editingQuality?: string;
    express24h?: boolean;
    makeupMUA?: boolean;
    luxuryPhotobook?: boolean;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'doc' | 'audio' | 'drive';
  name: string;
  size?: string;
  url?: string;
  dataUrl?: string; // base64 or link
  textContent?: string; // text extracted for .csv, .html, .txt, .xlsx, .ods, .pptx, .docx
  fileExtension?: string;
  mimeType?: string;
}

export interface CustomPackageOption {
  id: string;
  tier: string;
  name: string;
  cameraCount: string;
  crewDetails: string;
  gear: string;
  deliverables: string[];
  estimatedPriceVnd: number;
  estimatedPriceVndFormatted: string;
  highlights: string;
}

export interface AiScriptPlan {
  conceptTitle: string;
  summary: string;
  cameraCrewProposal: {
    videoCameras: string;
    photoCameras: string;
    drones: string;
    directors: string;
    lightingAndAudio: string;
    recommendedTotalCrew: string;
  };
  timelineBreakdown: {
    scene: string;
    time: string;
    description: string;
    recommendedGear: string;
  }[];
  customPackages: CustomPackageOption[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: ChatAttachment[];
  driveLink?: string;
  recommendedPackages?: {
    id: string;
    name: string;
    price: string;
    category: string;
    imageUrl: string;
  }[];
  scriptPlan?: AiScriptPlan;
  customPackages?: CustomPackageOption[];
  orderLead?: {
    customerName: string;
    phone: string;
    selectedPackageName?: string;
    selectedPrice?: string;
    status?: 'sent_zalo';
  };
  timestamp: string;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  locale: Locale;
  createdAt: string;
  updatedAt: string;
  customerInfo: {
    name?: string;
    phone?: string;
    email?: string;
    zalo?: string;
  };
  messages: ChatMessage[];
  scriptSummary?: string;
  filesCount: number;
  driveLinksCount: number;
  convertedToLead: boolean;
  status: 'active' | 'closed' | 'converted';
  userPlatform?: string;
}

export interface AdminOtpSession {
  email: string;
  otp: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Customer Shopping Cart Item
 */
export interface CartItem {
  id: string;
  type: 'standard_package' | 'ai_package' | 'custom_builder';
  name: string;
  priceVnd: number;
  depositVnd: number;
  quantity: number;
  image?: string;
  details?: string;
  crewSummary?: string;
  deliverables?: string[];
  shootDate?: string;
  province?: string;
  customConfig?: {
    gimbalOperators?: number;
    photographers?: number;
    drones?: number;
    editingQuality?: string;
    express24h?: boolean;
    makeupMUA?: boolean;
    luxuryPhotobook?: boolean;
  };
}

/**
 * Customer User Session
 */
export interface CustomerUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'phone' | 'custom';
  facebookUrl?: string;
  zalo?: string;
  address?: string;
  loggedInAt: string;
}

export interface SavedAiQuote {
  id: string;
  conceptTitle: string;
  summary: string;
  createdAt: string;
  packages: CustomPackageOption[];
}
