'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser, SavedAiQuote } from '@/types';

interface AuthContextType {
  user: CustomerUser | null;
  login: (name: string, phone: string, email?: string, address?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  savedQuotes: SavedAiQuote[];
  saveQuote: (quote: Omit<SavedAiQuote, 'id' | 'createdAt'>) => void;
  deleteQuote: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedAiQuote[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('nhiep_customer_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedQ = localStorage.getItem('nhiep_saved_quotes');
      if (savedQ) {
        setSavedQuotes(JSON.parse(savedQ));
      }
    } catch (e) {
      console.error('Failed to load user state', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        if (user) {
          localStorage.setItem('nhiep_customer_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('nhiep_customer_user');
        }
      } catch (e) {
        console.error('Failed to save user state', e);
      }
    }
  }, [user, isInitialized]);

  // Save quotes to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('nhiep_saved_quotes', JSON.stringify(savedQuotes));
      } catch (e) {
        console.error('Failed to save quotes', e);
      }
    }
  }, [savedQuotes, isInitialized]);

  const login = (name: string, phone: string, email?: string, address?: string) => {
    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      zalo: phone.trim(),
      address: address?.trim(),
      loggedInAt: new Date().toISOString()
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const saveQuote = (quote: Omit<SavedAiQuote, 'id' | 'createdAt'>) => {
    const newQuote: SavedAiQuote = {
      ...quote,
      id: `quote-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('vi-VN')
    };
    setSavedQuotes((prev) => [newQuote, ...prev]);
  };

  const deleteQuote = (id: string) => {
    setSavedQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        savedQuotes,
        saveQuote,
        deleteQuote
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
