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

