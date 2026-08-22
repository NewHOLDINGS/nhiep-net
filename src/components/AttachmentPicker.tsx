'use client';

import React, { useState, useRef } from 'react';
import {
  Paperclip, Image as ImageIcon, FileText, Mic, Cloud, X, Plus,
  Check, Link2, ExternalLink, Table, Presentation, FileCode, Loader2
} from 'lucide-react';
import { ChatAttachment } from '@/types';
import { parseUploadedFile, formatFileSize, getFileExtension } from '@/lib/fileParser';

interface AttachmentPickerProps {
  attachments: ChatAttachment[];
  onAddAttachment: (att: ChatAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  disabled?: boolean;
}

export default function AttachmentPicker({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  disabled = false
}: AttachmentPickerProps) {
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
        title="Đính kèm tệp: Excel (.xlsx, .ods), HTML, CSV, PowerPoint (.pptx), Word, PDF, Ảnh, Voice hoặc Google Drive"
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
            <span>Đính Kèm Tư Liệu Phân Tích AI</span>
            <span className="text-brand text-[9px] font-mono">Tự Động Đọc Dữ Liệu</span>
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
                Bảng tính, Slide & Tài liệu
              </p>
              <p className="text-[10px] text-zinc-400">
                .xlsx, .ods, .html, .csv, .pptx, .docx, .pdf
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
                Ảnh mẫu, Moodboard & Concept
              </p>
              <p className="text-[10px] text-zinc-400">JPG, PNG, WEBP, HEIC</p>
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
                Ghi âm giọng nói / Brief Voice
              </p>
              <p className="text-[10px] text-zinc-400">MP3, WAV, M4A, AAC</p>
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
                Link Thư Mục Google Drive
              </p>
              <p className="text-[10px] text-zinc-400">Folder chứa ảnh mẫu / kịch bản</p>
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
                <h4 className="font-bold text-sm text-white">Thêm Liên Kết Google Drive</h4>
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
                  Đường dẫn liên kết (URL):
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
                  Ghi chú tóm tắt (tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kế hoạch quay hội nghị resort & danh sách cảnh..."
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
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand text-black text-xs font-bold hover:bg-brand-400 shadow-glow"
                >
                  Xác Nhận Đính Kèm
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
  onRemove
}: {
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
}) {
  if (!attachments || attachments.length === 0) return null;

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
                Đã Đọc
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
