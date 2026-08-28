'use client';

import React, { useState, useRef } from 'react';
import {
  Paperclip, Image as ImageIcon, FileText, Mic, Cloud, X, Plus,
  Check, Link2, ExternalLink, Table, Presentation, FileCode, Loader2
} from 'lucide-react';
import { Locale, ChatAttachment } from '@/types';
import { parseUploadedFile, formatFileSize, getFileExtension } from '@/lib/fileParser';

interface AttachmentPickerProps {
  attachments: ChatAttachment[];
  onAddAttachment: (att: ChatAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  disabled?: boolean;
  locale?: Locale;
}

const I18N_ATTACH = {
  vi: {
    btnTitle: 'Đính kèm tệp: Excel (.xlsx, .ods), HTML, CSV, PowerPoint (.pptx), Word, PDF, Ảnh, Voice hoặc Google Drive',
    menuHeader: 'Đính Kèm Tư Liệu Phân Tích AI',
    menuSub: 'Tự Động Đọc Dữ Liệu',
    docsTitle: 'Bảng tính, Slide & Tài liệu',
    docsDesc: '.xlsx, .ods, .html, .csv, .pptx, .docx, .pdf',
    imagesTitle: 'Ảnh mẫu, Moodboard & Concept',
    imagesDesc: 'JPG, PNG, WEBP, HEIC',
    voiceTitle: 'Ghi âm giọng nói / Brief Voice',
    voiceDesc: 'MP3, WAV, M4A, AAC',
    driveTitle: 'Link Thư Mục Google Drive',
    driveDesc: 'Folder chứa ảnh mẫu / kịch bản',
    driveModalTitle: 'Thêm Liên Kết Google Drive',
    urlLabel: 'Đường dẫn liên kết (URL):',
    noteLabel: 'Ghi chú tóm tắt (tùy chọn):',
    notePlaceholder: 'Ví dụ: Kế hoạch quay hội nghị resort & danh sách cảnh...',
    cancelBtn: 'Hủy',
    confirmBtn: 'Xác Nhận Đính Kèm',
    parsedBadge: 'Đã Đọc'
  },
  en: {
    btnTitle: 'Attach files: Excel (.xlsx, .ods), HTML, CSV, PowerPoint (.pptx), Word, PDF, Images, Audio, or Google Drive',
    menuHeader: 'Attach Project Files for AI Analysis',
    menuSub: 'Auto Data Extraction',
    docsTitle: 'Spreadsheets, Slides & Docs',
    docsDesc: '.xlsx, .ods, .html, .csv, .pptx, .docx, .pdf',
    imagesTitle: 'Concept Images & Moodboards',
    imagesDesc: 'JPG, PNG, WEBP, HEIC',
    voiceTitle: 'Voice Recordings / Audio Briefs',
    voiceDesc: 'MP3, WAV, M4A, AAC',
    driveTitle: 'Google Drive Folder Link',
    driveDesc: 'Folder containing concept media or scripts',
    driveModalTitle: 'Add Google Drive Link',
    urlLabel: 'Folder / File URL:',
    noteLabel: 'Brief Note (Optional):',
    notePlaceholder: 'e.g. Resort conference schedule & scene checklist...',
    cancelBtn: 'Cancel',
    confirmBtn: 'Attach Link',
    parsedBadge: 'Parsed'
  },
  zh: {
    btnTitle: '添加附件：Excel (.xlsx, .ods)、HTML、CSV、PowerPoint (.pptx)、Word、PDF、图片、录音或云盘链接',
    menuHeader: '上传策划文件由 AI 深度解析',
    menuSub: '自动提取数据',
    docsTitle: '数据表格、幻灯片与文档',
    docsDesc: '.xlsx, .ods, .html, .csv, .pptx, .docx, .pdf',
    imagesTitle: '参考图片、情绪板与灵感图',
    imagesDesc: 'JPG, PNG, WEBP, HEIC',
    voiceTitle: '语音录音 / 需求音频',
    voiceDesc: 'MP3, WAV, M4A, AAC',
    driveTitle: 'Google Drive / 云盘链接',
    driveDesc: '存放参考图片或剧本的文件夹',
    driveModalTitle: '添加 Google Drive / 云盘链接',
    urlLabel: '链接地址 (URL)：',
    noteLabel: '简要备注（可选）：',
    notePlaceholder: '例如：度假村会议日程与拍摄清单...',
    cancelBtn: '取消',
    confirmBtn: '确认添加',
    parsedBadge: '已提取'
  }
};

export default function AttachmentPicker({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  disabled = false,
  locale = 'vi'
}: AttachmentPickerProps) {
  const t = I18N_ATTACH[locale] || I18N_ATTACH.vi;
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [driveNoteInput, setDriveNoteInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'doc' | 'audio') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsing(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const parsed = await parseUploadedFile(file);

        const newAttachment: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type,
          name: file.name,
          size: formatFileSize(file.size),
          dataUrl: parsed.dataUrl,
          textContent: parsed.textContent,
          fileExtension: parsed.fileExtension,
          mimeType: parsed.mimeType
        };

        onAddAttachment(newAttachment);
      }
    } catch (err) {
      console.error('File parse error:', err);
    } finally {
      setIsParsing(false);
      e.target.value = '';
      setIsOpenMenu(false);
    }
  };

  const handleSaveDriveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrlInput.trim()) return;

    const newAttachment: ChatAttachment = {
      id: `drive-${Date.now()}`,
      type: 'drive',
      name: driveNoteInput.trim() ? `Drive: ${driveNoteInput.trim()}` : `Google Drive / Cloud Folder`,
      url: driveUrlInput.trim(),
      dataUrl: driveUrlInput.trim()
    };

    onAddAttachment(newAttachment);
    setDriveUrlInput('');
    setDriveNoteInput('');
    setIsDriveModalOpen(false);
    setIsOpenMenu(false);
  };

  return (
    <div className="relative">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileChange(e, 'image')}
        accept="image/png,image/jpeg,image/webp,image/gif,image/heic,image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={(e) => handleFileChange(e, 'doc')}
        accept=".xlsx,.xls,.ods,.csv,.html,.htm,.pptx,.ppt,.docx,.doc,.pdf,.txt,.json,.xml"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={(e) => handleFileChange(e, 'audio')}
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
        multiple
        className="hidden"
      />

      {/* Main Attachment Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpenMenu(!isOpenMenu)}
        disabled={disabled || isParsing}
        title={t.btnTitle}
        className={`p-2.5 rounded-xl transition-colors flex items-center justify-center ${
          isOpenMenu || attachments.length > 0
            ? 'bg-brand/20 text-brand border border-brand/50 shadow-glow'
            : 'bg-surface-muted hover:bg-surface-elevated text-zinc-400 hover:text-zinc-200 border border-surface-border hover:border-brand/40'
        } disabled:opacity-40`}
      >
        {isParsing ? (
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
        ) : (
          <Paperclip className="w-4 h-4" />
        )}
      </button>

      {/* Attachment Menu Dropdown */}
      {isOpenMenu && (
        <div className="absolute bottom-12 left-0 w-80 glass-panel bg-surface-card rounded-2xl border border-surface-border p-2.5 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-surface-border/50 flex items-center justify-between">
            <span>{t.menuHeader}</span>
            <span className="text-brand text-[9px] font-mono">{t.menuSub}</span>
          </div>

          {/* 1. Spreadsheets & Presentations & Documents (.xlsx, .ods, .html, .csv, .pptx) */}
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-surface-elevated hover:text-brand transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-brand transition-colors">
                {t.docsTitle}
              </p>
              <p className="text-[10px] text-zinc-400">
                {t.docsDesc}
              </p>
            </div>
          </button>

          {/* 2. Image Upload */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-surface-elevated hover:text-brand transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-brand transition-colors">
                {t.imagesTitle}
              </p>
              <p className="text-[10px] text-zinc-400">{t.imagesDesc}</p>
            </div>
          </button>

          {/* 3. Audio / Voice Recording Upload */}
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-surface-elevated hover:text-brand transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-brand transition-colors">
                {t.voiceTitle}
              </p>
              <p className="text-[10px] text-zinc-400">{t.voiceDesc}</p>
            </div>
          </button>

          {/* 4. Google Drive Link */}
          <button
            type="button"
            onClick={() => {
              setIsDriveModalOpen(true);
              setIsOpenMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-surface-elevated hover:text-brand transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-brand transition-colors">
                {t.driveTitle}
              </p>
              <p className="text-[10px] text-zinc-400">{t.driveDesc}</p>
            </div>
          </button>
        </div>
      )}

      {/* Google Drive Link Input Modal */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel bg-surface-card rounded-2xl border border-brand/50 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-brand" />
                <h4 className="font-bold text-sm text-white">{t.driveModalTitle}</h4>
              </div>
              <button
                onClick={() => setIsDriveModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDriveLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t.urlLabel}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={driveUrlInput}
                  onChange={(e) => setDriveUrlInput(e.target.value)}
                  className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t.noteLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.notePlaceholder}
                  value={driveNoteInput}
                  onChange={(e) => setDriveNoteInput(e.target.value)}
                  className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface-elevated text-zinc-300 text-xs font-medium hover:text-white"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand text-black text-xs font-bold hover:bg-brand-400 shadow-glow"
                >
                  {t.confirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hiển thị danh sách các tệp đính kèm bên trên thanh input
 */
export function AttachmentListPreview({
  attachments,
  onRemove,
  locale = 'vi'
}: {
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
  locale?: Locale;
}) {
  if (!attachments || attachments.length === 0) return null;
  const badgeText = locale === 'zh' ? '已提取' : locale === 'en' ? 'Parsed' : 'Đã Đọc';

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
      {attachments.map((att) => {
        const ext = att.fileExtension || getFileExtension(att.name);
        const isSpreadsheet = ['xlsx', 'xls', 'ods', 'csv'].includes(ext);
        const isPresentation = ['pptx', 'ppt'].includes(ext);
        const isHtml = ['html', 'htm'].includes(ext);
        const isDoc = ['docx', 'doc', 'pdf', 'txt'].includes(ext);

        return (
          <div
            key={att.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-elevated border border-brand/40 text-[11px] text-zinc-200 shrink-0 shadow-sm animate-in fade-in"
          >
            {att.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
            {att.type === 'audio' && <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            {att.type === 'drive' && <Cloud className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
            {att.type === 'doc' && isSpreadsheet && <Table className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            {att.type === 'doc' && isPresentation && <Presentation className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
            {att.type === 'doc' && isHtml && <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            {att.type === 'doc' && !isSpreadsheet && !isPresentation && !isHtml && (
              <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}

            <span className="font-medium max-w-[150px] truncate">{att.name}</span>
            {att.size && <span className="text-[9px] text-zinc-400">({att.size})</span>}
            {att.textContent && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {badgeText}
              </span>
            )}

            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="p-0.5 ml-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-surface-muted transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
