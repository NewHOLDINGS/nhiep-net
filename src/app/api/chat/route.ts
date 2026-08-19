import { NextRequest, NextResponse } from 'next/server';
import { PACKAGES } from '@/data/packages';
import { PROVINCES } from '@/data/provinces';
import { CATEGORIES } from '@/data/categories';

export async function POST(req: NextRequest) {
  try {
    const { messages, locale = 'vi' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Messages array is required' }, { status: 400 });
    }

    const latestUserMsg = messages[messages.length - 1].content || '';
    const lowerQuery = latestUserMsg.toLowerCase();

    // RAG: Find matching packages based on query keywords
    const matchingPackages = PACKAGES.filter((pkg) => {
      const matchName = pkg.nameVi.toLowerCase().includes(lowerQuery) ||
                        pkg.nameEn.toLowerCase().includes(lowerQuery) ||
                        pkg.nameZh.toLowerCase().includes(lowerQuery);
      const matchCat = pkg.categoryId.toLowerCase().includes(lowerQuery) ||
                       (lowerQuery.includes('cưới') && pkg.tags.includes('Wedding')) ||
                       (lowerQuery.includes('wedding') && pkg.tags.includes('Wedding')) ||
                       (lowerQuery.includes('婚') && pkg.tags.includes('Wedding')) ||
                       (lowerQuery.includes('sự kiện') && pkg.categoryId === 'event-coverage') ||
                       (lowerQuery.includes('event') && pkg.categoryId === 'event-coverage') ||
                       (lowerQuery.includes('活动') && pkg.categoryId === 'event-coverage') ||
                       (lowerQuery.includes('áo dài') && pkg.tags.includes('Ao Dai')) ||
                       (lowerQuery.includes('奥黛') && pkg.tags.includes('Ao Dai')) ||
                       (lowerQuery.includes('du lịch') && pkg.categoryId === 'travel-photography') ||
                       (lowerQuery.includes('travel') && pkg.categoryId === 'travel-photography') ||
                       (lowerQuery.includes('旅拍') && pkg.categoryId === 'travel-photography') ||
                       (lowerQuery.includes('flycam') && (pkg.tags.includes('Flycam') || pkg.tags.includes('Drone'))) ||
                       (lowerQuery.includes('航拍') && (pkg.tags.includes('Flycam') || pkg.tags.includes('Drone'))) ||
                       (lowerQuery.includes('hậu kỳ') && pkg.categoryId === 'post-production') ||
                       (lowerQuery.includes('retouch') && pkg.categoryId === 'post-production');

      const matchProv = (lowerQuery.includes('đà nẵng') || lowerQuery.includes('danang') || lowerQuery.includes('岘港')) && pkg.provinces.includes('danang') ||
                        (lowerQuery.includes('huế') || lowerQuery.includes('hue') || lowerQuery.includes('顺化')) && pkg.provinces.includes('hue') ||
                        (lowerQuery.includes('quảng trị') || lowerQuery.includes('quang tri') || lowerQuery.includes('广治')) && pkg.provinces.includes('quangtri') ||
                        (lowerQuery.includes('nha trang') || lowerQuery.includes('khánh hòa') || lowerQuery.includes('khanh hoa') || lowerQuery.includes('芽庄') || lowerQuery.includes('庆和')) && pkg.provinces.includes('khanhhoa');

      return matchName || matchCat || matchProv;
    }).slice(0, 3);

    // If matching packages is empty, take 2 top featured
    const recommended = (matchingPackages.length > 0 ? matchingPackages : PACKAGES.filter(p => p.featured).slice(0, 2)).map(p => ({
      id: p.id,
      name: locale === 'zh' ? p.nameZh : locale === 'en' ? p.nameEn : p.nameVi,
      price: p.priceVndFormatted,
      category: p.categoryId,
      imageUrl: p.imageUrl,
      slug: p.slug
    }));

    // Check if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Build RAG context
      const knowledgeContext = `
nhiep.net Knowledge Base:
- Operating regions: Da Nang (Đà Nẵng), Thừa Thiên Huế, Quảng Trị, Khánh Hòa (Nha Trang / Cam Ranh).
- Hotline 24/7: 0932513678 (tel:0932513678)
- WhatsApp: +84932513678 (https://wa.me/84932513678)
- Zalo: 0931513678 (https://zalo.me/0931513678)
- Core Categories:
  1. Photography (Pre-wedding, Portraits, Ao Dai, Resort Architecture, Food, Family)
  2. Videography (4K Cinema Wedding Films, Corporate TVC 6K, Event Highlight, Travel Vlog, FPV Drone)
  3. Post-Production (High-End Retouching, DaVinci Resolve Color Grading, TikTok/Reels Viral Edits, 24h Express Turnaround)
  4. Event Coverage (Gala Dinners, International Summits, Beach Teambuilding, Grand Openings, Live-Photo delivery in 30 mins)
  5. Travel Photography (Escorted phototours in Ba Na Hills, Hoi An, Hue Citadel, Nha Trang Luxury Yachts, Cam Ranh Sand Dunes)

Matching Available Packages for this query:
${recommended.map(r => `- ${r.name}: ${r.price} (ID: ${r.id})`).join('\n')}
`;

      const systemPrompt = `You are the friendly, professional AI Booking Consultant for nhiep.net (Nền tảng đặt lịch quay chụp hàng đầu miền Trung Việt Nam).
Language rule: Detect and respond fluently in the customer's language (${locale.toUpperCase()}: Vietnamese, English, or Simplified Chinese).
Instructions:
1. Always stay on topic (nhiep.net's photography, videography, post-production, event coverage, and travel photo services in Da Nang, Hue, Quang Tri, Khanh Hoa).
2. Answer customer queries with warmth, expert production advice (e.g. golden hour light, outfit tips, gear), clear price ranges in VND, and recommend suitable packages.
3. Encourage the customer to book online at nhiep.net or contact Hotline/Zalo: 0932513678 / 0931513678.
4. Keep answers concise, beautiful, formatted in clean markdown bullet points.`;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\n${knowledgeContext}\n\nUser Question: ${latestUserMsg}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            return NextResponse.json({
              success: true,
              reply: aiText,
              recommendedPackages: recommended
            });
          }
        }
      } catch (geminiErr) {
        console.error('Gemini API request failed, falling back to local engine:', geminiErr);
      }
    }

    // Fallback Smart RAG Response generator when API key is not present or offline
    let replyText = '';
    if (locale === 'zh') {
      replyText = `您好！感谢您咨询 **nhiep.net**。针对您关注的拍摄需求，我们在岘港、顺化、广治及芽庄拥有丰富实战经验的资深摄制团队。\n\n📸 **为您推荐的专属高性价比方案：**\n` +
        recommended.map(r => `• **${r.name}**：标准报价 **${r.price}**\n  👉 [点击进入在线预约](/zh/booking?package=${r.id})`).join('\n') +
        `\n\n💡 **我们的服务优势：**\n- 交付全部原始高清底片，绝无隐形加价\n- 影棚级电影灯光与Sony/Canon专业器材\n- 支持24小时极速出片通道\n\n📞 **需要专人一对一顾问对接？**\n- 客服热线：[0932.513.678](tel:0932513678)\n- 微信/Zalo：**0931.513.678** | WhatsApp：**+84932513678**`;
    } else if (locale === 'en') {
      replyText = `Hello! Thank you for contacting **nhiep.net**. We are Central Vietnam’s premier photography & videography booking platform covering Da Nang, Hue, Quang Tri, and Nha Trang.\n\n📸 **Recommended packages for your inquiry:**\n` +
        recommended.map(r => `• **${r.name}**: **${r.price}**\n  👉 [Book this package online](/en/booking?package=${r.id})`).join('\n') +
        `\n\n✨ **Why Choose nhiep.net:**\n- All original RAW/high-res files included\n- Cinema-grade 4K equipment & English-fluent directors\n- Free local location advice & 24h rapid delivery options\n\n📞 **Need direct consultation?**\n- Hotline: [0932.513.678](tel:0932513678)\n- WhatsApp: [+84932513678](https://wa.me/84932513678) | Zalo: **0931.513.678**`;
    } else {
      replyText = `Chào bạn! Cảm ơn bạn đã liên hệ **nhiep.net** — Nền tảng quay chụp chuyên nghiệp hàng đầu tại Đà Nẵng, Huế, Quảng Trị và Khánh Hòa.\n\n📸 **Dưới đây là các gói dịch vụ tối ưu nhất theo nhu cầu của bạn:**\n` +
        recommended.map(r => `• **${r.name}**: Giá niêm yết **${r.price}**\n  👉 [Nhấp để đặt lịch giữ chỗ ngay](/vi/booking?package=${r.id})`).join('\n') +
        `\n\n✨ **Cam kết chất lượng từ nhiep.net:**\n- Trả 100% file ảnh gốc trong 24h, không phụ phí phát sinh\n- Ekip đạo diễn hình ảnh nhiệt tình, thiết bị Sony FX3 / A7R V / Flycam 4K\n- Hỗ trợ chỉnh sửa ảnh đến khi hoàn toàn hài lòng\n\n📞 **Cần tư vấn trực tiếp 1-1 ngay lập tức?**\n- Hotline 24/7: [0932.513.678](tel:0932513678)\n- Zalo: [0931.513.678](https://zalo.me/0931513678) | WhatsApp: **+84932513678**`;
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      recommendedPackages: recommended
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
