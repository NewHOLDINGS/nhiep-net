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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  recommendedPackages?: {
    id: string;
    name: string;
    price: string;
    category: string;
    imageUrl: string;
  }[];
  timestamp: string;
}
