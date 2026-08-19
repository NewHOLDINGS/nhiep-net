'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale, ChatMessage } from '@/types';
import { getDictionary } from '@/data/translations';
import { Bot, Send, X, Sparkles, Phone, MessageSquare, ArrowRight, Loader2, User } from 'lucide-react';

export default function AiChatbotModal({
  locale,
  isOpen,
  onClose
}: {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
}) {
  const dict = getDictionary(locale);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: dict.chat.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          recommendedPackages: data.recommendedPackages,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Chat request failed');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Đã xảy ra lỗi kết nối. Vui lòng liên hệ trực tiếp hotline 0932513678 hoặc Zalo 0931513678 để được tư vấn tức thì!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (prompt: string) => {
    handleSend(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[620px] max-h-[90vh] glass-panel bg-surface-card rounded-2xl border border-brand/40 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-surface-elevated via-surface-card to-brand/10 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 text-black flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                {dict.chat.widgetTitle}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-zinc-400">{dict.chat.onlineStatus}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-brand/20 border border-brand/40 text-brand flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand text-black font-medium rounded-tr-none shadow-glow'
                    : 'bg-surface-elevated text-zinc-200 border border-surface-border rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert prose-xs">
                  {msg.content}
                </div>

                {/* Recommended Packages Cards if any */}
                {msg.recommendedPackages && msg.recommendedPackages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-border space-y-2">
                    <p className="font-bold text-[11px] text-brand uppercase tracking-wider">
                      Gợi ý gói phù hợp:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.recommendedPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-surface-border hover:border-brand/50 transition-colors"
                        >
                          <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                            <Image src={pkg.imageUrl} alt={pkg.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-white truncate">{pkg.name}</h5>
                            <p className="text-[11px] font-extrabold text-brand">{pkg.price}</p>
                          </div>
                          <Link
                            href={`/${locale}/booking?package=${pkg.id}`}
                            onClick={onClose}
                            className="px-2.5 py-1 rounded bg-brand text-black font-bold text-[10px] hover:bg-brand-400 shrink-0 flex items-center gap-1"
                          >
                            <span>Đặt</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-1 text-[9px] opacity-60 text-right">{msg.timestamp}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs pl-9">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Trợ lý AI đang tra cứu dữ liệu...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-3 py-2 bg-surface border-t border-surface-border flex gap-1.5 overflow-x-auto no-scrollbar">
          {[dict.chat.chip1, dict.chat.chip2, dict.chat.chip3, dict.chat.chip4].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 rounded-full bg-surface-muted hover:bg-surface-elevated border border-surface-border text-[10px] font-medium text-zinc-300 hover:text-brand hover:border-brand/40 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-surface-card border-t border-surface-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={dict.chat.inputPlaceholder}
              className="flex-1 bg-surface-muted border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-brand text-black font-bold hover:bg-brand-400 disabled:opacity-40 disabled:hover:bg-brand transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
            <span>{dict.chat.directHotline} <a href="tel:0932513678" className="text-brand font-bold">0932.513.678</a></span>
            <span className="text-zinc-500">Zalo: 0931.513.678</span>
          </div>
        </div>
      </div>
    </div>
  );
}
