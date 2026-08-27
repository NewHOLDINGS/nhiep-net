import { NextRequest, NextResponse } from 'next/server';
import { PACKAGES } from '@/data/packages';
import {
  ChatMessage,
  ChatSession,
  AiScriptPlan,
  CustomPackageOption,
  ChatAttachment,
  CustomBuilderConfig
} from '@/types';
import { appendChatMessageToSession } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId = `ses_${Date.now()}`,
      messages = [],
      locale = 'vi',
      customerInfo = {},
      attachments = [] as ChatAttachment[],
      driveLink = '',
      customConfig = null as CustomBuilderConfig | null
    } = body;

    const latestUserMsg =
      messages.length > 0 ? messages[messages.length - 1].content : '';
    const lowerQuery = (latestUserMsg || '').toLowerCase();

    // Contextual matching from standard packages
    const recommended = PACKAGES.filter((pkg) => {
      const matchCat =
        lowerQuery.includes('ảnh') || lowerQuery.includes('chụp')
          ? pkg.categoryId === 'photography'
          : lowerQuery.includes('quay') || lowerQuery.includes('video') || lowerQuery.includes('phim')
          ? pkg.categoryId === 'videography'
          : lowerQuery.includes('sự kiện') || lowerQuery.includes('event')
          ? pkg.categoryId === 'event-coverage'
          : lowerQuery.includes('du lịch') || lowerQuery.includes('tour')
          ? pkg.categoryId === 'travel-photography'
          : true;
      return matchCat;
    })
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        name: locale === 'zh' ? p.nameZh : locale === 'en' ? p.nameEn : p.nameVi,
        price: p.priceVndFormatted,
        category: p.categoryId,
        imageUrl: p.imageUrl
      }));

    // Build Attachment Text Content for deep AI analysis (.xlsx, .ods, .html, .csv, .pptx, .docx, images, etc.)
    let attachmentDetails = '';
    if (attachments.length > 0) {
      attachmentDetails = attachments
        .map((a: ChatAttachment, idx: number) => {
          const typeLabel =
            a.type === 'image'
              ? 'Hình ảnh mẫu / Moodboard'
              : a.type === 'audio'
              ? 'Tệp ghi âm giọng nói'
              : a.type === 'drive'
              ? 'Google Drive Folder'
              : `Tài liệu / Bảng tính (${a.fileExtension?.toUpperCase() || 'DOC'})`;

          let textSnippet = '';
          if (a.textContent) {
            textSnippet = `\nNỘI DUNG ĐỌC TỰ ĐỘNG TỪ FILE:\n${a.textContent.slice(0, 15000)}\n`;
          }

          return `[TỆP ĐÍNH KÈM ${idx + 1}]: ${a.name} (${typeLabel}, Size: ${a.size || 'N/A'})${textSnippet}`;
        })
        .join('\n\n');
    }

    // Save initial user message to storage
    const userChatMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: latestUserMsg,
      attachments: attachments.length > 0 ? attachments : undefined,
      driveLink: driveLink || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    appendChatMessageToSession(sessionId, userChatMsg, {
      locale: locale as any,
      customerInfo,
      filesCount: attachments.length,
      driveLinksCount: driveLink ? 1 : 0
    });

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = '';
    let parsedScriptPlan: AiScriptPlan | null = null;
    let parsedCustomPackages: CustomPackageOption[] | null = null;

    if (apiKey) {
      const knowledgeContext = `
nhiep.net Knowledge Base & Operations:
- Operating regions: Đà Nẵng, Thừa Thiên Huế, Quảng Trị, Khánh Hòa (Nha Trang / Cam Ranh / Hội An).
- Hotline 24/7 & Zalo Đặt Lịch: 0943391369 (Chuyên viên tư vấn & tiếp nhận chốt đơn)
- Tài khoản ngân hàng VietQR: MB BANK 89052667799, Chủ tài khoản: NGUYEN XUAN TOI.
- Hệ thống thiết bị cao cấp: Sony FX3 Cinema, Sony FX6, Sony A7R V (61MP 8K), Sony A7 IV, Flycam DJI Mavic 3 Pro / Inspire 5.1K, Gimbal DJI Ronin RS3 Pro, Hệ thống micro không dây Sennheiser / Rode Wireless Pro, Đèn Studio Aputure 600d / Nanlite Forza.
- Các mức tiêu chuẩn hậu kỳ: Full HD 1080p chuẩn mạng xã hội, 4K Cinema 10-bit chỉnh màu DaVinci Resolve, 6K Master RAW cho TVC thương mại.
- Available matching packages: ${recommended.map((r) => `${r.name} (${r.price})`).join(', ')}
`;

      const promptInstructions = `You are the Senior AI Production Director of nhiep.net (Hệ thống sản xuất hình ảnh & video chuyên nghiệp miền Trung).
Language: Respond fluently in ${locale.toUpperCase()} (Vietnamese, English, or Chinese).

CRITICAL INSTRUCTIONS TO AVOID GENERIC RESPONSES:
1. DEEPLY ANALYZE the customer's actual input, specific context, and all attached files (.xlsx, .ods, .html, .csv, .pptx, .docx, word, pdf, images, voice notes, drive link).
2. DO NOT output repetitive generic canned responses. Tailor the advice specifically to the user's event type, scale, timeline, style, and budget.
3. Recommend exact equipment and personnel breakdown tailored to this project (e.g. số thợ quay Gimbal Cinema, số thợ chụp ảnh, số flycam, chất lượng dựng Full HD hay 4K Cinema DaVinci Resolve, hệ thống âm thanh/ánh sáng).
4. Provide 3 customized flexible package options with exact estimated VND prices (Gói Tiết Kiệm, Gói Tiêu Chuẩn, Gói VIP Toàn Diện).
5. In addition to your detailed markdown consultation response, you MUST provide a JSON block at the very end enclosed in \`\`\`json ... \`\`\` with this exact schema:
{
  "conceptTitle": "Tên kịch bản chi tiết theo dự án cụ thể của khách",
  "summary": "Tóm tắt phân tích riêng cho yêu cầu này",
  "cameraCrewProposal": {
    "videoCameras": "Mô tả số lượng máy quay gimbal cinema",
    "photoCameras": "Mô tả số lượng thợ chụp",
    "drones": "Mô tả flycam",
    "directors": "Mô tả đạo diễn/điều phối",
    "lightingAndAudio": "Mô tả âm thanh và ánh sáng",
    "recommendedTotalCrew": "Tổng số nhân sự đề xuất"
  },
  "timelineBreakdown": [
    { "scene": "Phân cảnh 1", "time": "Mốc thời gian", "description": "Nội dung chi tiết", "recommendedGear": "Thiết bị" },
    { "scene": "Phân cảnh 2", "time": "Mốc thời gian", "description": "Nội dung chi tiết", "recommendedGear": "Thiết bị" },
    { "scene": "Phân cảnh 3", "time": "Mốc thời gian", "description": "Nội dung chi tiết", "recommendedGear": "Thiết bị" }
  ],
  "customPackages": [
    {
      "id": "pkg-budget",
      "tier": "Gói Tiết Kiệm (Phù hợp ngân sách nhỏ)",
      "name": "Tên gói theo dự án",
      "cameraCount": "Cấu hình máy (ví dụ: 1 Gimbal + 1 Máy chụp)",
      "crewDetails": "Chi tiết nhân sự",
      "gear": "Thiết bị cụ thể",
      "deliverables": ["Sản phẩm 1", "Sản phẩm 2"],
      "estimatedPriceVnd": 3800000,
      "estimatedPriceVndFormatted": "3.800.000 ₫",
      "highlights": "Điểm nổi bật"
    },
    {
      "id": "pkg-standard",
      "tier": "Gói Tiêu Chuẩn (Khuyên dùng)",
      "name": "Tên gói tiêu chuẩn",
      "cameraCount": "Cấu hình máy (ví dụ: 2 Gimbal + 2 Máy chụp + 1 Flycam)",
      "crewDetails": "Chi tiết nhân sự",
      "gear": "Thiết bị cụ thể",
      "deliverables": ["Sản phẩm 1", "Sản phẩm 2", "Sản phẩm 3"],
      "estimatedPriceVnd": 7500000,
      "estimatedPriceVndFormatted": "7.500.000 ₫",
      "highlights": "Điểm nổi bật"
    },
    {
      "id": "pkg-vip",
      "tier": "Gói VIP Toàn Diện (Cao cấp)",
      "name": "Tên gói VIP",
      "cameraCount": "Cấu hình máy + Flycam 5.1K Cinema",
      "crewDetails": "Chi tiết nhân sự",
      "gear": "Thiết bị cụ thể",
      "deliverables": ["Sản phẩm 1", "Sản phẩm 2", "Sản phẩm 3", "Sản phẩm 4"],
      "estimatedPriceVnd": 13500000,
      "estimatedPriceVndFormatted": "13.500.000 ₫",
      "highlights": "Điểm nổi bật"
    }
  ]
}
`;

      const promptPayload = `
${knowledgeContext}

Customer Project Details:
- Current Customer Query: ${latestUserMsg}
- Google Drive Link: ${driveLink || 'None'}
- Attached Files Content & Spreadsheets/Documents/Presentations:
${attachmentDetails || 'No files attached'}
${customConfig ? `- Customer Manual Customizer Configuration: ${JSON.stringify(customConfig)}` : ''}

Please analyze this specific customer request deeply, formulate the production script, recommend equipment and crew, and output the response and the json structure.`;

      const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];

      for (const modelName of candidateModels) {
        try {
          const parts: any[] = [
            { text: `${promptInstructions}\n\n${promptPayload}` }
          ];

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
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 3000
                }
              })
            }
          );

          if (response.ok) {
            const data = await response.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              const jsonMatch = candidateText.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
              if (jsonMatch && jsonMatch[1]) {
                try {
                  const parsed = JSON.parse(jsonMatch[1]);
                  if (parsed.conceptTitle && parsed.cameraCrewProposal) {
                    parsedScriptPlan = {
                      conceptTitle: parsed.conceptTitle,
                      summary: parsed.summary || '',
                      cameraCrewProposal: parsed.cameraCrewProposal,
                      timelineBreakdown: parsed.timelineBreakdown || [],
                      customPackages: parsed.customPackages || []
                    };
                    parsedCustomPackages = parsed.customPackages || null;
                  }
                } catch (parseErr) {
                  console.warn('JSON parse error from Gemini output:', parseErr);
                }
              }

              aiResponseText = candidateText.replace(/\`\`\`json\s*[\s\S]*?\s*\`\`\`/, '').trim();
              break;
            }
          }
        } catch (callErr) {
          console.warn(`Gemini call error on ${modelName}:`, callErr);
        }
      }
    }

    if (!parsedScriptPlan) {
      const isBigEvent =
        lowerQuery.includes('sự kiện') ||
        lowerQuery.includes('hội nghị') ||
        lowerQuery.includes('gala') ||
        lowerQuery.includes('tvc') ||
        lowerQuery.includes('khai trương') ||
        lowerQuery.includes('event');
      const isWedding =
        lowerQuery.includes('cưới') ||
        lowerQuery.includes('wedding') ||
        lowerQuery.includes('tiệc cưới') ||
        lowerQuery.includes('pre-wedding');
      const isAoDai =
        lowerQuery.includes('áo dài') ||
        lowerQuery.includes('cổ phục') ||
        lowerQuery.includes('di sản');
      const isTravel =
        lowerQuery.includes('du lịch') ||
        lowerQuery.includes('bà nà') ||
        lowerQuery.includes('hội an') ||
        lowerQuery.includes('tour');

      let conceptTitle = 'Kịch Bản Sản Xuất Hình Ảnh & Video Theo Yêu Cầu Riêng';
      if (isWedding) conceptTitle = 'Kịch Bản Phóng Sự Cưới Nghệ Thuật Cinema & Bắt Trọn Khoảnh Khắc';
      else if (isBigEvent) conceptTitle = 'Kịch Bản Phim Sự Kiện, Hội Nghị & TVC Truyền Thông Thương Hiệu';
      else if (isAoDai) conceptTitle = 'Kịch Bản Chụp Ảnh Cổ Phục & Áo Dài Di Sản Miền Trung';
      else if (isTravel) conceptTitle = 'Kịch Bản Phototour Du Lịch & Nghỉ Dưỡng Cao Cấp';

      let customTiers: CustomPackageOption[] = [];
      if (
        customConfig &&
        (customConfig.gimbalOperators > 0 || customConfig.photographers > 0 || customConfig.drones > 0)
      ) {
        customTiers.push({
          id: 'pkg-user-custom',
          tier: 'Cấu Hình Tùy Chọn Riêng Của Bạn',
          name: `Gói Tự Chọn: ${customConfig.gimbalOperators} Gimbal + ${customConfig.photographers} Chụp + ${customConfig.drones} Flycam`,
          cameraCount: `${customConfig.gimbalOperators} Máy quay + ${customConfig.photographers} Máy chụp + ${customConfig.drones} Flycam`,
          crewDetails: `${customConfig.gimbalOperators + customConfig.photographers + (customConfig.drones > 0 ? 1 : 0)} Nhân sự vận hành`,
          gear: 'Sony FX3 Cinema 4K, Sony A7R V 61MP, Flycam DJI, Gimbal Ronin RS3 Pro',
          deliverables: [
            `Video hoàn thiện chuẩn ${customConfig.editingQuality.toUpperCase()}`,
            'Toàn bộ file gốc chất lượng cao',
            customConfig.express24h ? 'Nhận sản phẩm hỏa tốc trong 24h' : 'Bàn giao đúng tiến độ 3-5 ngày',
            customConfig.luxuryPhotobook ? '01 Album Photobook cao cấp 30x30cm' : 'Bộ ảnh đã blend màu nghệ thuật'
          ],
          estimatedPriceVnd: customConfig.totalVnd,
          estimatedPriceVndFormatted: `${customConfig.totalVnd.toLocaleString('vi-VN')} ₫`,
          highlights: 'Đúng theo bảng chọn thiết bị và ngân sách bạn vừa tùy biến'
        });
      }

      parsedCustomPackages = [
        ...customTiers,
        {
          id: 'pkg-1',
          tier: 'Gói Tiết Kiệm (Ngân Sách Tinh Gọn)',
          name: isWedding ? 'Phóng Sự Cưới Essential' : isBigEvent ? 'Ghi Hình Sự Kiện Cơ Bản' : 'Gói Quay Chụp Tiết Kiệm',
          cameraCount: isBigEvent ? '1 Gimbal 4K + 1 Thợ chụp' : '1 Thợ quay Gimbal hoặc 1 Thợ chụp',
          crewDetails: '1 - 2 Nhân sự kỹ thuật',
          gear: 'Sony A7 IV + Gimbal DJI + Mic thu âm Rode Wireless Pro',
          deliverables: [
            '01 Video Highlight Full HD / 4K (3-5 phút)',
            'Toàn bộ file ảnh gốc + 50 ảnh chỉnh màu DaVinci',
            'Bàn giao link Drive tốc độ cao'
          ],
          estimatedPriceVnd: 3800000,
          estimatedPriceVndFormatted: '3.800.000 ₫',
          highlights: 'Chi phí tối ưu, đảm bảo độ nét và khoảnh khắc đẹp'
        },
        {
          id: 'pkg-2',
          tier: 'Gói Tiêu Chuẩn (Khuyên Dùng - Tối Ưu Nhất)',
          name: isWedding ? 'Phóng Sự Cưới Cinema Premier' : isBigEvent ? 'Phim Sự Kiện & Hội Nghị Đa Góc Máy' : 'Gói Sản Xuất Toàn Diện',
          cameraCount: '2 Máy quay Gimbal Cinema + 1-2 Thợ chụp + Tùy chọn Flycam',
          crewDetails: '3 - 4 Nhân sự (2 Quay + 1 Chụp + 1 Kỹ thuật)',
          gear: 'Sony FX3 Cinema Line + Sony A7R V + Hệ thống mic Sennheiser + Đèn Aputure',
          deliverables: [
            '01 Phim Teaser 4K Cinema + 01 Phim tài liệu Recap dài',
            'Toàn bộ file gốc RAW + 150-300 ảnh chỉnh màu chuyên sâu',
            'Quay 4K 10-bit màu điện ảnh DaVinci Resolve',
            'Hỗ trợ flycam toàn cảnh địa điểm'
          ],
          estimatedPriceVnd: 7800000,
          estimatedPriceVndFormatted: '7.800.000 ₫',
          highlights: 'Đa góc máy bắt trọn mọi cảm xúc, âm thanh ánh sáng chuyên nghiệp'
        },
        {
          id: 'pkg-3',
          tier: 'Gói VIP Toàn Diện (Master Cinema)',
          name: isWedding ? 'Đại Tiệc Cưới Masterpiece 4K' : isBigEvent ? 'TVC & Phim Tài Liệu Thương Hiệu 4K/6K' : 'Gói VIP Masterpiece',
          cameraCount: '3 Máy quay FX3/FX6 + 2 Thợ chụp A7R V + 1 Flycam 5.1K',
          crewDetails: '5 - 6 Nhân sự (Đạo diễn hình ảnh, 3 Quay, 2 Chụp, 1 Flycam pilot)',
          gear: 'Sony FX6 Cinema RAW + Sony FX3 + Flycam DJI Mavic 3 Pro 5.1K + Aputure 600d Pro',
          deliverables: [
            '01 Teaser 4K triệu view + 01 Phim điện ảnh 4K Master',
            'Toàn bộ ảnh gốc + 100% ảnh retouch nghệ thuật',
            'Chỉnh màu DaVinci Resolve Studio chuẩn rạp chiếu',
            '01 Album Photobook cao cấp 30x30cm + USB pha lê cao cấp',
            'Hậu kỳ ưu tiên hỏa tốc trong 48h'
          ],
          estimatedPriceVnd: 14500000,
          estimatedPriceVndFormatted: '14.500.000 ₫',
          highlights: 'Đẳng cấp điện ảnh đỉnh cao, ekip đạo diễn điều phối toàn diện'
        }
      ].slice(0, 3);

      const videoCrew =
        customConfig?.gimbalOperators !== undefined
          ? `${customConfig.gimbalOperators} Thợ quay Gimbal Cinema`
          : isBigEvent
          ? '2 - 3 Thợ quay Gimbal 4K Cinema'
          : '1 - 2 Thợ quay Gimbal Cinema';

      const photoCrew =
        customConfig?.photographers !== undefined
          ? `${customConfig.photographers} Thợ chụp Sony A7R V`
          : '1 - 2 Thợ chụp Sony A7R V 61MP bắt trọn khoảnh khắc';

      const droneCrew =
        customConfig?.drones !== undefined
          ? `${customConfig.drones} Flycam 5.1K trên không`
          : isBigEvent || isWedding
          ? '1 Flycam 5.1K quay toàn cảnh địa điểm/resort'
          : 'Tùy chọn bổ sung theo nhu cầu';

      parsedScriptPlan = {
        conceptTitle,
        summary: `Dựa trên dữ liệu phân tích ${
          attachments.length > 0 ? `và ${attachments.length} tài liệu đính kèm ` : ''
        }${driveLink ? `(Link Drive: ${driveLink}) ` : ''}, nhiep.net đã xây dựng phương án sản xuất và phân bổ ekip máy quay tối ưu nhất.`,
        cameraCrewProposal: {
          videoCameras: videoCrew,
          photoCameras: photoCrew,
          drones: droneCrew,
          directors: '1 Đạo diễn hình ảnh & điều phối âm thanh ánh sáng',
          lightingAndAudio: 'Hệ thống mic thu âm không dây Sennheiser/Rode & Đèn studio Aputure',
          recommendedTotalCrew: customConfig
            ? `${(customConfig.gimbalOperators || 0) + (customConfig.photographers || 0) + (customConfig.drones ? 1 : 0)} Nhân sự`
            : isBigEvent
            ? '3 - 5 Nhân sự'
            : '2 - 3 Nhân sự'
        },
        timelineBreakdown: [
          {
            scene: 'Phân cảnh 1: Chuẩn bị & Không gian (Establishing Shots)',
            time: 'Trước sự kiện 1 - 2 giờ',
            description:
              'Quay chụp toàn cảnh kiến trúc resort/khách sạn, chi tiết trang trí, backdrop, khoảnh khắc trang điểm và trang phục.',
            recommendedGear: 'Ống kính góc rộng 16-35mm + Gimbal chống rung'
          },
          {
            scene: 'Phân cảnh 2: Diễn biến chính (The Main Ceremony / Event)',
            time: 'Thời lượng sự kiện',
            description:
              'Góc máy chính quay toàn cảnh sân khấu, máy phụ bắt cận biểu cảm, nụ cười, tràng pháo tay và khoảnh khắc xúc động.',
            recommendedGear: 'Ống kính chân dung 85mm f/1.4 + 70-200mm tele'
          },
          {
            scene: 'Phân cảnh 3: Toàn cảnh trên không & Bế mạc (Aerial & Finale)',
            time: 'Thời điểm vàng (Golden Hour / Gala)',
            description:
              'Flycam cất cánh ghi lại quy mô hoành tráng, tiệc chúc mừng, nâng ly và các hoạt động tương tác.',
            recommendedGear: 'Flycam DJI 5.1K + Đèn LED Fill-light'
          }
        ],
        customPackages: parsedCustomPackages
      };
    }

    const finalCustomPackages = parsedCustomPackages || [];

    if (!aiResponseText) {
      if (locale === 'zh') {
        aiResponseText = `您好！**nhiep.net** AI 摄制总监已深入分析您的需求${
          attachments.length > 0 ? `及上传的 ${attachments.length} 份文件` : ''
        }：\n\n🎬 **专属策划剧本与设备建议：**\n- **机位配置推荐**：${
          parsedScriptPlan.cameraCrewProposal.videoCameras
        } + ${parsedScriptPlan.cameraCrewProposal.photoCameras} + ${
          parsedScriptPlan.cameraCrewProposal.drones
        }\n- **后期标准**：支持 4K Cinema 10-bit 调色与 24 小时极速出片。\n\n📸 **可供选择的定制执行套餐：**\n${finalCustomPackages
          .map((p) => `• **${p.name}**（${p.cameraCount}）：**${p.estimatedPriceVndFormatted}**\n  _${p.highlights}_`)
          .join('\n\n')}\n\n👉 您可直接在下方根据预算与需求**自由调整机位数量**，或点击**预定定金 (VietQR MB BANK)** / **联系顾问 0943391369** 立即确认档期！`;
      } else if (locale === 'en') {
        aiResponseText = `Hello! **nhiep.net** AI Production Director has analyzed your request${
          attachments.length > 0 ? ` and ${attachments.length} attached document(s)` : ''
        }:\n\n🎬 **Tailored Production Plan & Crew Breakdown:**\n- **Recommended Crew**: ${
          parsedScriptPlan.cameraCrewProposal.videoCameras
        }, ${parsedScriptPlan.cameraCrewProposal.photoCameras}, ${
          parsedScriptPlan.cameraCrewProposal.drones
        }\n- **Editing Quality**: Full HD 1080p, 4K Cinema 10-bit, and 24h rapid delivery options.\n\n📸 **Flexible Production Packages:**\n${finalCustomPackages
          .map((p) => `• **${p.name}** (${p.cameraCount}): **${p.estimatedPriceVndFormatted}**\n  _${p.highlights}_`)
          .join('\n\n')}\n\n👉 You can adjust camera/crew options manually below according to your budget, generate a VietQR MB BANK deposit code, or forward this plan to **Zalo 0943391369**!`;
      } else {
        aiResponseText = `Chào bạn! Đạo diễn AI của **nhiep.net** đã phân tích kỹ lưỡng yêu cầu của bạn${
          attachments.length > 0 ? ` cùng ${attachments.length} tài liệu/bảng tính/slide đính kèm` : ''
        }${driveLink ? ` (Link Drive: ${driveLink})` : ''} để lập kịch bản và phân bổ ekip linh hoạt:\n\n🎬 **Kịch Bản & Phương Án Máy Quay / Nhân Sự Đề Xuất:**\n- **Số lượng máy & nhân sự**: ${
          parsedScriptPlan.cameraCrewProposal.videoCameras
        }, ${parsedScriptPlan.cameraCrewProposal.photoCameras}, ${
          parsedScriptPlan.cameraCrewProposal.drones
        }.\n- **Chất lượng bàn giao**: Quay 4K 10-bit chuẩn điện ảnh, chỉnh màu DaVinci Resolve, trả 100% file gốc.\n\n📦 **Các tùy chọn gói linh hoạt theo ngân sách để bạn lựa chọn:**\n${finalCustomPackages
          .map((p) => `• **${p.name}** (${p.cameraCount}): **${p.estimatedPriceVndFormatted}**\n  _${p.highlights}_`)
          .join('\n\n')}\n\n👉 Bạn có thể **tự tùy chỉnh thủ công số lượng thợ & flycam** theo ý muốn ở bảng bên dưới, bấm **Thêm vào giỏ hàng**, **Đặt cọc VietQR MB BANK 89052667799** hoặc bấm **Gửi Zalo 0943391369** để giữ lịch ekip ngay!`;
      }
    }

    const assistantChatMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      content: aiResponseText,
      recommendedPackages: recommended,
      scriptPlan: parsedScriptPlan || undefined,
      customPackages: parsedCustomPackages || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    appendChatMessageToSession(sessionId, assistantChatMsg, {
      locale: locale as any,
      customerInfo,
      scriptSummary: parsedScriptPlan?.conceptTitle || ''
    });

    return NextResponse.json({
      success: true,
      sessionId,
      reply: aiResponseText,
      scriptPlan: parsedScriptPlan || undefined,
      customPackages: parsedCustomPackages || undefined,
      recommendedPackages: recommended
    });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
