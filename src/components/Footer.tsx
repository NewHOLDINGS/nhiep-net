import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { getDictionary } from '@/data/translations';
import { PROVINCES } from '@/data/provinces';
import { CATEGORIES } from '@/data/categories';
import { Phone, MessageCircle, Mail, MapPin, Sparkles, Shield, Camera, Heart } from 'lucide-react';

const ECOSYSTEM_LINKS = [
  { domain: 'New.holdings', descVi: 'Hệ sinh thái số', descEn: 'Digital Ecosystem', descZh: '数字生态系统', href: 'https://new.holdings' },
  { domain: 'Newmedia.vn', descVi: 'Tiếp thị kỹ thuật số', descEn: 'Digital Marketing', descZh: '数字营销', href: 'https://newmedia.vn' },
  { domain: 'Quayphim.net', descVi: 'Quay phim số', descEn: 'Digital Videography', descZh: '数字影视摄录', href: 'https://quayphim.net' },
  { domain: 'Chuphinh.net', descVi: 'Chụp hình số', descEn: 'Digital Photography', descZh: '数字摄影', href: 'https://chuphinh.net' },
  { domain: 'Edit.com.vn', descVi: 'Hậu kỳ số', descEn: 'Digital Post-Production', descZh: '数字后期制作', href: 'https://edit.com.vn' },
  { domain: 'Newevent.net', descVi: 'Sự kiện số', descEn: 'Digital Event Production', descZh: '数字活动企划', href: 'https://newevent.net' },
  { domain: 'NewMedia.com.vn', descVi: 'Truyền thông số', descEn: 'Digital Media', descZh: '数字传媒', href: 'https://newmedia.com.vn' },
  { domain: 'NewWorld.vn', descVi: 'Dịch vụ du lịch số', descEn: 'Digital Tourism Services', descZh: '数字文旅服务', href: 'https://newworld.vn' },
  { domain: 'Newhomes.com.vn', descVi: 'Bất động sản số', descEn: 'Digital Real Estate', descZh: '数字地产', href: 'https://newhomes.com.vn' },
];

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="bg-black border-t border-surface-border text-zinc-400 pt-16 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-surface-border">
          {/* Col 1: Brand & Digital Ecosystem */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-brand bg-surface shadow-glow">
                <Image src="/logo.jpg" alt="nhiep.net" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-2xl text-white">
                  NHIEP<span className="text-brand">.NET</span>
                </span>
                <span className="text-xs text-zinc-400 font-medium">Cinema & Photography Platform</span>
              </div>
            </Link>

            {/* Ecosystem Links */}
            <div className="pt-2 space-y-1.5 text-xs">
              {ECOSYSTEM_LINKS.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-brand transition-colors group py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand/60 group-hover:bg-brand group-hover:scale-125 transition-all shrink-0" />
                  <span className="font-semibold text-zinc-200 group-hover:text-brand">{item.domain}</span>
                  <span className="text-zinc-600">-</span>
                  <span className="text-zinc-400 group-hover:text-zinc-200">
                    {locale === 'zh' ? item.descZh : locale === 'en' ? item.descEn : item.descVi}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
              {dict.footer.services}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${locale}/packages?category=${cat.id}`}
                    className="hover:text-brand transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand/50" />
                    <span>{locale === 'zh' ? cat.nameZh : locale === 'en' ? cat.nameEn : cat.nameVi}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Regional Hubs */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
              {dict.provinces.title}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {PROVINCES.map((prov) => (
                <li key={prov.id}>
                  <Link
                    href={`/${locale}/packages?province=${prov.id}`}
                    className="hover:text-brand transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <span>{locale === 'zh' ? prov.nameZh : locale === 'en' ? prov.nameEn : prov.nameVi}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Hotlines */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
              {dict.footer.contactInfo}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a
                  href="tel:0943391369"
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-muted hover:bg-surface-elevated border border-surface-border text-white hover:text-brand transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand" />
                  <span className="font-semibold">Hotline: 0943391369</span>
                </a>
              </li>
              <li>
                <a
                  href="https://zalo.me/0943391369"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-muted hover:bg-surface-elevated border border-surface-border text-white hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">Zalo: 0943391369</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/84943391369"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-muted hover:bg-surface-elevated border border-surface-border text-white hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">WhatsApp: +84 943 391 369</span>
                </a>
              </li>
              <li className="pt-2 text-zinc-400 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>522 Tôn Đức Thắng, Phường Hoà Khánh, TP. Đà Nẵng</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} nhiep.net. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/blog`} className="hover:text-zinc-300 transition-colors">
              {dict.nav.blog} (200 SEO Guides)
            </Link>
            <Link href={`/${locale}/admin`} className="hover:text-zinc-300 transition-colors">
              {dict.nav.admin}
            </Link>
            <span className="flex items-center gap-1 text-zinc-400">
              Made with <Heart className="w-3.5 h-3.5 text-brand fill-brand" /> by nhiep.net
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
