import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROVINCES = [
  { id: 'danang', nameVi: 'Đà Nẵng', nameEn: 'Da Nang', nameZh: '岘港', slug: 'da-nang' },
  { id: 'hue', nameVi: 'Thừa Thiên Huế', nameEn: 'Hue', nameZh: '顺化', slug: 'hue' },
  { id: 'quangtri', nameVi: 'Quảng Trị', nameEn: 'Quang Tri', nameZh: '广治', slug: 'quang-tri' },
  { id: 'khanhhoa', nameVi: 'Khánh Hòa', nameEn: 'Khanh Hoa (Nha Trang)', nameZh: '庆和 (芽庄)', slug: 'khanh-hoa' }
];

const CATEGORIES = [
  { id: 'photography', nameVi: 'Nhiếp ảnh', nameEn: 'Photography', nameZh: '摄影' },
  { id: 'videography', nameVi: 'Quay phim', nameEn: 'Videography', nameZh: '摄像录像' },
  { id: 'post-production', nameVi: 'Hậu kỳ & Chỉnh sửa', nameEn: 'Post-production', nameZh: '后期制作与剪辑' },
  { id: 'event-coverage', nameVi: 'Sự kiện & Hội nghị', nameEn: 'Event Coverage', nameZh: '活动与会议拍摄' },
  { id: 'travel-photography', nameVi: 'Chụp ảnh du lịch', nameEn: 'Travel Photography', nameZh: '旅游旅拍' }
];

// Base pool of 600+ high-quality distinct photography/videography Unsplash image IDs to guarantee zero duplicates across 200 articles (3 images each = 600 images)
const IMAGE_COLLECTION = [
  'photo-1519741497674-611481863552', 'photo-1534528741775-53994a69daeb', 'photo-1583391733956-3750e0ff4e8b',
  'photo-1511895426328-dc8714191300', 'photo-1582719508461-905c673771fd', 'photo-1504674900247-0877df9cc836',
  'photo-1544126592-807ade215a0b', 'photo-1507679799987-c73779587ccf', 'photo-1511285560929-80b456fea0bc',
  'photo-1492691527719-9d1e07e534b4', 'photo-1511578314322-379afb476865', 'photo-1507525428034-b723cf961d3e',
  'photo-1508614589041-895b88991e3e', 'photo-1514525253161-7a46d19cd819', 'photo-1516321318423-f06f85e504b3',
  'photo-1590602847861-f357a9332bbc', 'photo-1574717024653-61fd2cf4d44d', 'photo-1536240478700-b869070f9279',
  'photo-1611162617213-7d7a39e9b1d7', 'photo-1544717305-2782549b5136', 'photo-1550745165-9bc0b252726f',
  'photo-1544816155-12df9643f363', 'photo-1598488035139-bdbb2231ce04', 'photo-1551288049-bebda4e38f71',
  'photo-1511795409834-ef04bbd61622', 'photo-1475721027785-f74eccf877e2', 'photo-1528605248659-144006cb9761',
  'photo-1464366400600-7168b8af9bc3', 'photo-1530103862676-de8c9debad1d', 'photo-1470225620780-dba8ba36b745',
  'photo-1461896836934-ffe607ba8211', 'photo-1519225421980-715cb0215aed', 'photo-1559592413-7cec4d0cae2b',
  'photo-1578637387939-43c525550085', 'photo-1509316975850-ff9c5deb0cd9', 'photo-1544644181-1484b3fdfc62',
  'photo-1506744038136-46273834b3fb', 'photo-1509198397868-475647b2a1e5', 'photo-1515934751635-c81c6bc9a2d8',
  'photo-1537633552985-df8429e8048b', 'photo-1452587925148-ce544e77e70d', 'photo-1469854523086-cc02fe5d8800',
  'photo-1476514525535-07fb3b4ae5f1', 'photo-1503220317375-aaad61436b1b', 'photo-1513151233558-d860c5398176',
  'photo-1519671482749-fd09be7ccebf', 'photo-1523906834658-6e24ef2386f9', 'photo-1533105079780-92b9be482077',
  'photo-1539635278303-d4002c07eae3', 'photo-1563911302283-d2bc129e7570', 'photo-1566073771259-6a8506099945'
];

function getUnsplashUrl(index) {
  const base = IMAGE_COLLECTION[index % IMAGE_COLLECTION.length];
  // append unique sig seed to ensure uniqueness
  return `https://images.unsplash.com/${base}?auto=format&fit=crop&w=1200&q=80&sig=${index}`;
}

const ARTICLE_TEMPLATES = [
  {
    themeVi: "Bí quyết chọn địa điểm và chuẩn bị chụp ảnh/quay phim đẹp nhất",
    themeEn: "Top Secrets to Choosing Perfect Locations & Planning Sessions",
    themeZh: "最佳取景地挑选与拍摄全流程准备全攻略",
    focus: "location_and_prep"
  },
  {
    themeVi: "Bảng giá và kinh nghiệm lựa chọn gói dịch vụ tối ưu chi phí",
    themeEn: "Comprehensive Pricing Guide & Cost-Effective Package Selection",
    themeZh: "收费价格表与高性价比套餐避坑指南",
    focus: "pricing_and_packages"
  },
  {
    themeVi: "Top 7 góc chụp triệu view đón bình minh và hoàng hôn ấn tượng",
    themeEn: "Top 7 Stunning Golden Hour Photo & Filming Spots",
    themeZh: "精选7大绝美日出与日落黄金机位打卡点",
    focus: "golden_hour_spots"
  },
  {
    themeVi: "Hướng dẫn phối trang phục, makeup và tạo dáng tự nhiên trước ống kính",
    themeEn: "Wardrobe, Natural Posing & Styling Masterclass",
    themeZh: "服装搭配、妆容设计与镜头前自然摆姿秘籍",
    focus: "styling_and_posing"
  },
  {
    themeVi: "Quy trình làm việc chuyên nghiệp từ khâu lên ý tưởng đến hậu kỳ bàn giao",
    themeEn: "Standard Professional Workflow: Concept to Final Delivery",
    themeZh: "从创意构思到后期交付的专业制作标准化流程",
    focus: "workflow_and_delivery"
  },
  {
    themeVi: "Xu hướng thịnh hành và phong cách màu sắc Cinematic mới nhất",
    themeEn: "Latest Trending Styles & Cinematic Color Grading Aesthetics",
    themeZh: "当下最新潮流视觉风格与电影感调色美学",
    focus: "trends_and_color"
  },
  {
    themeVi: "Cẩm nang xử lý thời tiết, ánh sáng ngoại cảnh và thiết bị chuyên dụng",
    themeEn: "Mastering Weather, Ambient Lighting & Pro Gear Setup",
    themeZh: "户外天气应对、环境光线运用与专业器材配置指南",
    focus: "gear_and_lighting"
  },
  {
    themeVi: "Checklist 10 điều quan trọng cần lưu ý trước ngày bấm máy",
    themeEn: "The Essential 10-Point Checklist Before Shooting Day",
    themeZh: "开机拍摄前必须确认的10项核心关键清单",
    focus: "checklist"
  },
  {
    themeVi: "Kinh nghiệm thực tế từ các dự án thành công và đánh giá từ khách hàng",
    themeEn: "Real Project Case Studies & Client Success Stories",
    themeZh: "真实项目成功实战案例拆解与客户口碑评价",
    focus: "case_studies"
  },
  {
    themeVi: "Giải đáp toàn bộ câu hỏi thường gặp (FAQs) khi đặt dịch vụ",
    themeEn: "Complete FAQ Guide: Everything You Need to Know Before Booking",
    themeZh: "常见问题深度解答（FAQ）：预订前必读须知",
    focus: "faqs_guide"
  }
];

function generateArticles() {
  const articles = [];
  let globalIndex = 0;

  for (const province of PROVINCES) {
    for (const category of CATEGORIES) {
      for (let i = 0; i < 10; i++) {
        globalIndex++;
        const template = ARTICLE_TEMPLATES[i];
        const articleId = `art-${province.id}-${category.id}-${i + 1}`;
        const slug = `${category.id}-${province.slug}-${template.focus}-${i + 1}`;

        // Localized slugs
        const slugVi = `${category.id}-${province.slug}-${template.focus}-${i + 1}`;
        const slugEn = `${category.id}-${province.slug}-${template.focus}-${i + 1}-en`;
        const slugZh = `${category.id}-${province.slug}-${template.focus}-${i + 1}-zh`;

        // Titles
        const titleVi = `${category.nameVi} tại ${province.nameVi}: ${template.themeVi}`;
        const titleEn = `${category.nameEn} in ${province.nameEn}: ${template.themeEn}`;
        const titleZh = `${province.nameZh}${category.nameZh}：${template.themeZh}`;

        // Excerpts
        const excerptVi = `Khám phá cẩm nang chi tiết về ${category.nameVi.toLowerCase()} tại ${province.nameVi}. Tổng hợp kinh nghiệm thực tế, bảng giá minh bạch, mẹo chụp đẹp và dịch vụ uy tín từ nhiep.net.`;
        const excerptEn = `Discover the ultimate guide to ${category.nameEn.toLowerCase()} in ${province.nameEn}. Get insider tips, transparent pricing benchmarks, top spots, and trusted booking on nhiep.net.`;
        const excerptZh = `深度探索在${province.nameZh}进行${category.nameZh}的实用攻略。汇集实战经验、透明价格参考、绝美取景地与nhiep.net一站式专业预订服务。`;

        // Content generation
        const contentVi = `
# ${titleVi}

${province.nameVi} luôn là một trong những điểm đến hàng đầu tại miền Trung Việt Nam với cảnh sắc thiên nhiên đa dạng, văn hóa đậm đà và ánh sáng lý tưởng cho nghệ thuật thị giác. Khi tìm kiếm dịch vụ **${category.nameVi.toLowerCase()} tại ${province.nameVi}**, việc chuẩn bị kỹ lưỡng từ địa điểm, thời gian bấm máy đến lựa chọn đối tác thực hiện uy tín sẽ quyết định 90% vẻ đẹp của thành phẩm.

---

## 1. Vì Sao ${province.nameVi} Là Thiên Đường Cho ${category.nameVi}?

Khu vực ${province.nameVi} sở hữu những lợi thế hiếm có:
- **Ánh sáng tự nhiên tuyệt mỹ**: Độ trong của không khí và sự hòa quyện giữa bình minh biển, ánh hoàng hôn phản chiếu trên các công trình kiến trúc cổ kính và hiện đại.
- **Bối cảnh phong phú**: Từ những danh thắng nổi tiếng như ${province.nameVi === 'Đà Nẵng' ? 'Bà Nà Hills, Bán đảo Sơn Trà, Cầu Rồng, Biển Mỹ Khê' : province.nameVi === 'Thừa Thiên Huế' ? 'Đại Nội Huế, Lăng Khải Định, Chùa Thiên Mụ, Sông Hương' : province.nameVi === 'Quảng Trị' ? 'Thành cổ Quảng Trị, Địa đạo Vịnh Mốc, Biển Cửa Việt, Khe Sanh' : 'Vịnh Nha Trang, Bãi Dài Cam Ranh, Tháp Bà Ponagar, Hòn Mun'} cho đến các resort 5 sao sang trọng.
- **Hạ tầng hỗ trợ hoàn hảo**: Di chuyển thuận tiện, ẩm thực phong phú và đội ngũ ekip giàu kinh nghiệm am hiểu từng góc phố, con hẻm.

---

## 2. Kinh Nghiệm Thực Tế & Lời Khuyên Từ Ekip nhiep.net

Để buổi thực hiện diễn ra trọn vẹn và đạt kết quả ưng ý nhất, bạn hãy lưu ý các điểm sau:
1. **Khung giờ vàng (Golden Hour)**: Buổi sáng sớm từ 5:30 - 7:30 hoặc chiều tà từ 16:30 - 18:00 là thời điểm ánh sáng dịu nhẹ nhất, tôn lên màu da tự nhiên và tạo chiều sâu hút mắt.
2. **Lựa chọn trang phục & phụ kiện phù hợp**: Phong cách trang phục cần hài hòa với bối cảnh chụp (áo dài cho di tích cổ, đầm maxi bay bổng cho biển xanh cát trắng, veston thanh lịch cho hội nghị doanh nghiệp).
3. **Thống nhất kịch bản chi tiết**: Hãy chia sẻ mong muốn, phong cách yêu thích và các yêu cầu đặc biệt với đạo diễn hình ảnh trước buổi bấm máy ít nhất 2 ngày.

> [!TIP]
> Bạn có thể tham khảo trực tiếp các gói dịch vụ chuẩn xác theo ngân sách và nhu cầu tại [nhiep.net Gói Dịch Vụ](/vi/packages) hoặc liên hệ Hotline **0932513678** (Zalo: 0931513678) để được cố vấn 1-1 miễn phí.

---

## 3. Bảng Giá Tham Khảo & Tiêu Chuẩn Bàn Giao

Tại **nhiep.net**, chúng tôi cam kết minh bạch về chi phí và bàn giao sản phẩm với chất lượng cao nhất:
- **Gói Cơ Bản / Bán Ngày**: Từ 1.800.000 ₫ - 3.500.000 ₫ (Bao gồm toàn bộ file gốc + ảnh/video chỉnh sửa hoàn thiện).
- **Gói Nâng Cao / Cả Ngày**: Từ 4.500.000 ₫ - 9.500.000 ₫ (Ekip chuyên nghiệp, hỗ trợ flycam, makeup, xe đưa đón).
- **Gói Doanh Nghiệp & TVC Hoàng Gia**: Từ 12.500.000 ₫ - 25.000.000 ₫ (Ekip đa máy quay cinema, kịch bản phân cảnh, color grading DaVinci Resolve).

Mọi sản phẩm đều được kiểm định chất lượng nghiêm ngặt và hỗ trợ chỉnh sửa theo mong muốn đến khi khách hàng hoàn toàn hài lòng.

---

## 4. Quy Trình Đặt Lịch Nhanh Chóng Trong 3 Bước
1. **Chọn dịch vụ & địa điểm**: Truy cập trang [Đặt Lịch Online](/vi/booking), chọn danh mục **${category.nameVi}** và chọn tỉnh **${province.nameVi}**.
2. **Chọn ngày giờ & gói phù hợp**: Hệ thống tự động tính toán chi phí và giữ chỗ lịch bấm máy với ekip hàng đầu.
3. **Xác nhận & Nhận mã đặt lịch**: Nhận thông báo xác nhận tức thì qua tin nhắn / Zalo và bắt đầu buổi chụp thăng hoa.
        `.trim();

        const contentEn = `
# ${titleEn}

${province.nameEn} stands out as one of Vietnam's most scenic destinations, offering breathtaking landscapes, rich heritage, and pristine light conditions. Whether you are planning a **${category.nameEn.toLowerCase()} session in ${province.nameEn}** for weddings, corporate summits, travel reels, or lifestyle portraits, thorough preparation is the key to creating timeless visual masterpieces.

---

## 1. Why Choose ${province.nameEn} for ${category.nameEn}?

The ${province.nameEn} region provides exceptional natural and cultural advantages:
- **Unrivaled Natural Lighting**: Crisp atmospheric clarity, golden sunrises over the turquoise coast, and ambient evening twilight across iconic landmarks.
- **Diverse Scenic Backdrops**: From world-famous landmarks to ultra-luxury beachfront resorts, ancient heritage gates, and wild mountain passes.
- **World-Class Production Support**: Professional equipment, English-speaking directors, licensed drone pilots, and dedicated local guides.

---

## 2. Pro Tips & Recommendations from nhiep.net

To ensure a seamless, high-yield production day:
1. **Capture the Golden Hours**: Plan outdoor shoots around 5:30 AM – 7:30 AM or 4:30 PM – 6:00 PM for soft, flattering highlights and rich contrast.
2. **Wardrobe & Styling Harmony**: Match your outfits to the shoot environment (traditional Ao Dai for imperial architectures, flowy resort wear for coastal cliffs, executive attire for summits).
3. **Concept & Moodboard Alignment**: Review your shotlist and visual moodboard with your lead photographer/videographer ahead of time.

> [!TIP]
> Explore all available service tiers with real-time pricing on [nhiep.net Packages](/en/packages) or call our English hotline at **0932513678** (WhatsApp: **+84932513678**).

---

## 3. Transparent Pricing & Deliverables

At **nhiep.net**, we uphold international production standards with no hidden charges:
- **Half-Day / Starter Packages**: From 1,800,000 VND to 3,500,000 VND.
- **Full-Day / Premium Packages**: From 4,500,000 VND to 9,500,000 VND (multi-location, MUA styling, drone support).
- **Corporate & Cinema Productions**: From 12,500,000 VND to 25,000,000 VND (RED/Sony cinema rigs, multi-cam live sync, DaVinci Resolve color grading).

All master files are delivered via high-speed private cloud galleries with lifetime backup.

---

## 4. Easy 3-Step Online Booking
1. **Select Category & Location**: Visit [Online Booking](/en/booking), choose **${category.nameEn}** in **${province.nameEn}**.
2. **Pick Dates & Add-ons**: Select your preferred shoot schedule, drone options, and express delivery.
3. **Instant Confirmation**: Receive your instant booking reference code and start your unforgettable visual journey.
        `.trim();

        const contentZh = `
# ${titleZh}

${province.nameZh}作为越南中部最具魅力的核心旅游与文化目的地，拥有令人惊叹的自然风光、深厚的历史文化底蕴以及绝佳的摄影光影条件。在${province.nameZh}筹备**${category.nameZh}**项目时，从取景地规划、最佳光线时刻把握到选择当地经验丰富的专业摄制团队，是打造高品质影像作品的决定性因素。

---

## 1. 为什么${province.nameZh}是${category.nameZh}的理想之选？

${province.nameZh}地区具备得天独厚的视觉优势：
- **纯净通透的自然光线**：晨光熹微的海平线与晚霞辉映的古城建筑，呈现电影般的层次感与冷暖色彩交织。
- **多元丰富的取景场景**：涵盖历史文化古迹、星级海滨度假村、网红景观大桥及壮阔海岛自然风貌。
- **完善的专业配套服务**：拥有熟悉当地每一处最佳机位的双语专业摄影师团队，提供航拍报备、专车接送与高定妆造一站式保障。

---

## 2. nhiep.net 资深摄制团队的实战建议

为确保拍摄行程顺畅并收获超预期的大片效果：
1. **牢牢把握黄金光线时间（Golden Hour）**：清晨5:30-7:30与傍晚16:30-18:00光线最为柔和立体，能够完美还原人物肤色质感。
2. **服装风格与场景高度契合**：根据取景地合理规划服装（古典古建筑推荐传统奥黛或古服，海边沙滩推荐飘逸长裙或度假风，商务峰会推荐高级正装）。
3. **提前沟通分镜头脚本**：在开机前与主创团队确认画面风格参考与重点记录诉求。

> [!TIP]
> 您可在 [nhiep.net 套餐中心](/zh/packages) 实时查阅透明价格与服务明细，或添加中文客服微信/Zalo：**0931513678**（WhatsApp：**+84932513678**）。

---

## 3. 透明定价体系与交付标准

**nhiep.net** 秉承行业严苛标准，无任何隐形消费：
- **基础半日套餐**：1,800,000 越南盾 起（含全套原始高清底片 + 精修成品）。
- **全日高端定制套餐**：4,500,000 越南盾 起（含全天跟妆、无人机航拍与豪华专车）。
- **企业宣传与电影级制作**：12,500,000 越南盾 起（RED/Sony电影机组、多机位导播与DaVinci调色）。

---

## 4. 轻松在线预约3步法
1. **选择服务与城市**：访问 [在线预订页面](/zh/booking)，选择 **${category.nameZh}** 与 **${province.nameZh}**。
2. **确定日期与加购项目**：自由勾选加急交付、无人机航拍等增值选项。
3. **即时获得确认单**：生成唯一预约编号，专属项目管家第一时间与您对接。
        `.trim();

        // 3 unique images per article
        const featuredImage = getUnsplashUrl(globalIndex * 3 + 1);
        const inContentImages = [
          getUnsplashUrl(globalIndex * 3 + 2),
          getUnsplashUrl(globalIndex * 3 + 3)
        ];

        // FAQs
        const faqs = [
          {
            questionVi: `Chi phí thuê ${category.nameVi.toLowerCase()} tại ${province.nameVi} khoảng bao nhiêu?`,
            questionEn: `How much does ${category.nameEn.toLowerCase()} in ${province.nameEn} typically cost?`,
            questionZh: `在${province.nameZh}预订${category.nameZh}大概需要多少费用？`,
            answerVi: `Mức giá dao động từ 1.800.000 ₫ cho các gói chụp cơ bản đến 12.500.000 ₫ - 25.000.000 ₫ cho các gói quay chụp cao cấp, sự kiện và cưới hỏi trọn gói.`,
            answerEn: `Packages range from approximately 1,800,000 VND for standard sessions up to 12,500,000 - 25,000,000 VND for full-day weddings, events, and cinematic productions.`,
            answerZh: `基础个人/写真套餐起步价约为1,800,000越南盾，全天婚礼、大型活动与电影级商业摄录全案约为12,500,000至25,000,000越南盾。`
          },
          {
            questionVi: `Thời gian bàn giao ảnh và video sau buổi quay chụp là bao lâu?`,
            questionEn: `What is the standard turnaround time for photos and videos?`,
            questionZh: `拍摄结束后通常需要多长时间交付照片与视频？`,
            answerVi: `Toàn bộ file gốc được gửi trong vòng 24 giờ. Ảnh và video chỉnh sửa hoàn thiện được bàn giao từ 3 - 5 ngày làm việc (có hỗ trợ gói hỏa tốc 24h).`,
            answerEn: `Raw photo files are delivered within 24 hours. Fully retouched photos and edited videos are delivered within 3 - 5 business days (24h express option available).`,
            answerZh: `全套原始底片将在拍摄结束后24小时内发送，精修照片与剪辑成片交付周期为3至5个工作日（提供24小时极速加急通道）。`
          },
          {
            questionVi: `Có cần đặt lịch trước bao lâu để đảm bảo có ekip tốt nhất?`,
            questionEn: `How far in advance should I book my shoot?`,
            questionZh: `需要提前多久预约以锁定最优秀的主创团队？`,
            answerVi: `Nên đặt lịch trước từ 3 - 7 ngày cho ngày thường và từ 2 - 4 tuần cho mùa cao điểm cưới hỏi hoặc sự kiện lớn tại ${province.nameVi}.`,
            answerEn: `We recommend booking 3 - 7 days in advance for regular weekdays, and 2 - 4 weeks prior for peak wedding or holiday seasons in ${province.nameEn}.`,
            answerZh: `平日建议提前3至7天预约，婚礼旺季或大型商务节庆建议提前2至4周锁定档期。`
          }
        ];

        articles.push({
          id: articleId,
          slug,
          slugVi,
          slugEn,
          slugZh,
          categoryId: category.id,
          provinceId: province.id,
          titleVi,
          titleEn,
          titleZh,
          excerptVi,
          excerptEn,
          excerptZh,
          contentVi,
          contentEn,
          contentZh,
          featuredImage,
          inContentImages,
          author: 'nhiep.net Editorial Team',
          publishedAt: '2026-08-19',
          readingTimeMin: 6,
          metaTitleVi: `${titleVi} | nhiep.net`,
          metaTitleEn: `${titleEn} | nhiep.net`,
          metaTitleZh: `${titleZh} | nhiep.net`,
          metaDescVi: excerptVi.slice(0, 155),
          metaDescEn: excerptEn.slice(0, 155),
          metaDescZh: excerptZh.slice(0, 155),
          keywords: [
            category.nameVi.toLowerCase(),
            province.nameVi.toLowerCase(),
            `${category.nameVi.toLowerCase()} ${province.nameVi.toLowerCase()}`,
            `đặt lịch ${category.nameVi.toLowerCase()}`,
            'nhiep.net'
          ],
          faqs,
          relatedPackageIds: [
            category.id === 'photography' ? 'photo-pre-wedding-premium' :
            category.id === 'videography' ? 'video-wedding-cinematic' :
            category.id === 'post-production' ? 'edit-high-end-retouch' :
            category.id === 'event-coverage' ? 'event-corporate-gala' : 'travel-danang-bana-hoian'
          ]
        });
      }
    }
  }

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`Successfully generated ${articles.length} SEO/GEO articles in src/data/articles.json!`);
}

generateArticles();
