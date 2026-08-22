import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { ChatAttachment } from '@/types';

export interface ParsedFileResult {
  textContent?: string;
  dataUrl?: string;
  fileExtension: string;
  mimeType: string;
  summary?: string;
}

/**
 * Trích xuất định dạng tệp từ tên tệp
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Định dạng dung lượng tệp
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Phân tích tệp bảng tính (.xlsx, .xls, .ods, .csv)
 */
export async function parseSpreadsheet(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  let output = `[BẢNG TÍNH / KẾ HOẠCH EXCEL / ODS: ${file.name}]\n`;
  output += `Tổng số Sheets: ${workbook.SheetNames.length} (${workbook.SheetNames.join(', ')})\n\n`;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    // Convert sheet to CSV / markdown table
    const csvContent = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csvContent && csvContent.trim()) {
      output += `--- SHEET: [${sheetName}] ---\n`;
      // Take up to 200 lines per sheet
      const lines = csvContent.split('\n').filter((l) => l.trim().length > 0);
      output += lines.slice(0, 150).join('\n');
      if (lines.length > 150) {
        output += `\n... (và ${lines.length - 150} dòng dữ liệu khác)`;
      }
      output += '\n\n';
    }
  }

  return output.trim();
}

/**
 * Phân tích tệp trình chiếu PowerPoint (.pptx)
 */
export async function parsePowerPointPptx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let output = `[TRÌNH CHIẾU POWERPOINT / SLIDE KỊCH BẢN: ${file.name}]\n\n`;

  // Find all slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter((f) => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    return `[Tệp PPTX: ${file.name} - Không tìm thấy slide văn bản]`;
  }

  let slideIndex = 1;
  for (const slidePath of slideFiles) {
    const slideXml = await zip.files[slidePath].async('string');
    // Extract all <a:t>...</a:t> text elements
    const matches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
    if (matches && matches.length > 0) {
      const slideTexts = matches
        .map((m) => m.replace(/<[^>]+>/g, '').trim())
        .filter((t) => t.length > 0);

      if (slideTexts.length > 0) {
        output += `--- SLIDE ${slideIndex} ---\n`;
        output += slideTexts.join(' | ') + '\n\n';
      }
    }
    slideIndex++;
  }

  return output.trim();
}

/**
 * Phân tích tệp Word (.docx)
 */
export async function parseWordDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const docFile = zip.files['word/document.xml'];
  if (!docFile) {
    return `[Tệp Word: ${file.name} - Không thể đọc nội dung XML]`;
  }

  const docXml = await docFile.async('string');
  const paragraphs = docXml.split('</w:p>');
  let extracted: string[] = [];

  for (const p of paragraphs) {
    const textMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (textMatches) {
      const pText = textMatches.map((m) => m.replace(/<[^>]+>/g, '')).join('');
      if (pText.trim()) {
        extracted.push(pText.trim());
      }
    }
  }

  return `[TÀI LIỆU KỊCH BẢN WORD: ${file.name}]\n\n` + extracted.slice(0, 300).join('\n\n');
}

/**
 * Phân tích tệp HTML (.html, .htm)
 */
export function parseHtmlContent(htmlString: string, filename: string): string {
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');

      // Remove scripts, styles, iframes
      const scripts = doc.querySelectorAll('script, style, noscript, svg, iframe');
      scripts.forEach((s) => s.remove());

      const title = doc.title || '';
      const bodyText = doc.body.innerText || doc.body.textContent || '';
      
      // Clean up whitespace
      const cleanBody = bodyText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join('\n');

      return `[TÀI LIỆU WEB / HTML: ${filename}]\nTiêu đề: ${title}\n\n${cleanBody.slice(0, 40000)}`;
    }
  } catch {}

  // Fallback regex strip
  const clean = htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return `[TÀI LIỆU HTML: ${filename}]\n\n${clean.slice(0, 40000)}`;
}

/**
 * Hàm phân tích tổng hợp mọi tệp tin tải lên (Client-side)
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const ext = getFileExtension(file.name);
  const mimeType = file.type || 'application/octet-stream';

  // 1. Spreadsheet formats (.xlsx, .xls, .ods, .csv)
  if (['xlsx', 'xls', 'ods', 'csv'].includes(ext)) {
    try {
      const textContent = await parseSpreadsheet(file);
      const dataUrl = await readFileAsDataUrl(file);
      return {
        textContent,
        dataUrl,
        fileExtension: ext,
        mimeType,
        summary: `Bảng tính ${file.name} (${formatFileSize(file.size)})`
      };
    } catch (err: any) {
      console.warn('Spreadsheet parsing fallback:', err);
    }
  }

  // 2. PowerPoint (.pptx)
  if (['pptx'].includes(ext)) {
    try {
      const textContent = await parsePowerPointPptx(file);
      const dataUrl = await readFileAsDataUrl(file);
      return {
        textContent,
        dataUrl,
        fileExtension: ext,
        mimeType,
        summary: `Trình chiếu PowerPoint ${file.name} (${formatFileSize(file.size)})`
      };
    } catch (err: any) {
      console.warn('PPTX parsing fallback:', err);
    }
  }

  // 3. Word (.docx)
  if (['docx'].includes(ext)) {
    try {
      const textContent = await parseWordDocx(file);
      const dataUrl = await readFileAsDataUrl(file);
      return {
        textContent,
        dataUrl,
        fileExtension: ext,
        mimeType,
        summary: `Văn bản Word ${file.name} (${formatFileSize(file.size)})`
      };
    } catch (err: any) {
      console.warn('Word parsing fallback:', err);
    }
  }

  // 4. HTML (.html, .htm)
  if (['html', 'htm'].includes(ext)) {
    try {
      const rawText = await readFileAsText(file);
      const textContent = parseHtmlContent(rawText, file.name);
      const dataUrl = await readFileAsDataUrl(file);
      return {
        textContent,
        dataUrl,
        fileExtension: ext,
        mimeType: 'text/html',
        summary: `Tệp HTML ${file.name}`
      };
    } catch (err: any) {
      console.warn('HTML parsing fallback:', err);
    }
  }

  // 5. Plain text formats (.txt, .md, .json, .xml)
  if (['txt', 'md', 'json', 'xml'].includes(ext)) {
    try {
      const rawText = await readFileAsText(file);
      const dataUrl = await readFileAsDataUrl(file);
      return {
        textContent: `[TỆP VĂN BẢN: ${file.name}]\n\n${rawText.slice(0, 40000)}`,
        dataUrl,
        fileExtension: ext,
        mimeType: 'text/plain',
        summary: `Văn bản ${file.name}`
      };
    } catch (err: any) {
      console.warn('Text parsing fallback:', err);
    }
  }

  // 6. Image formats (PNG, JPG, JPEG, WEBP, GIF, HEIC)
  if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif'].includes(ext)) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl,
      fileExtension: ext,
      mimeType: file.type || 'image/jpeg',
      summary: `Hình ảnh ${file.name} (${formatFileSize(file.size)})`
    };
  }

  // 7. Audio / Voice recordings (MP3, WAV, M4A, AAC)
  if (file.type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext)) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl,
      fileExtension: ext,
      mimeType: file.type || 'audio/mpeg',
      summary: `Tệp ghi âm giọng nói ${file.name} (${formatFileSize(file.size)})`
    };
  }

  // 8. General fallback
  const dataUrl = await readFileAsDataUrl(file);
  return {
    dataUrl,
    fileExtension: ext,
    mimeType,
    summary: `Tệp đính kèm ${file.name} (${formatFileSize(file.size)})`
  };
}

/**
 * Đọc file dưới dạng Text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string || '');
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Đọc file dưới dạng Data URL (base64)
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
