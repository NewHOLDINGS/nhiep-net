'use client';

import React from 'react';
import Image from 'next/image';
import { Locale } from '@/types';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    nameVi: 'Nguyễn Anh Tuấn & Minh Trang',
    nameEn: 'Tuan & Trang Nguyen',
    nameZh: '阮英俊 & 明庄',
    serviceVi: 'Gói Cưới Pre-Wedding Hoàng Gia Đà Nẵng & Hội An',
    serviceEn: 'Royal Pre-Wedding Photoshoot (Da Nang & Hoi An)',
    serviceZh: '岘港与会安皇家唯美婚纱摄影全包套餐',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    commentVi: 'Ekip nhiep.net cực kỳ chuyên nghiệp và có tâm! Bắt trọn khoảnh khắc bình minh trên Cầu Vàng Bà Nà và hoàng hôn Hội An đẹp như tranh vẽ. Màu ảnh sang, trả file gốc ngay trong đêm.',
    commentEn: 'The nhiep.net production crew was absolutely phenomenal! Capturing sunrise at the Golden Bridge and sunset in Hoi An felt like a cinematic movie. Master files delivered so quickly!',
    commentZh: 'nhiep.net 摄制团队极度专业且充满热忱！清晨巴拿山佛手桥的薄雾朝霞与傍晚会安水灯之夜被拍摄得如油画般震撼，返图速度极快，强烈推荐！',
    rating: 5,
    location: 'Đà Nẵng / Hội An'
  },
  {
    nameVi: 'Lê Minh Quân (Giám đốc Marketing V-Group)',
    nameEn: 'David Le (Marketing Director)',
    nameZh: '黎明军（市场营销总监）',
    serviceVi: 'TVC Doanh Nghiệp & Quay Sự Kiện Gala Dinner Nha Trang',
    serviceEn: 'Corporate Brand TVC & Gala Dinner Nha Trang',
    serviceZh: '企业品牌TVC宣传片与芽庄高端晚宴盛典拍摄',
    avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80',
    commentVi: 'Tập đoàn chúng tôi tổ chức hội nghị 500 khách tại Vinpearl Nha Trang. Đội ngũ multi-cam và flycam làm việc chuẩn xác từng giây, tính năng Live-Photo gửi ảnh quét mã QR cho khách ngay tại tiệc được đánh giá rất cao.',
    commentEn: 'We hosted a 500-attendee summit at Vinpearl Nha Trang. The multi-cam and aerial drone team performed flawlessly. The 30-min live photo QR code sharing wowed all our VIP guests!',
    commentZh: '我们在芽庄珍珠度假村举办500人大型峰会，多机位与无人机协同作战天衣无缝。现场扫码极速找图功能获得所有VIP贵宾的高度赞誉！',
    rating: 5,
    location: 'Khánh Hòa'
  },
  {
    nameVi: 'Hoàng Kim Ngân',
    nameEn: 'Kim Ngan Hoang',
    nameZh: '黄金银',
    serviceVi: 'Bộ Ảnh Cổ Phục Triều Nguyễn & Áo Dài Di Sản Huế',
    serviceEn: 'Heritage Royal Costume & Ao Dai Hue Phototour',
    serviceZh: '顺化大内古服与阮朝传统奥黛深度旅拍',
    avatar: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80',
    commentVi: 'Chuyến đi Huế ý nghĩa nhất của mình! Nhiếp ảnh gia am hiểu lịch sử, chọn góc chụp cung điện rất trang nhã, áo dài Nhật Bình được chuẩn bị tinh xảo từng đường thêu.',
    commentEn: 'The most meaningful trip to Hue! The photographer was deeply knowledgeable about heritage architecture and royal aesthetics. The garments were museum-quality.',
    commentZh: '这是我最具意义的顺化之旅！摄影老师深谙皇室建筑文化与东方古典美学，挑选的日平古服刺绣精美绝伦，成片宛如穿越时空。',
    rating: 5,
    location: 'Thừa Thiên Huế'
  }
];

export default function TestimonialsSection({ locale }: { locale: Locale }) {
  return (
    <section className="py-16 bg-surface-muted/30 border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Verified Reviews
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mt-1">
            Đánh Giá Từ Khách Hàng Thực Tế
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Hơn 2,500+ dự án quay chụp thành công và nhận được sự tin yêu trọn vẹn từ khách hàng trong nước và quốc tế
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
                    <p className="text-[10px] text-brand font-semibold">{rev.location}</p>
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
