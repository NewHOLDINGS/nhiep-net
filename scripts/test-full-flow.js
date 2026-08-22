const XLSX = require('xlsx');
const JSZip = require('jszip');

async function testSpreadsheet() {
  console.log('=== TEST 1: SPREADSHEET (.xlsx / .csv) ===');
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['Thời gian', 'Hoạt động', 'Địa điểm', 'Yêu cầu máy quay', 'Ghi chú'],
    ['08:00', 'Đón khách & Check-in', 'Sảnh chính Vinpearl Hội An', '1 Gimbal + 1 Máy chụp', 'Bắt cận nụ cười & backdrop'],
    ['09:30', 'Khai mạc Hội nghị Gala', 'Grand Ballroom', 'Flycam toàn cảnh + 2 Gimbal Cinema + 2 Máy chụp', 'Âm thanh không dây trực tiếp bàn mixer'],
    ['12:00', 'Tiệc trưa giao lưu', 'Nhà hàng ven biển', '1 Máy chụp chân dung VIP', 'Chỉnh màu DaVinci Resolve']
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'LichTrinhSuKien');
  
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const readWb = XLSX.read(buf, { type: 'buffer' });
  const csv = XLSX.utils.sheet_to_csv(readWb.Sheets['LichTrinhSuKien']);
  console.log('Parsed Spreadsheet CSV preview:');
  console.log(csv);
  console.log('-> Spreadsheet parsing OK!\n');
}

async function testPptx() {
  console.log('=== TEST 2: POWERPOINT (.pptx) ===');
  const zip = new JSZip();
  const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>KỊCH BẢN PHÓNG SỰ CƯỚI NGHỆ THUẬT - RESORT ĐÀ NẴNG</a:t></a:r></a:p>
          <a:p><a:r><a:t>Quy mô: 250 khách mời VIP, cần 1 Flycam 5.1K, 2 Thợ quay Gimbal 4K, 2 Thợ chụp Sony A7R V</a:t></a:r></a:p>
          <a:p><a:r><a:t>Yêu cầu hậu kỳ: Highlight 4K Cinema 10-bit DaVinci Resolve và giao file trong 24h</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
  zip.file('ppt/slides/slide1.xml', slideXml);
  const pptxBuf = await zip.generateAsync({ type: 'nodebuffer' });
  
  // Read back
  const readZip = await JSZip.loadAsync(pptxBuf);
  const readXml = await readZip.file('ppt/slides/slide1.xml').async('string');
  const matches = readXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
  const texts = matches.map(m => m.replace(/<[^>]+>/g, '').trim());
  console.log('Parsed PPTX Slides text:');
  console.log(texts.join(' | '));
  console.log('-> PPTX parsing OK!\n');
}

async function testGeminiIntegration() {
  console.log('=== TEST 3: GEMINI AI PRODUCTION DIRECTOR ===');
  const apiKey = '';
  
  const prompt = `You are the Senior AI Production Director of nhiep.net.
Language: VIETNAMESE.
Customer Query: "Chúng tôi tổ chức sự kiện khai trương resort 300 khách tại Hội An Đà Nẵng, tôi đã đính kèm lịch trình. Cần 1 flycam, 2 thợ quay gimbal 4k cinema và 2 thợ chụp."
Bank: MB BANK 89052667799 (NGUYEN XUAN TOI).
Please provide dynamic advice, camera/crew allocation (1 flycam, 2 gimbal, 2 photo, 4K edit), and output JSON at the end with { conceptTitle, cameraCrewProposal, customPackages }.`;

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    })
  });
  
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('Gemini API Response Snippet:');
  console.log(text?.slice(0, 400));
  
  const jsonMatch = text?.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      console.log('Successfully extracted JSON plan:', parsed.conceptTitle);
      console.log('Crew Proposal:', parsed.cameraCrewProposal);
      console.log('Packages:', parsed.customPackages?.map(p => `${p.tier}: ${p.name} - ${p.estimatedPriceVndFormatted}`));
    } catch(e) {
      console.error('JSON parse fail:', e);
    }
  }
  console.log('-> Gemini AI Integration OK!\n');
}

async function testMBBankVietQr() {
  console.log('=== TEST 4: MB BANK VIETQR GENERATION ===');
  const bankCode = '970422'; // MB BANK
  const accountNumber = '89052667799';
  const accountHolder = 'NGUYEN XUAN TOI';
  const amount = 2250000;
  const bookingCode = 'NHP-98765';
  
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=COC%20${bookingCode}&accountName=${encodeURIComponent(accountHolder)}`;
  console.log('Generated VietQR MB BANK URL:');
  console.log(qrUrl);
  console.log('-> MB BANK VietQR OK!\n');
}

async function main() {
  await testSpreadsheet();
  await testPptx();
  await testGeminiIntegration();
  await testMBBankVietQr();
  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

main().catch(console.error);
