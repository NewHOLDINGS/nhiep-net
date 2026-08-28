'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { Locale } from '@/types';

interface VoiceInputButtonProps {
  locale: Locale;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInputButton({
  locale,
  onTranscript,
  disabled = false
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Select speech language according to active locale
      let lang = 'vi-VN';
      if (locale === 'en') lang = 'en-US';
      if (locale === 'zh') lang = 'zh-CN';
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText(
          locale === 'zh'
            ? '正在聆听您的语音...'
            : locale === 'en'
            ? 'Listening to your voice...'
            : 'Đang lắng nghe giọng nói...'
        );
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          } else {
            currentTranscript += event.results[i][0].transcript;
          }
        }

        if (currentTranscript.trim()) {
          onTranscript(currentTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event warning:', event.error);
        if (event.error === 'not-allowed') {
          alert(
            locale === 'zh'
              ? '请在浏览器中允许麦克风权限以使用语音输入功能。'
              : locale === 'en'
              ? 'Please allow Microphone access in your browser to use voice input.'
              : 'Vui lòng cấp quyền Micro trong trình duyệt để sử dụng tính năng nhập bằng giọng nói.'
          );
        }
        setIsListening(false);
        setStatusText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusText('');
      };

      recognition.ref = recognition;
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition initialization error:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [locale, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert(
        locale === 'zh'
          ? '您的浏览器暂不支持 Web Speech API，请使用 Chrome、Safari 或 Edge。'
          : locale === 'en'
          ? 'Your browser does not support Web Speech API. Please use Chrome, Safari, or Edge.'
          : 'Trình duyệt của bạn chưa hỗ trợ Web Speech API. Vui lòng sử dụng Chrome, Safari hoặc Edge.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      setStatusText('');
    } else {
      try {
        let lang = 'vi-VN';
        if (locale === 'en') lang = 'en-US';
        if (locale === 'zh') lang = 'zh-CN';
        if (recognitionRef.current) {
          recognitionRef.current.lang = lang;
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={
          isListening
            ? locale === 'zh'
              ? '停止语音识别'
              : locale === 'en'
              ? 'Stop Voice Recognition'
              : 'Dừng nhận diện giọng nói'
            : locale === 'zh'
            ? '语音输入 (Gemini Voice)'
            : locale === 'en'
            ? 'Voice Input (Gemini Voice)'
            : 'Nhập bằng giọng nói (Gemini Voice Input)'
        }
        className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
          isListening
            ? 'bg-red-500/20 text-red-400 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105'
            : 'bg-surface-muted hover:bg-surface-elevated text-zinc-400 hover:text-brand border border-surface-border hover:border-brand/40'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        {isListening ? (
          <div className="flex items-center gap-1.5">
            <MicOff className="w-4 h-4 animate-pulse text-red-400" />
            <span className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-full bg-red-400 animate-[bounce_0.8s_infinite_100ms] rounded-full" />
              <span className="w-0.5 h-full bg-red-400 animate-[bounce_0.8s_infinite_200ms] rounded-full" />
              <span className="w-0.5 h-full bg-red-400 animate-[bounce_0.8s_infinite_300ms] rounded-full" />
            </span>
          </div>
        ) : (
          <Mic className="w-4 h-4" />
        )}

        {/* Gemini AI Sparkle indicator */}
        {!isListening && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand animate-ping opacity-75" />
        )}
      </button>

      {/* Floating Status Notification when Listening */}
      {isListening && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-surface-elevated/95 border border-red-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap text-[11px] text-zinc-200 z-30 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-medium text-white">{statusText}</span>
          <span className="text-zinc-400 text-[10px]">
            {locale === 'zh'
              ? '(点击麦克风结束)'
              : locale === 'en'
              ? '(Click mic to finish)'
              : '(Bấm micro để kết thúc)'}
          </span>
        </div>
      )}
    </div>
  );
}
