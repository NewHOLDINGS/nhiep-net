'use client';

import React from 'react';
import Image from 'next/image';
import { Locale } from '@/types';
import { getDictionary } from '@/data/translations';
import { Star, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    nameVi: 'Nguyễn Anh Tuấn & Minh Trang',
    nameEn: 'Tuan & Trang Nguyen',
    nameZh: '阮英俊 & 明庄',
    serviceVi: 'Gói Cưới Pre-Wedding Hoàng Gia',
    serviceEn: 'Royal Pre-Wedding Photoshoot',
    serviceZh: '唯美皇家婚纱摄影全包套餐',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    commentVi: 'Ekip nhiep.net cực kỳ chuyên nghiệp và có tâm! Bắt trọn khoảnh khắc nghệ thuật đẹp như tranh vẽ. Màu ảnh sang trọng đẳng cấp cinema, trả toàn bộ file gốc ngay trong đêm.',
    commentEn: 'The nhiep.net production crew was absolutely phenomenal! Capturing stunning cinematic visuals and genuine emotions. Master files and color grading delivered promptly!',
    commentZh: 'nhiep.net 摄制团队极度专业且充满热忱！光影艺术构图如电影般震撼，色彩质感高级，成片交付极快，强烈推荐！',
    rating: 5
  },
  {
    nameVi: 'Lê Minh Quân (Giám đốc Marketing V-Group)',
    nameEn: 'David Le (Marketing Director)',
    nameZh: '黎明军（市场营销总监）',
    serviceVi: 'TVC Doanh Nghiệp & Quay Sự Kiện Gala Dinner',
    serviceEn: 'Corporate Brand TVC & Gala Dinner Event',
    serviceZh: '企业品牌TVC宣传片与高端晚宴盛典拍摄',
    avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80',
    commentVi: 'Tập đoàn chúng tôi tổ chức hội nghị 500 khách quy mô lớn. Đội ngũ multi-cam và flycam làm việc chuẩn xác từng giây, tính năng Live-Photo gửi ảnh quét mã QR cho khách ngay tại tiệc được đánh giá rất cao.',
    commentEn: 'We hosted a 500-attendee corporate summit. The multi-cam and aerial drone team performed flawlessly. The 30-min live photo QR code sharing wowed all our VIP guests!',
    commentZh: '我们在大型会展中心举办500人峰会，多机位与无人机协同作战天衣无缝。现场扫码极速找图功能获得所有VIP贵宾的高度赞誉！',
    rating: 5
  },
  {
    nameVi: 'Hoàng Kim Ngân',
    nameEn: 'Kim Ngan Hoang',
    nameZh: '黄金银',
    serviceVi: 'Bộ Ảnh Cổ Phục & Áo Dài Di Sản Nghệ Thuật',
    serviceEn: 'Heritage Royal Costume & Art Phototour',
    serviceZh: '古典华服与传统艺术深度摄影写真',
    avatar: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80',
    commentVi: 'Trải nghiệm chụp ảnh vô cùng ý nghĩa! Nhiếp ảnh gia am hiểu nghệ thuật thị giác, bắt góc chụp rất trang nhã, trang phục và makeup được chuẩn bị tỉ mỉ từng chi tiết.',
    commentEn: 'An unforgettable and deeply artistic photoshoot! The photographer had outstanding aesthetic direction and captured timeless royal visual compositions.',
    commentZh: '这是我最具艺术美感的拍摄体验！摄影老师深谙传统美学与构图意境，造型妆造精致考究，成片宛如穿越时空。',
    rating: 5
  }
];

export default function TestimonialsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="py-16 bg-surface-muted/30 border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            {dict.testimonials.tag}
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mt-1">
            {dict.testimonials.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            {dict.testimonials.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, idx) => {
            const name = locale === 'zh' ? rev.nameZh : locale === 'en' ? rev.nameEn : rev.nameVi;
            const service = locale === 'zh' ? rev.serviceZh : locale === 'en' ? rev.serviceEn : rev.serviceVi;
            const comment = locale === 'zh' ? rev.commentZh : locale === 'en' ? rev.commentEn : rev.commentVi;

            return (
              <div
                key={idx}
                className="rounded-2xl p-6 glass-panel flex flex-col justify-between border border-surface-border"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                    "{comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-border flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-brand/40 shrink-0">
                    <Image src={rev.avatar} alt={name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate">{name}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{service}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
