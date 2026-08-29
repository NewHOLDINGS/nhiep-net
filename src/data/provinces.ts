import { Province } from '@/types';

export const PROVINCES: Province[] = [
  {
    id: 'danang',
    name: 'Đà Nẵng',
    nameVi: 'Đà Nẵng',
    nameEn: 'Da Nang',
    nameZh: '岘港',
    slug: 'da-nang',
    heroImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=80',
    descriptionVi: 'Thành phố đáng sống bậc nhất Việt Nam với bãi biển Mỹ Khê, bán đảo Sơn Trà, Cầu Rồng, Bà Nà Hills và vẻ đẹp hiện đại đan xen thiên nhiên hùng vĩ.',
    descriptionEn: 'Vietnam’s most vibrant coastal city featuring My Khe Beach, Son Tra Peninsula, Dragon Bridge, Ba Na Hills, and world-class luxury resorts.',
    descriptionZh: '越南最具活力的海滨城市，拥有美溪海滩、山茶半岛、龙桥、巴拿山以及世界级奢华度假胜地。',
    landmarks: ['Bà Nà Hills', 'Bán đảo Sơn Trà', 'Cầu Rồng', 'Biển Mỹ Khê', 'Ngũ Hành Sơn', 'Đèo Hải Vân', 'InterContinental Resort']
  },
  {
    id: 'hue',
    name: 'Thừa Thiên Huế',
    nameVi: 'Thừa Thiên Huế',
    nameEn: 'Hue',
    nameZh: '顺化',
    slug: 'hue',
    heroImage: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1600&q=80',
    descriptionVi: 'Cố đô di sản ngàn năm với Đại Nội cổ kính, lăng tẩm hoàng gia, sông Hương thơ mộng, chùa Thiên Mụ và văn hóa áo dài truyền thống đặc sắc.',
    descriptionEn: 'The historic imperial capital with the ancient Citadel, royal tombs, poetic Perfume River, Thien Mu Pagoda, and rich traditional Ao Dai heritage.',
    descriptionZh: '千年的古老皇城，拥有宏伟的顺化皇城、皇家陵寝、诗意的香江、天姥寺和独特的传统奥黛文化。',
    landmarks: ['Đại Nội Huế', 'Chùa Thiên Mụ', 'Lăng Khải Định', 'Lăng Tự Đức', 'Sông Hương & Cầu Tràng Tiền', 'Đồi Vọng Cảnh', 'Lăng Cô']
  },
  {
    id: 'quangtri',
    name: 'Quảng Trị',
    nameVi: 'Quảng Trị',
    nameEn: 'Quang Tri',
    nameZh: '广治',
    slug: 'quang-tri',
    heroImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80',
    descriptionVi: 'Vùng đất lịch sử hào hùng và thiên nhiên hoang sơ với Thành cổ Quảng Trị, Địa đạo Vịnh Mốc, Cửa Việt, Khe Sanh cùng vẻ đẹp mộc mạc.',
    descriptionEn: 'A land of heroic history and pristine nature featuring Quang Tri Ancient Citadel, Vinh Moc Tunnels, Cua Viet Beach, and Khe Sanh highlands.',
    descriptionZh: '历史底蕴深厚且自然质朴的土地，拥有广治古堡、永木地道、越口海滩和溪山高地。',
    landmarks: ['Thành cổ Quảng Trị', 'Địa đạo Vịnh Mốc', 'Bãi biển Cửa Việt', 'Sân bay Tà Cơn & Khe Sanh', 'Cầu Hiền Lương & Sông Bến Hải', 'Đảo Cồn Cỏ']
  },
  {
    id: 'khanhhoa',
    name: 'Khánh Hòa',
    nameVi: 'Khánh Hòa',
    nameEn: 'Khanh Hoa (Nha Trang)',
    nameZh: '庆和 (芽庄)',
    slug: 'khanh-hoa',
    heroImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80',
    descriptionVi: 'Xứ trầm biển yến với vịnh Nha Trang ngọc ngà, Bãi Dài Cam Ranh, Tháp Bà Ponagar, du thuyền sang trọng và làn nước trong xanh như pha lê.',
    descriptionEn: 'Tropical paradise featuring Nha Trang Bay, Cam Ranh Long Beach, Ponagar Cham Towers, luxury yacht charters, and crystal blue waters.',
    descriptionZh: '热带海滨度假胜地，拥有璀璨的芽庄湾、金兰长滩、婆那加占婆塔、豪华游艇以及如水晶般清澈的蔚蓝海水。',
    landmarks: ['Vịnh Nha Trang', 'Bãi Dài Cam Ranh', 'Tháp Bà Ponagar', 'Hòn Mun & Hòn Tằm', 'VinWonders Nha Trang', 'Bán đảo Đầm Môn', 'Dốc Lết']
  },
  {
    id: 'hanoi',
    name: 'Hà Nội',
    nameVi: 'Hà Nội',
    nameEn: 'Hanoi',
    nameZh: '河内',
    slug: 'ha-noi',
    heroImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80',
    descriptionVi: 'Thủ đô ngàn năm văn hiến với Hồ Hoàn Kiếm, 36 phố phường cổ kính, Hoàng thành Thăng Long, các sự kiện ngoại giao & nghệ thuật đỉnh cao.',
    descriptionEn: 'The historic millennial capital featuring Hoan Kiem Lake, the vibrant Old Quarter, Imperial Citadel, and prestigious event & wedding venues.',
    descriptionZh: '拥有千年历史的古都，汇聚还剑湖、三十六行古街、升龙皇城及高端商务与艺术活动场地。',
    landmarks: ['Hồ Hoàn Kiếm', 'Phố Cổ Hà Nội', 'Hoàng Thành Thăng Long', 'Cầu Long Biên', 'Hồ Tây', 'Nhà Hát Lớn Hà Nội']
  },
  {
    id: 'hochiminh',
    name: 'TP. Hồ Chí Minh',
    nameVi: 'TP. Hồ Chí Minh',
    nameEn: 'Ho Chi Minh City',
    nameZh: '胡志明市',
    slug: 'ho-chi-minh',
    heroImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80',
    descriptionVi: 'Trung tâm kinh tế & giải trí sôi động bậc nhất với Landmark 81, sông Sài Gòn, các đại tiệc cưới sang trọng, sự kiện quốc tế & TVC quy mô lớn.',
    descriptionEn: 'Vietnam’s leading economic & entertainment hub with Landmark 81, Saigon River, luxury banquets, international events, and high-end commercial TVCs.',
    descriptionZh: '越南最具活力的经济与时尚之都，拥有地标81、西贡河、顶级奢华婚礼宴会、国际盛典及高端商业广告拍摄场地。',
    landmarks: ['Landmark 81', 'Bến Bạch Đằng & Sông Sài Gòn', 'Nhà Thờ Đức Bà', 'Chợ Bến Thành', 'Phố Đi Bộ Nguyễn Huệ', 'Dinh Độc Lập']
  }
];
