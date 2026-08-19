'use client';

import React, { useState } from 'react';
import { Locale } from '@/types';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import AiChatbotModal from './AiChatbotModal';

export default function FloatingContacts({ locale }: { locale: Locale }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="fixed right-4 bottom-20 md:bottom-6 z-40 flex flex-col items-end gap-2.5">
        {/* Zalo Button */}
        <a
          href="https://zalo.me/0931513678"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Chat Zalo 0931513678"
        >
          <span className="font-bold text-xs">Zalo</span>
          <span className="absolute right-14 bg-surface-elevated text-white border border-surface-border text-xs px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Zalo: 0931.513.678
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

        {/* Gemini AI Floating Bubble */}
        <button
          onClick={() => setChatOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 text-black shadow-glow-lg transition-transform hover:scale-110 border-2 border-amber-200"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-7 h-7 fill-black animate-spin-slow" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white text-black font-extrabold text-[8px] items-center justify-center">AI</span>
          </span>
          <span className="absolute right-16 bg-surface-elevated text-amber-400 font-bold border border-brand/40 text-xs px-3 py-1.5 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>Tư vấn AI Gemini</span>
          </span>
        </button>
      </div>

      {/* Chatbot Modal */}
      <AiChatbotModal locale={locale} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
