import { NextRequest, NextResponse } from 'next/server';
import { PACKAGES } from '@/data/packages';
import { PROVINCES } from '@/data/provinces';
import { CATEGORIES } from '@/data/categories';
import { appendChatMessageToSession } from '@/lib/storage';
import { ChatMessage, ChatAttachment, CustomPackageOption, AiScriptPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const {
      sessionId = `session_${Date.now()}`,
      messages,
      locale = 'vi',
      attachments = [],
      driveLink = '',
      customerInfo = {}
    } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Messages array is required' }, { status: 400 });
    }

    const latestUserMsg = messages[messages.length - 1].content || '';
    const lowerQuery = latestUserMsg.toLowerCase();

    // RAG: Find matching packages based on query keywords
    const matchingPackages = PACKAGES.filter((pkg) => {
      const matchName =
        pkg.nameVi.toLowerCase().includes(lowerQuery) ||
        pkg.nameEn.toLowerCase().includes(lowerQuery) ||
        pkg.nameZh.toLowerCase().includes(lowerQuery);
      const matchCat =
        pkg.categoryId.toLowerCase().includes(lowerQuery) ||
        (lowerQuery.includes('cưới') && pkg.tags.includes('Wedding')) ||
        (lowerQuery.includes('wedding') && pkg.tags.includes('Wedding')) ||
        (lowerQuery.includes('sự kiện') && pkg.categoryId === 'event-coverage') ||
        (lowerQuery.includes('event') && pkg.categoryId === 'event-coverage') ||
        (lowerQuery.includes('áo dài') && pkg.tags.includes('Ao Dai')) ||
        (lowerQuery.includes('du lịch') && pkg.categoryId === 'travel-photography') ||
        (lowerQuery.includes('flycam') && (pkg.tags.includes('Flycam') || pkg.tags.includes('Drone'))) ||
        (lowerQuery.includes('hậu kỳ') && pkg.categoryId === 'post-production') ||
        (lowerQuery.includes('tvc') && pkg.categoryId === 'videography') ||
        (lowerQuery.includes('quảng cáo') && pkg.categoryId === 'videography');

      const matchProv =
        ((lowerQuery.includes('đà nẵng') || lowerQuery.includes('danang')) && pkg.provinces.includes('danang')) ||
        ((lowerQuery.includes('huế') || lowerQuery.includes('hue')) && pkg.provinces.includes('hue')) ||
        ((lowerQuery.includes('quảng trị') || lowerQuery.includes('quang tri')) && pkg.provinces.includes('quangtri')) ||
        ((lowerQuery.includes('nha trang') || lowerQuery.includes('khánh hòa')) && pkg.provinces.includes('khanhhoa'));

      return matchName || matchCat || matchProv;
    }).slice(0, 3);

    // Fallback packages if no direct match
    const recommended = (matchingPackages.length > 0 ? matchingPackages : PACKAGES.filter((p) => p.featured).slice(0, 2)).map((p) => ({
      id: p.id,
      name: locale === 'zh' ? p.nameZh : locale === 'en' ? p.nameEn : p.nameVi,
      price: p.priceVndFormatted,
      category: p.categoryId,
      imageUrl: p.imageUrl,
      slug: p.slug
    }));

    // Build dynamic custom packages tailored to query and scale
    const isBigEvent = lowerQuery.includes('sự kiện') || lowerQuery.includes('hội nghị') || lowerQuery.includes('gala') || lowerQuery.includes('tvc') || lowerQuery.includes('khai trương');
    const isWedding = lowerQuery.includes('cưới') || lowerQuery.includes('wedding') || lowerQuery.includes('tiệc cưới') || lowerQuery.includes('pre-wedding');

    const customPackages: CustomPackageOption[] = [
      {
        id: 'cust-1-camera',
        tier: 'Gói Tiết Kiệm (1 Máy)',
        name: isWedding ? 'Gói Phóng Sự Cưới Basic 1 Máy' : isBigEvent ? 'Gói Sự Kiện Standard 1 Máy' : 'Gói Quay Chụp Cá Nhân Linh Hoạt',
        cameraCount: '01 Máy quay/chụp Sony 4K Full-frame',
        crewDetails: '01 Chuyên viên quay/chụp chính + Bộ mic không dây + Đèn LED On-camera',
        gear: 'Sony A7 IV / FX3 + Ống kính G-Master 24-70mm f/2.8',
        deliverables: [
          'Toàn bộ file gốc độ phân giải cao',
          'Video Highlight 2-3 phút hoặc 40 ảnh chỉnh sửa chi tiết',
          'Bàn giao online trong 48h'
        ],
        estimatedPriceVnd: 3500000,
        estimatedPriceVndFormatted: '3.500.000 ₫',
        highlights: 'Phù hợp không gian nhỏ, ngân sách tiết kiệm, bắt trọn diễn biến chính.'
      },
      {
        id: 'cust-2-cameras',
        tier: 'Gói Tiêu Chuẩn (2 Máy - Đề xuất)',
        name: isWedding ? 'Gói Phóng Sự Cưới Cinema 2 Máy' : isBigEvent ? 'Gói Sự Kiện Chuyên Nghiệp 2 Máy' : 'Gói Thương Mại Tiêu Chuẩn',
        cameraCount: '02 Máy (01 Máy quay 4K Cinema + 01 Máy chụp phóng sự)',
        crewDetails: '02 Chuyên viên giàu kinh nghiệm + Đạo diễn hiện trường + Hệ thống âm thanh Wireless',
        gear: 'Sony FX3 Cinema + Sony A7R V + Hệ thống Gimbal Ronin RS3 Pro',
        deliverables: [
          'Trả 100% file gốc RAW/4K',
          '01 Video Highlight điện ảnh 4-6 phút 4K',
          '60-80 ảnh retouch cao cấp da & màu sắc',
          'Giao file hỏa tốc trong 24h'
        ],
        estimatedPriceVnd: 6800000,
        estimatedPriceVndFormatted: '6.800.000 ₫',
        highlights: 'Đa góc máy toàn cảnh và cận cảnh cảm xúc, đầy đủ cả hình ảnh lẫn video clip.'
      },
      {
        id: 'cust-3-cameras-drone',
        tier: 'Gói VIP Toàn Diện (3 Máy + Flycam)',
        name: isWedding ? 'Gói Đám Cưới Hoàng Gia 3 Máy + Flycam 5.1K' : isBigEvent ? 'Gói Sự Kiện & TVC Summit 3 Máy + Drone' : 'Gói Sản Xuất Điện Ảnh Trọn Gói',
        cameraCount: '03 Máy quay chụp + 01 Flycam DJI Mavic 3 Pro 5.1K',
        crewDetails: '03 Quay/chụp chính + 01 Phi công Flycam + 01 Đạo diễn ánh sáng/âm thanh',
        gear: '2x Sony FX3 Cinema + Sony A7R V + DJI Mavic 3 Pro + Đèn Aputure Studio',
        deliverables: [
          'Toàn bộ file gốc + Video Teaser 60s cho TikTok/Reels trong 12h',
          '01 Phim tài liệu/Highlight 8-12 phút chuẩn 4K Cinema',
          '120+ ảnh Master Retouch da & màu DaVinci Resolve',
          'Tặng 01 Photobook cao cấp 30x30cm hoặc Live-Photo nhận ảnh tức thì'
        ],
        estimatedPriceVnd: 12500000,
        estimatedPriceVndFormatted: '12.500.000 ₫',
        highlights: 'Quy mô đỉnh cao, góc quay trên không choáng ngợp, phục vụ sự kiện & đám cưới lớn.'
      }
    ];

    // Script plan structure
    const scriptPlan: AiScriptPlan = {
      conceptTitle: isWedding
        ? 'Kịch Bản Phóng Sự Cưới Nghệ Thuật Cinema & Cảm Xúc'
        : isBigEvent
        ? 'Kịch Bản Phim Sự Kiện & Truyền Thông Thương Hiệu Đỉnh Cao'
        : 'Kịch Bản Sản Xuất Hình Ảnh & Video Theo Yêu Cầu',
      summary: `Dựa trên dữ liệu phân tích ${attachments.length > 0 ? `và ${attachments.length} tư liệu đính kèm` : ''} ${driveLink ? `(Link Drive: ${driveLink})` : ''}, nhiep.net đã xây dựng phương án sản xuất tối ưu nhất cho bạn.`,
      cameraCrewProposal: {
        videoCameras: isBigEvent ? '2 - 3 Máy quay Sony FX3 4K 10-bit' : '1 - 2 Máy quay Cinema',
        photoCameras: '1 Máy chụp Sony A7R V 61MP bắt trọn khoảnh khắc',
        drones: isBigEvent || isWedding ? '1 Flycam 5.1K quay toàn cảnh địa điểm/resort' : 'Tùy chọn bổ sung',
        directors: '1 Đạo diễn hình ảnh & điều phối âm thanh',
        lightingAndAudio: 'Hệ thống mic thu âm không dây Rode/Sennheiser & Đèn studio Aputure',
        recommendedTotalCrew: isBigEvent ? '3 - 5 Nhân sự' : '2 - 3 Nhân sự'
      },
      timelineBreakdown: [
        {
          scene: 'Phân cảnh 1: Chuẩn bị & Không gian (Establishing Shots)',
          time: 'Trước sự kiện 1 - 2 giờ',
          description: 'Quay chụp toàn cảnh kiến trúc resort/khách sạn, chi tiết trang trí, backdrop, khoảnh khắc trang điểm và trang phục.',
          recommendedGear: 'Ống kính góc rộng 16-35mm + Gimbal chống rung'
        },
        {
          scene: 'Phân cảnh 2: Diễn biến chính (The Main Ceremony / Event)',
          time: 'Thời lượng sự kiện',
          description: 'Góc máy chính quay toàn cảnh sân khấu, máy phụ bắt cận biểu cảm, nụ cười, tràng pháo tay và khoảnh khắc xúc động.',
          recommendedGear: 'Ống kính chân dung 85mm f/1.4 + 70-200mm tele'
        },
        {
          scene: 'Phân cảnh 3: Toàn cảnh trên không & Bế mạc (Aerial & Finale)',
          time: 'Thời điểm vàng (Golden Hour / Gala)',
          description: 'Flycam cất cánh ghi lại quy mô hoành tráng, tiệc chúc mừng, nâng ly và các hoạt động tương tác.',
          recommendedGear: 'Flycam DJI 5.1K + Đèn LED Fill-light'
        }
      ],
      customPackages
    };

    // Save user message to database
    const userChatMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: latestUserMsg,
      attachments,
      driveLink: driveLink || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    appendChatMessageToSession(sessionId, userChatMsg, {
      locale: locale as any,
      customerInfo,
      filesCount: attachments.length,
      driveLinksCount: driveLink ? 1 : 0
    });

    // Check Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = '';

    if (apiKey) {
      const knowledgeContext = `
nhiep.net Knowledge Base:
- Operating regions: Da Nang (Đà Nẵng), Thừa Thiên Huế, Quảng Trị, Khánh Hòa (Nha Trang / Cam Ranh).
- Address: 522 Tôn Đức Thắng, Phường Hoà Khánh, TP. Đà Nẵng
- Hotline 24/7 & Zalo: 0932513678 (Chuyên viên tư vấn & tiếp nhận chốt đơn)
- Website: nhiep.net
- Attachments / Files from customer: ${attachments.length > 0 ? attachments.map((a: any) => `${a.type.toUpperCase()}: ${a.name}`).join(', ') : 'None'}
- Drive link: ${driveLink || 'None'}
`;

      const systemPrompt = `You are the Expert AI Director & Chief Consultant of nhiep.net (Hệ thống sản xuất hình ảnh & video hàng đầu miền Trung Việt Nam).
Language: Detect and answer fluently in ${locale.toUpperCase()} (Vietnamese, English, or Chinese).

Tasks:
1. Analyze user requirements and any attached files/drive links in detail.
2. Formulate a professional production shooting script (Kịch bản phân cảnh, concept ý tưởng).
3. Recommend optimal camera gear & crew size (Số lượng máy quay 4K, máy chụp Sony A7R V, Flycam, đạo diễn).
4. Provide structured package options (Gói 1 máy, Gói 2 máy, Gói VIP 3 máy + Flycam) with clear price estimates in VND.
5. Guide the customer to leave their Name & Phone (with Zalo) so that the system will automatically forward the full order & script to Zalo 0932513678 for instant confirmation.
6. Keep the response friendly, inspiring, cinematic, formatted with clean markdown bullet points and emojis.`;

      try {
        // Prepare contents with user text and multimodal attachments if images exist
        const parts: any[] = [
          { text: `${systemPrompt}\n\n${knowledgeContext}\n\nCustomer Prompt: ${latestUserMsg}\n${driveLink ? `Google Drive Link: ${driveLink}\n` : ''}` }
        ];

        // If user attached base64 images, attach to Gemini request
        for (const att of attachments) {
          if (att.type === 'image' && att.dataUrl && att.dataUrl.startsWith('data:image')) {
            const base64Data = att.dataUrl.split(',')[1];
            if (base64Data) {
              parts.push({
                inline_data: {
                  mime_type: att.mimeType || 'image/jpeg',
                  data: base64Data
                }
              });
            }
          }
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            aiResponseText = candidateText;
          }
        }
      } catch (geminiErr) {
        console.error('Gemini API call failed, falling back to local cinematic engine:', geminiErr);
      }
    }

    // Fallback response if Gemini offline
    if (!aiResponseText) {
      if (locale === 'zh') {
        aiResponseText = `您好！**nhiep.net** AI 摄制总监已为您完成初步拍摄方案与分镜策划：\n\n🎬 **专属策划剧本与建议：**\n- **机位配置推荐**：${scriptPlan.cameraCrewProposal.videoCameras} + ${scriptPlan.cameraCrewProposal.photoCameras} + ${scriptPlan.cameraCrewProposal.drones}\n- **交付保障**：赠送全部高清底片，支持 24 小时极速出片。\n\n📸 **可供选择的定制执行套餐：**\n${customPackages.map((p) => `• **${p.name}**（${p.cameraCount}）：**${p.estimatedPriceVndFormatted}**\n  _${p.highlights}_`).join('\n\n')}\n\n👉 您可直接在下方填写**姓名与 Zalo/微信电话**，系统将自动把完整拍摄方案与预订单同步至顾问专线 **0932513678**。`;
      } else if (locale === 'en') {
        aiResponseText = `Hello! **nhiep.net** AI Production Director has analyzed your request and prepared the tailored shooting script & crew configuration:\n\n🎬 **Production Concept & Camera Breakdown:**\n- **Recommended Crew**: ${scriptPlan.cameraCrewProposal.videoCameras}, ${scriptPlan.cameraCrewProposal.photoCameras}, ${scriptPlan.cameraCrewProposal.drones}\n- **Timeline**: Structured coverage from preparations, core highlights to scenic aerial angles.\n\n📸 **Flexible Production Package Options:**\n${customPackages.map((p) => `• **${p.name}** (${p.cameraCount}): **${p.estimatedPriceVndFormatted}**\n  _${p.highlights}_`).join('\n\n')}\n\n👉 Please fill in your **Name & Zalo/WhatsApp Phone** below to automatically send this order summary to our senior coordinator at **0932513678**.`;
      } else {
        aiResponseText = `Chào bạn! Đạo diễn AI của **nhiep.net** đã tiếp nhận thông tin ${attachments.length > 0 ? `và ${attachments.length} tư liệu đính kèm ` : ''}${driveLink ? `(Link Drive: ${driveLink}) ` : ''}để lập kịch bản và phân bổ ekip tối ưu:\n\n🎬 **Kịch Bản & Phương Án Máy Quay Đề Xuất:**\n- **Số lượng máy & nhân sự**: ${scriptPlan.cameraCrewProposal.videoCameras}, ${scriptPlan.cameraCrewProposal.photoCameras}, ${scriptPlan.cameraCrewProposal.drones}.\n- **Phân cảnh thực hiện**: Bố trí nhịp nhàng từ toàn cảnh không gian, cảm xúc trung tâm đến những thước phim drone trên không choáng ngợp.\n\n📦 **Các tùy chọn gói linh hoạt theo số lượng máy để bạn dễ dàng lựa chọn:**\n${customPackages.map((p) => `• **${p.name}** (${p.cameraCount}): **${p.estimatedPriceVndFormatted}**\n  _${p.highlights}_`).join('\n\n')}\n\n👉 Bạn hãy nhập **Tên và Số điện thoại (có Zalo)** bên dưới để hệ thống tự động gửi kịch bản và thông tin đơn hàng này qua **Zalo 0932513678** cho chuyên viên tư vấn giữ lịch ngay!`;
      }
    }

    // Save assistant message to database
    const assistantChatMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      content: aiResponseText,
      recommendedPackages: recommended,
      scriptPlan,
      customPackages,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    appendChatMessageToSession(sessionId, assistantChatMsg, {
      locale: locale as any,
      customerInfo,
      scriptSummary: scriptPlan.conceptTitle
    });

    return NextResponse.json({
      success: true,
      sessionId,
      reply: aiResponseText,
      scriptPlan,
      customPackages,
      recommendedPackages: recommended
    });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
