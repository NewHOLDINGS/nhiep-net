'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Locale } from '@/types';
import { MessageCircle } from 'lucide-react';
import AiChatbotModal from './AiChatbotModal';

export default function FloatingContacts({ locale }: { locale: Locale }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="fixed right-4 bottom-20 md:bottom-6 z-40 flex flex-col items-end gap-2.5">
        {/* Zalo Button */}
        <a
          href="https://zalo.me/0932513678"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Chat Zalo 0932513678"
        >
          <span className="font-bold text-xs">Zalo</span>
          <span className="absolute right-14 bg-surface-elevated text-white border border-surface-border text-xs px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Zalo: 0932513678
          </span>
        </a>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/84932513678"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Chat WhatsApp +84932513678"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-14 bg-surface-elevated text-white border border-surface-border text-xs px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            WhatsApp: +84 932 513 678
          </span>
        </a>

        {/* AI nhiep.net Floating Bubble with Logo */}
        <button
          onClick={() => setChatOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-black shadow-glow-lg transition-transform hover:scale-110 border-2 border-brand overflow-visible"
          aria-label="Open AI Assistant"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center p-1 bg-black">
            <Image
              src="/logo.jpg"
              alt="nhiep.net AI"
              width={56}
              height={56}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand text-black font-extrabold text-[8px] items-center justify-center">AI</span>
          </span>
          <span className="absolute right-16 bg-surface-elevated text-brand font-bold border border-brand/40 text-xs px-3 py-1.5 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl flex items-center gap-1.5">
            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
              <Image src="/logo.jpg" alt="Logo" width={16} height={16} className="object-cover" />
            </div>
            <span>Tư vấn AI nhiep.net</span>
          </span>
        </button>
      </div>

      {/* Chatbot Modal */}
      <AiChatbotModal locale={locale} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
