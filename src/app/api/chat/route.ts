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

    // Smart contextual matching: select 3 to 5 best matching standard packages from PACKAGES
    const matchedPackages = PACKAGES.filter((pkg) => {
      const searchSpace = `${pkg.nameVi} ${pkg.nameEn} ${pkg.nameZh} ${pkg.descriptionVi} ${pkg.descriptionEn} ${pkg.tags.join(' ')} ${pkg.categoryId}`.toLowerCase();
      
      const words = lowerQuery.split(/\s+/).filter((w: string) => w.length > 1);
      if (words.some((w: string) => searchSpace.includes(w))) return true;

      if ((lowerQuery.includes('cưới') || lowerQuery.includes('wedding')) && (pkg.tags.includes('Wedding') || pkg.slug.includes('wedding'))) return true;
      if ((lowerQuery.includes('sự kiện') || lowerQuery.includes('event') || lowerQuery.includes('hội nghị') || lowerQuery.includes('gala')) && (pkg.categoryId === 'event-coverage' || pkg.tags.includes('Event'))) return true;
      if ((lowerQuery.includes('tvc') || lowerQuery.includes('doanh nghiệp') || lowerQuery.includes('quảng cáo')) && (pkg.categoryId === 'videography' || pkg.tags.includes('TVC'))) return true;
      if ((lowerQuery.includes('du lịch') || lowerQuery.includes('travel') || lowerQuery.includes('tour') || lowerQuery.includes('nghỉ dưỡng')) && (pkg.categoryId === 'travel-photography' || pkg.tags.includes('Travel'))) return true;
      if ((lowerQuery.includes('ẩm thực') || lowerQuery.includes('món ăn') || lowerQuery.includes('menu') || lowerQuery.includes('food')) && pkg.tags.includes('Food')) return true;
      if ((lowerQuery.includes('ảnh') || lowerQuery.includes('chụp') || lowerQuery.includes('photo')) && pkg.categoryId === 'photography') return true;
      if ((lowerQuery.includes('quay') || lowerQuery.includes('video') || lowerQuery.includes('film') || lowerQuery.includes('cinema')) && pkg.categoryId === 'videography') return true;

      return false;
    });

    const recommended = (matchedPackages.length >= 3 ? matchedPackages : PACKAGES.filter((p) => p.popular || p.featured))
      .slice(0, 5)
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
          let typeLabel = `Document / File (${a.fileExtension?.toUpperCase() || 'DOC'})`;
          if (a.type === 'image') {
            typeLabel = locale === 'zh' ? '参考图片 / 情绪板' : locale === 'en' ? 'Moodboard / Concept Image' : 'Hình ảnh mẫu / Moodboard';
          } else if (a.type === 'audio') {
            typeLabel = locale === 'zh' ? '语音录音文件' : locale === 'en' ? 'Audio Voice Note' : 'Tệp ghi âm giọng nói';
          } else if (a.type === 'drive') {
            typeLabel = 'Google Drive Folder';
          }

          let textSnippet = '';
          if (a.textContent) {
            textSnippet = `\n${locale === 'zh' ? '文件内容提取：' : locale === 'en' ? 'EXTRACTED FILE CONTENT:' : 'NỘI DUNG ĐỌC TỰ ĐỘNG TỪ FILE:'}\n${a.textContent.slice(0, 15000)}\n`;
          }

          return `[ATTACHMENT ${idx + 1}]: ${a.name} (${typeLabel}, Size: ${a.size || 'N/A'})${textSnippet}`;
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

    const targetLangName =
      locale === 'zh' ? 'SIMPLIFIED CHINESE (中文)' : locale === 'en' ? 'ENGLISH' : 'VIETNAMESE (Tiếng Việt)';

    if (apiKey) {
      const knowledgeContext = `
NHIEP.NET Knowledge Base & Operations:
- Identity: You are NHIEP.NET, a professional, human-like, warm, and experienced photography & cinematography director in Central Vietnam.
- Operating regions: Da Nang, Hoi An, Hue, Quang Tri, Nha Trang / Cam Ranh.
- 24/7 Hotline & WhatsApp / Zalo: 0943391369 (International: +84943391369).
- Official Bank Account: MB BANK 89052667799 - NGUYEN XUAN TOI.
- Cinema gear: Sony FX3 Cinema Line, Sony FX6, Sony A7R V (61MP 8K), Sony A7 IV, DJI Mavic 3 Pro / Inspire 5.1K Drones, DJI Ronin RS3 Pro Gimbals, Sennheiser / Rode Wireless Pro Microphones, Aputure 600d / Nanlite Studio Lights.
- Color grading: Full HD 1080p, 4K Cinema 10-bit DaVinci Resolve, 6K Master RAW.
- Pricing rules for Custom Crew & Gear:
  + Thợ quay Gimbal: Full HD 3.200.000 đ/thợ, 4K 4.200.000 đ/thợ, 6K RAW 5.700.000 đ/thợ
  + Flycam DJI: Full HD 2.200.000 đ/máy, 4K 3.200.000 đ/máy, 6K RAW 4.700.000 đ/máy
  + Thợ chụp ảnh: 2.500.000 đ/thợ (cố định mọi độ phân giải)
  + Dựng phim tiêu chuẩn: Full HD 1.200.000 đ/video, 4K 1.500.000 đ/video, 6K RAW 4.500.000 đ/video
  + Dựng phim nâng cao: Full HD 2.800.000 đ/video, 4K 3.500.000 đ/video, 6K RAW 6.500.000 đ/video
  + Voice talent: Tiêu chuẩn 800.000 đ, Cao cấp 2.500.000 đ/video
  + Hậu kỳ ảnh: Tiêu chuẩn 400.000 đ, Cao cấp 1.500.000 đ/show
- Available matching packages on website:
${recommended.map((r, i) => `${i + 1}. ${r.name} - Giá: ${r.price}`).join('\n')}
`;

      const promptInstructions = `You are NHIEP.NET AI Consultant.
CRITICAL RESPONSE GUIDELINES:
1. Language: 100% in ${targetLangName}.
2. Tone: Warm, natural, concise, polite, and human-like. Speak directly to the point without verbose, repetitive, or robotic greetings.
3. STRICT PROHIBITION: DO NOT use markdown bold asterisks (**) or underscores (__) anywhere in the text. Write clean, natural text.
4. Response Flow:
   - Part 1: Directly address and solve the customer's specific question or request in 1-2 focused, insightful sentences.
   - Part 2: Introduce 3 to 5 matching packages currently available on the nhiep.net website (with package names and prices).
   - Part 3: Guide the customer to the "TỰ CHỈNH THỢ & MÁY" (Custom Crew & Gear) panel right below to flexibly adjust the number of gimbal operators, photographers, drones, and video editing according to their exact budget.
5. In addition to your conversational text, you MUST provide a JSON block at the very end enclosed in \`\`\`json ... \`\`\` with this exact schema (ALL VALUES IN ${targetLangName}):
{
  "conceptTitle": "Title of the custom script in ${targetLangName}",
  "summary": "Specific analysis summary in ${targetLangName}",
  "cameraCrewProposal": {
    "videoCameras": "Video camera configuration description in ${targetLangName}",
    "photoCameras": "Photo camera description in ${targetLangName}",
    "drones": "Drone description in ${targetLangName}",
    "directors": "Director description in ${targetLangName}",
    "lightingAndAudio": "Lighting and audio description in ${targetLangName}",
    "recommendedTotalCrew": "Total recommended crew number in ${targetLangName}"
  },
  "timelineBreakdown": [
    { "scene": "Scene 1", "time": "Timeline", "description": "Scene details in ${targetLangName}", "recommendedGear": "Gear" },
    { "scene": "Scene 2", "time": "Timeline", "description": "Scene details in ${targetLangName}", "recommendedGear": "Gear" },
    { "scene": "Scene 3", "time": "Timeline", "description": "Scene details in ${targetLangName}", "recommendedGear": "Gear" }
  ],
  "customPackages": [
    {
      "id": "pkg-budget",
      "tier": "Budget Tier in ${targetLangName}",
      "name": "Package Name in ${targetLangName}",
      "cameraCount": "Camera configuration in ${targetLangName}",
      "crewDetails": "Crew details in ${targetLangName}",
      "gear": "Gear in ${targetLangName}",
      "deliverables": ["Deliverable 1 in ${targetLangName}", "Deliverable 2 in ${targetLangName}"],
      "estimatedPriceVnd": 3800000,
      "estimatedPriceVndFormatted": "3.800.000 ₫",
      "highlights": "Highlights in ${targetLangName}"
    },
    {
      "id": "pkg-standard",
      "tier": "Standard Tier in ${targetLangName}",
      "name": "Standard Package Name in ${targetLangName}",
      "cameraCount": "Camera configuration in ${targetLangName}",
      "crewDetails": "Crew details in ${targetLangName}",
      "gear": "Gear in ${targetLangName}",
      "deliverables": ["Deliverable 1 in ${targetLangName}", "Deliverable 2 in ${targetLangName}", "Deliverable 3 in ${targetLangName}"],
      "estimatedPriceVnd": 7800000,
      "estimatedPriceVndFormatted": "7.800.000 ₫",
      "highlights": "Highlights in ${targetLangName}"
    },
    {
      "id": "pkg-vip",
      "tier": "VIP Masterpiece Tier in ${targetLangName}",
      "name": "VIP Package Name in ${targetLangName}",
      "cameraCount": "Camera configuration in ${targetLangName}",
      "crewDetails": "Crew details in ${targetLangName}",
      "gear": "Gear in ${targetLangName}",
      "deliverables": ["Deliverable 1 in ${targetLangName}", "Deliverable 2 in ${targetLangName}", "Deliverable 3 in ${targetLangName}", "Deliverable 4 in ${targetLangName}"],
      "estimatedPriceVnd": 14500000,
      "estimatedPriceVndFormatted": "14.500.000 ₫",
      "highlights": "Highlights in ${targetLangName}"
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

Please analyze this customer request, deliver a focused and natural answer in ${targetLangName} (NO markdown asterisks), suggest the 3-5 packages, guide to the customizer, and output the response and json block.`;

      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-3.6-flash',
        'gemini-flash-latest',
        'gemini-3.7-flash',
        'gemini-3.1-pro-preview'
      ];

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

              let cleaned = candidateText.replace(/\`\`\`json\s*[\s\S]*?\s*\`\`\`/, '').trim();
              // Clean markdown asterisks to ensure completely natural human-like text
              cleaned = cleaned.replace(/\*\*/g, '').replace(/__/g, '');
              aiResponseText = cleaned;
              break;
            }
          }
        } catch (callErr) {
          console.warn(`Gemini call error on ${modelName}:`, callErr);
        }
      }
    }

    // Multilingual Fallback Object Generator
    if (!parsedScriptPlan) {
      const isBigEvent =
        lowerQuery.includes('sự kiện') ||
        lowerQuery.includes('hội nghị') ||
        lowerQuery.includes('gala') ||
        lowerQuery.includes('tvc') ||
        lowerQuery.includes('khai trương') ||
        lowerQuery.includes('event') ||
        lowerQuery.includes('conference') ||
        lowerQuery.includes('活动') ||
        lowerQuery.includes('会议');
      const isWedding =
        lowerQuery.includes('cưới') ||
        lowerQuery.includes('wedding') ||
        lowerQuery.includes('tiệc cưới') ||
        lowerQuery.includes('pre-wedding') ||
        lowerQuery.includes('婚礼');
      const isAoDai =
        lowerQuery.includes('áo dài') ||
        lowerQuery.includes('cổ phục') ||
        lowerQuery.includes('di sản') ||
        lowerQuery.includes('heritage') ||
        lowerQuery.includes('古装') ||
        lowerQuery.includes('奥黛');
      const isTravel =
        lowerQuery.includes('du lịch') ||
        lowerQuery.includes('bà nà') ||
        lowerQuery.includes('hội an') ||
        lowerQuery.includes('tour') ||
        lowerQuery.includes('travel') ||
        lowerQuery.includes('旅游') ||
        lowerQuery.includes('度假');

      let conceptTitle = 'Kịch Bản Sản Xuất Hình Ảnh & Video Theo Yêu Cầu Riêng';
      if (locale === 'en') {
        conceptTitle = isWedding
          ? 'Artistic Cinema Wedding Documentary & Live Moments'
          : isBigEvent
          ? 'Corporate Event, Conference & Brand TVC Production Plan'
          : isAoDai
          ? 'Heritage Ao Dai & Traditional Costume Photo Session'
          : isTravel
          ? 'Luxury Vacation & Travel Phototour Experience'
          : 'Custom Photo & Cinema Production Plan';
      } else if (locale === 'zh') {
        conceptTitle = isWedding
          ? '电影级艺术婚礼纪实与精彩瞬间剧本'
          : isBigEvent
          ? '企业活动、高端会议与品牌宣传片TVC摄制方案'
          : isAoDai
          ? '中越传统古服与奥黛文化遗产旅拍方案'
          : isTravel
          ? '高端度假与海岛旅行专属摄影跟拍方案'
          : '个性化专属影视拍摄与摄影方案';
      } else {
        if (isWedding) conceptTitle = 'Kịch Bản Phóng Sự Cưới Nghệ Thuật Cinema & Bắt Trọn Khoảnh Khắc';
        else if (isBigEvent) conceptTitle = 'Kịch Bản Phim Sự Kiện, Hội Nghị & TVC Truyền Thông Thương Hiệu';
        else if (isAoDai) conceptTitle = 'Kịch Bản Chụp Ảnh Cổ Phục & Áo Dài Di Sản Miền Trung';
        else if (isTravel) conceptTitle = 'Kịch Bản Phototour Du Lịch & Nghỉ Dưỡng Cao Cấp';
      }

      let customTiers: CustomPackageOption[] = [];
      if (
        customConfig &&
        (customConfig.gimbalOperators > 0 || customConfig.photographers > 0 || customConfig.drones > 0)
      ) {
        const extraEn: string[] = [];
        if (customConfig.standardVideoEditing) extraEn.push(`${customConfig.standardVideoEditing} Standard Video Edit(s)`);
        if (customConfig.advancedVideoEditing) extraEn.push(`${customConfig.advancedVideoEditing} Advanced Video Edit(s)`);
        if (customConfig.voiceTalent && customConfig.voiceTalent !== 'none') extraEn.push(`Voice Talent (${customConfig.voiceTalent})`);
        if (customConfig.photoRetouch && customConfig.photoRetouch !== 'none') extraEn.push(`Photo Retouch (${customConfig.photoRetouch})`);

        const extraZh: string[] = [];
        if (customConfig.standardVideoEditing) extraZh.push(`${customConfig.standardVideoEditing} 条标准视频剪辑`);
        if (customConfig.advancedVideoEditing) extraZh.push(`${customConfig.advancedVideoEditing} 条高级电影剪辑`);
        if (customConfig.voiceTalent && customConfig.voiceTalent !== 'none') extraZh.push(`专业配音（${customConfig.voiceTalent === 'premium' ? '高级版' : '标准版'}）`);
        if (customConfig.photoRetouch && customConfig.photoRetouch !== 'none') extraZh.push(`精修后期（${customConfig.photoRetouch === 'premium' ? '高级版' : '标准版'}）`);

        const extraVi: string[] = [];
        if (customConfig.standardVideoEditing) extraVi.push(`${customConfig.standardVideoEditing} Dựng phim tiêu chuẩn`);
        if (customConfig.advancedVideoEditing) extraVi.push(`${customConfig.advancedVideoEditing} Dựng phim nâng cao`);
        if (customConfig.voiceTalent && customConfig.voiceTalent !== 'none') extraVi.push(`Voice talent (${customConfig.voiceTalent === 'premium' ? 'Cao cấp' : 'Tiêu chuẩn'})`);
        if (customConfig.photoRetouch && customConfig.photoRetouch !== 'none') extraVi.push(`Hậu kỳ ảnh (${customConfig.photoRetouch === 'premium' ? 'Cao cấp' : 'Tiêu chuẩn'})`);

        if (locale === 'en') {
          customTiers.push({
            id: 'pkg-user-custom',
            tier: 'Your Custom Selected Configuration',
            name: `Custom Package: ${customConfig.gimbalOperators} Gimbal + ${customConfig.photographers} Photo + ${customConfig.drones} Drone`,
            cameraCount: `${customConfig.gimbalOperators} Gimbal Crew + ${customConfig.photographers} Photographers + ${customConfig.drones} DJI Drones`,
            crewDetails: `${customConfig.gimbalOperators + customConfig.photographers + (customConfig.drones > 0 ? 1 : 0)} Technical Crew`,
            gear: 'Sony FX3 Cinema 4K, Sony A7R V 61MP, DJI Drone, Ronin RS3 Pro',
            deliverables: [
              `Final Video in ${customConfig.editingQuality.toUpperCase()} Quality`,
              ...extraEn,
              'All High-Resolution RAW & Original Files',
              customConfig.express24h ? '24-Hour Express Rapid Delivery' : 'Standard 3-5 Days Turnaround',
              customConfig.luxuryPhotobook ? '1 Luxury 30x30cm Photobook Album' : 'Color-graded Photo Collection'
            ],
            estimatedPriceVnd: customConfig.totalVnd,
            estimatedPriceVndFormatted: `${customConfig.totalVnd.toLocaleString('vi-VN')} ₫`,
            highlights: 'Exactly tailored to your selected equipment and budget configuration'
          });
        } else if (locale === 'zh') {
          customTiers.push({
            id: 'pkg-user-custom',
            tier: '您的专属自选配置',
            name: `定制方案：${customConfig.gimbalOperators}位稳定器 + ${customConfig.photographers}位摄影 + ${customConfig.drones}台航拍`,
            cameraCount: `${customConfig.gimbalOperators}位稳定器摄影师 + ${customConfig.photographers}位主摄影师 + ${customConfig.drones}台大疆航拍机`,
            crewDetails: `${customConfig.gimbalOperators + customConfig.photographers + (customConfig.drones > 0 ? 1 : 0)} 位专业人员`,
            gear: '索尼FX3电影机4K、索尼A7R V 6100万像素、大疆航拍机、如影RS3 Pro',
            deliverables: [
              `${customConfig.editingQuality.toUpperCase()} 标清/高清精剪成片`,
              ...extraZh,
              '全部高清原始底片与素材',
              customConfig.express24h ? '24小时极速出片通道' : '3-5个工作日交付',
              customConfig.luxuryPhotobook ? '1本30x30cm高档水晶相册' : '艺术调色精修相片集'
            ],
            estimatedPriceVnd: customConfig.totalVnd,
            estimatedPriceVndFormatted: `${customConfig.totalVnd.toLocaleString('vi-VN')} ₫`,
            highlights: '完全依据您刚才自主挑选的人员、设备与预算方案'
          });
        } else {
          customTiers.push({
            id: 'pkg-user-custom',
            tier: 'Cấu Hình Tùy Chọn Riêng Của Bạn',
            name: `Gói Tự Chọn: ${customConfig.gimbalOperators} Gimbal + ${customConfig.photographers} Chụp + ${customConfig.drones} Flycam`,
            cameraCount: `${customConfig.gimbalOperators} Thợ quay Gimbal + ${customConfig.photographers} Thợ chụp ảnh + ${customConfig.drones} Flycam DJI`,
            crewDetails: `${customConfig.gimbalOperators + customConfig.photographers + (customConfig.drones > 0 ? 1 : 0)} Nhân sự vận hành`,
            gear: 'Sony FX3 Cinema 4K, Sony A7R V 61MP, Flycam DJI, Gimbal Ronin RS3 Pro',
            deliverables: [
              `Video hoàn thiện chuẩn ${customConfig.editingQuality.toUpperCase()}`,
              ...extraVi,
              'Toàn bộ file gốc chất lượng cao',
              customConfig.express24h ? 'Nhận sản phẩm hỏa tốc trong 24h' : 'Bàn giao đúng tiến độ 3-5 ngày',
              customConfig.luxuryPhotobook ? '01 Album Photobook cao cấp 30x30cm' : 'Bộ ảnh đã blend màu nghệ thuật'
            ],
            estimatedPriceVnd: customConfig.totalVnd,
            estimatedPriceVndFormatted: `${customConfig.totalVnd.toLocaleString('vi-VN')} ₫`,
            highlights: 'Đúng theo bảng chọn thiết bị và ngân sách bạn vừa tùy biến'
          });
        }
      }

      if (locale === 'en') {
        parsedCustomPackages = [
          ...customTiers,
          {
            id: 'pkg-1',
            tier: 'Budget Tier (Streamlined Budget)',
            name: isWedding ? 'Essential Wedding Highlights' : isBigEvent ? 'Standard Event Coverage' : 'Essential Production Package',
            cameraCount: isBigEvent ? '1 4K Gimbal + 1 Lead Photographer' : '1 Cinema Gimbal Operator or 1 Photographer',
            crewDetails: '1 - 2 Technical Crew Members',
            gear: 'Sony A7 IV + DJI Gimbal + Rode Wireless Pro Mic',
            deliverables: [
              '1 Highlight Video Full HD / 4K (3-5 mins)',
              'All RAW files + 50 DaVinci color-graded photos',
              'High-speed Google Drive delivery'
            ],
            estimatedPriceVnd: 3800000,
            estimatedPriceVndFormatted: '3,800,000 VND',
            highlights: 'Cost-effective package ensuring crisp resolution and candid moments'
          },
          {
            id: 'pkg-2',
            tier: 'Standard Tier (Recommended - Best Value)',
            name: isWedding ? 'Premier Cinema Wedding Story' : isBigEvent ? 'Multi-Angle Corporate Film & Gala' : 'Premier Cinema Package',
            cameraCount: '2 Cinema Gimbal Operators + 1-2 Photographers + Optional Drone',
            crewDetails: '3 - 4 Crew Members (2 Videographers + 1 Photographer + 1 Assistant)',
            gear: 'Sony FX3 Cinema Line + Sony A7R V + Sennheiser Wireless + Aputure Studio Lights',
            deliverables: [
              '1 4K Cinema Teaser + 1 Full Documentary Recap Film',
              'All RAW files + 150-300 fine-retouched photos',
              '4K 10-bit DaVinci Resolve cinema color grading',
              'Aerial drone venue overview included'
            ],
            estimatedPriceVnd: 7800000,
            estimatedPriceVndFormatted: '7,800,000 VND',
            highlights: 'Multi-angle cinema coverage capturing all authentic emotions and professional audio/lighting'
          },
          {
            id: 'pkg-3',
            tier: 'VIP Masterpiece Tier (Premium Cinema)',
            name: isWedding ? 'Masterpiece Grand Wedding 4K' : isBigEvent ? 'Commercial Brand TVC & 4K/6K Documentary' : 'VIP Masterpiece Experience',
            cameraCount: '3 Cinema FX3/FX6 Cameras + 2 A7R V Photographers + 1 5.1K Drone',
            crewDetails: '5 - 6 Crew (Director of Photography, 3 Videographers, 2 Photographers, 1 Drone Pilot)',
            gear: 'Sony FX6 Cinema RAW + Sony FX3 + DJI Mavic 3 Pro 5.1K + Aputure 600d Pro',
            deliverables: [
              '1 4K Viral Teaser + 1 4K Master Cinema Film',
              'All RAW files + 100% fine art retouching',
              'Theatrical-grade DaVinci Resolve Studio color grading',
              '1 Luxury 30x30cm Photobook Album + Crystal USB box',
              'Priority express 48h delivery'
            ],
            estimatedPriceVnd: 14500000,
            estimatedPriceVndFormatted: '14,500,000 VND',
            highlights: 'Top-tier cinema artistry with full directing and coordinated production crew'
          }
        ].slice(0, 3);

        parsedScriptPlan = {
          conceptTitle,
          summary: `Based on your request analysis ${
            attachments.length > 0 ? `and ${attachments.length} attached document(s) ` : ''
          }${driveLink ? `(Drive Link: ${driveLink}) ` : ''}, nhiep.net has prepared the optimal production plan and crew allocation.`,
          cameraCrewProposal: {
            videoCameras: customConfig?.gimbalOperators !== undefined ? `${customConfig.gimbalOperators} 4K Cinema Gimbal Crew` : isBigEvent ? '2 - 3 4K Cinema Gimbal Cameras' : '1 - 2 Cinema Gimbal Cameras',
            photoCameras: customConfig?.photographers !== undefined ? `${customConfig.photographers} Sony A7R V Photographers` : '1 - 2 Sony A7R V 61MP Photographers',
            drones: customConfig?.drones !== undefined ? `${customConfig.drones} Aerial 5.1K Drone` : '1 5.1K Aerial Drone for Venue Overview',
            directors: '1 Director of Photography & Sound/Lighting Lead',
            lightingAndAudio: 'Sennheiser/Rode Wireless Mics & Aputure Studio Lights',
            recommendedTotalCrew: customConfig
              ? `${(customConfig.gimbalOperators || 0) + (customConfig.photographers || 0) + (customConfig.drones ? 1 : 0)} Crew Members`
              : isBigEvent ? '3 - 5 Crew Members' : '2 - 3 Crew Members'
          },
          timelineBreakdown: [
            {
              scene: 'Scene 1: Establishing Shots & Atmosphere',
              time: '1 - 2 hours prior to start',
              description: 'Resort/hotel architecture, venue decoration, styling, makeup and backstage candid moments.',
              recommendedGear: '16-35mm Wide Angle Lens + Gimbal Stabilizer'
            },
            {
              scene: 'Scene 2: Main Ceremony / Event Keynote',
              time: 'Main Event Duration',
              description: 'Primary camera capturing stage keynote, secondary cameras capturing guest reactions, smiles and applause.',
              recommendedGear: '85mm f/1.4 Portrait Lens + 70-200mm Telephoto'
            },
            {
              scene: 'Scene 3: Aerial Grand Finale & Celebration',
              time: 'Golden Hour / Gala Dinner',
              description: 'Drone takeoff capturing the scale of the venue, toast celebrations, networking and interactive moments.',
              recommendedGear: 'DJI 5.1K Drone + LED Fill Lights'
            }
          ],
          customPackages: parsedCustomPackages
        };
      } else if (locale === 'zh') {
        parsedCustomPackages = [
          ...customTiers,
          {
            id: 'pkg-1',
            tier: '精选经济型套餐（预算精炼）',
            name: isWedding ? '婚礼纪实精选套餐' : isBigEvent ? '基础会议活动跟拍' : '精简拍摄套餐',
            cameraCount: isBigEvent ? '1位4K云台手 + 1位主摄影师' : '1位电影机云台手 或 1位专业摄影师',
            crewDetails: '1 - 2 位专业技术人员',
            gear: '索尼A7 IV + 大疆稳定器 + 罗德无线麦克风',
            deliverables: [
              '1条精剪高光短片 Full HD / 4K (3-5分钟)',
              '全部原始底片 + 50张DaVinci专业调色相片',
              '极速云盘交付'
            ],
            estimatedPriceVnd: 3800000,
            estimatedPriceVndFormatted: '3,800,000 ₫',
            highlights: '高性价比方案，确保画质清晰与精彩瞬间捕捉'
          },
          {
            id: 'pkg-2',
            tier: '标准尊享型套餐（官方推荐 - 性价比最高）',
            name: isWedding ? '电影级全景婚礼大片' : isBigEvent ? '多机位企业年会与商务活动纪录片' : '全方位影视制作套餐',
            cameraCount: '2位电影机云台手 + 1-2位资深摄影师 + 可选航拍',
            crewDetails: '3 - 4 位主创团队（2摄像 + 1摄影 + 1灯光助理）',
            gear: '索尼FX3电影机 + 索尼A7R V + 森海塞尔无线系统 + 爱图仕专业影视灯',
            deliverables: [
              '1部4K电影级预告片 + 1部完整活动纪录长片',
              '全套RAW原片 + 150-300张精修大片',
              '4K 10-bit DaVinci Resolve电影级调色',
              '包含场地全景航拍'
            ],
            estimatedPriceVnd: 7800000,
            estimatedPriceVndFormatted: '7,800,000 ₫',
            highlights: '多机位全视角捕捉精彩细节，影视级声光画质呈现'
          },
          {
            id: 'pkg-3',
            tier: 'VIP电影级旗舰套餐（高端定制）',
            name: isWedding ? '4K大师级婚礼纪实大片' : isBigEvent ? '企业品牌TVC与4K/6K高端宣传纪录片' : 'VIP大师级影视全包套餐',
            cameraCount: '3台FX3/FX6电影机 + 2位A7R V摄影师 + 1台5.1K航拍机',
            crewDetails: '5 - 6 位资深影视团队（摄制总监、3摄像、2摄影、1航拍飞手）',
            gear: '索尼FX6电影机RAW + 索尼FX3 + 大疆御3 Pro 5.1K + 爱图仕600d Pro',
            deliverables: [
              '1条千万级视效4K预告片 + 1部4K大师级成片',
              '全部原片 + 100%精修艺术大片',
              '院线级DaVinci Resolve Studio专业调色',
              '1本30x30cm高档水晶相册 + 水晶U盘礼盒',
              '48小时优先极速交付通道'
            ],
            estimatedPriceVnd: 14500000,
            estimatedPriceVndFormatted: '14,500,000 ₫',
            highlights: '顶级电影质感，摄制总监全流程导演协调与极致成片'
          }
        ].slice(0, 3);

        parsedScriptPlan = {
          conceptTitle,
          summary: `根据您的需求分析 ${
            attachments.length > 0 ? `及上传的 ${attachments.length} 份策划文件 ` : ''
          }${driveLink ? `(云盘链接: ${driveLink}) ` : ''}，nhiep.net 已为您定制了最优的摄制方案与机位分配。`,
          cameraCrewProposal: {
            videoCameras: customConfig?.gimbalOperators !== undefined ? `${customConfig.gimbalOperators}位4K电影机云台手` : isBigEvent ? '2 - 3位4K电影机云台手' : '1 - 2位电影机云台手',
            photoCameras: customConfig?.photographers !== undefined ? `${customConfig.photographers}位索尼A7R V摄影师` : '1 - 2位索尼A7R V 6100万像素摄影师',
            drones: customConfig?.drones !== undefined ? `${customConfig.drones}台5.1K高清航拍机` : '1台5.1K航拍机记录场地全景',
            directors: '1位摄制总监统筹声光画质',
            lightingAndAudio: '森海塞尔/罗德专业无线麦克风系统与爱图仕影视灯光',
            recommendedTotalCrew: customConfig
              ? `${(customConfig.gimbalOperators || 0) + (customConfig.photographers || 0) + (customConfig.drones ? 1 : 0)} 位人员`
              : isBigEvent ? '3 - 5 位人员' : '2 - 3 位人员'
          },
          timelineBreakdown: [
            {
              scene: '分镜 1: 环境与准备篇（Establishing Shots）',
              time: '开拍前 1 - 2 小时',
              description: '酒店/度假村全景航拍、场地布置细节、主视觉背板、妆造与服饰特写。',
              recommendedGear: '16-35mm 超广角镜头 + 如影稳定器'
            },
            {
              scene: '分镜 2: 主体仪式 / 活动高潮（Main Keynote）',
              time: '活动主体时段',
              description: '主机位记录舞台全景与重要致辞，副机位捕捉现场嘉宾真实表情、掌声与温馨瞬间。',
              recommendedGear: '85mm f/1.4 人像大光圈 + 70-200mm 远摄'
            },
            {
              scene: '分镜 3: 航拍全景与晚宴互动（Aerial & Finale）',
              time: '黄金时刻 / 晚宴环节',
              description: '无人机升空记录宏大场面，晚宴祝酒、互动交流与热烈氛围。',
              recommendedGear: '大疆 5.1K 航拍机 + 补光灯组'
            }
          ],
          customPackages: parsedCustomPackages
        };
      } else {
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
            ? `${customConfig.gimbalOperators} Thợ quay Gimbal`
            : isBigEvent
            ? '2 - 3 Thợ quay Gimbal'
            : '1 - 2 Thợ quay Gimbal';

        const photoCrew =
          customConfig?.photographers !== undefined
            ? `${customConfig.photographers} Thợ chụp ảnh`
            : '1 - 2 Thợ chụp ảnh bắt trọn khoảnh khắc';

        const droneCrew =
          customConfig?.drones !== undefined
            ? `${customConfig.drones} Flycam DJI trên không`
            : isBigEvent || isWedding
            ? '1 Flycam DJI quay toàn cảnh địa điểm/resort'
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
    }

    const finalCustomPackages = parsedCustomPackages || [];

    if (!aiResponseText) {
      if (locale === 'zh') {
        aiResponseText = `您好！我是 NHIEP.NET，很高兴为您提供专业拍摄策划方案。${
          latestUserMsg ? `针对您提出的需求 "${latestUserMsg}"` : ''
        }${
          attachments.length > 0 ? `以及上传的 ${attachments.length} 份参考资料` : ''
        }${driveLink ? `（Drive链接：${driveLink}）` : ''}，我已为您制定了最合适的执行方案：

1. 推荐机位配置与人员：
- 机位建议：${parsedScriptPlan.cameraCrewProposal.videoCameras}、${parsedScriptPlan.cameraCrewProposal.photoCameras}、${parsedScriptPlan.cameraCrewProposal.drones}。
- 成片标准：电影级 4K / Full HD 精细调色，交付全部高清原片底片。

2. 网站现有匹配套餐推荐：
${recommended.length > 0 ? recommended.map((r) => `- ${r.name}（参考价：${r.price}）`).join('\n') : '- NHIEP.NET 精选摄影与摄制套餐'}

3. 自主定制设备与人员方案：
您也可以直接点击上方的“自主定制”面板，自由增减稳定器摄影师、主摄影师、大疆无人机数量，以及选择标准剪辑或高级电影感剪辑，完全贴合您的预算。

如需对接具体档期或定制分镜，欢迎点击通过 WhatsApp（+84943391369）与专属顾问联系，或直接扫码 VietQR MB BANK 锁定档期！`;
      } else if (locale === 'en') {
        aiResponseText = `Hello! I am NHIEP.NET, glad to assist you with your production plan.${
          latestUserMsg ? ` Regarding your request "${latestUserMsg}"` : ''
        }${
          attachments.length > 0 ? ` and the ${attachments.length} attached document(s)` : ''
        }${driveLink ? ` (Drive Link: ${driveLink})` : ''}, I have analyzed the details and prepared the optimal production plan for you:

1. Recommended Crew & Gear Breakdown:
- Proposed Setup: ${parsedScriptPlan.cameraCrewProposal.videoCameras}, ${parsedScriptPlan.cameraCrewProposal.photoCameras}, ${parsedScriptPlan.cameraCrewProposal.drones}.
- Deliverables: High quality 4K Cinema / Full HD color-graded video with 100% original RAW files included.

2. Relevant Packages on our Website:
${recommended.length > 0 ? recommended.map((r) => `- ${r.name} (${r.price})`).join('\n') : '- NHIEP.NET Standard & Premium Packages'}

3. Custom Crew & Gear Builder:
You can also use the Custom Crew & Gear Builder above to freely adjust the number of Gimbal operators, photographers, DJI Drones, standard or advanced video editing according to your exact budget.

Feel free to confirm your schedule via WhatsApp (+84943391369) or proceed with VietQR MB BANK deposit!`;
      } else {
        aiResponseText = `Chào bạn! Tôi là NHIEP.NET, rất vui được đồng hành cùng bạn.${
          latestUserMsg ? ` Về yêu cầu "${latestUserMsg}" của bạn` : ''
        }${
          attachments.length > 0 ? ` cùng ${attachments.length} tệp tài liệu bạn vừa gửi` : ''
        }${driveLink ? ` (Link Drive: ${driveLink})` : ''}, tôi đã nghiên cứu kỹ và lên phương án sản xuất tối ưu nhất cho bạn:

1. Phương án nhân sự & máy quay đề xuất:
- Cấu hình đề xuất: ${parsedScriptPlan.cameraCrewProposal.videoCameras}, ${parsedScriptPlan.cameraCrewProposal.photoCameras}, ${parsedScriptPlan.cameraCrewProposal.drones}.
- Chuẩn chất lượng: Quay dựng 4K Cinema / Full HD chất lượng cao, cân màu DaVinci Resolve và bàn giao toàn bộ file gốc.

2. Gợi ý gói sẵn có trên hệ thống phù hợp với bạn:
${recommended.length > 0 ? recommended.map((r) => `- ${r.name} (Giá: ${r.price})`).join('\n') : '- Gói Dịch Vụ Tiêu Chuẩn & Cao Cấp nhiep.net'}

3. Tự chỉnh Thợ & Máy theo ngân sách riêng của bạn:
Bạn hoàn toàn có thể chủ động bấm mở bảng Tự chỉnh Thợ & Máy ở ngay phía trên để tăng giảm số lượng thợ quay Gimbal, thợ chụp ảnh, Flycam DJI, chọn Dựng phim tiêu chuẩn hoặc Dựng phim nâng cao theo đúng ngân sách dự kiến.

Nếu bạn cần tư vấn thêm hoặc muốn chốt lịch ngay, hãy bấm Chốt gói qua Zalo (0943391369) hoặc chọn Đặt cọc VietQR MB BANK nhé!`;
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
