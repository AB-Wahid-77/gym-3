// ============================================================================
// IRONFORGE - Dynamic Gym Context
// Fetches the active gym's branding (name, address, phone, tagline, currency)
// directly from Supabase via Express GET /api/gym/me for multi-tenant isolation.
// Replaces static GYM_CONFIG everywhere across the application.
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_GYM_CONFIG, GymConfig } from '../config/gymConfig';

export interface GymData {
  id?: string;
  name: string;
  address: string;
  phone: string;
  adminEmail?: string;
  tagline: string;
  currency: {
    symbol: string;
    code: string;
  };
  defaultMonthlyFee: number;
}

interface GymContextType {
  gym: GymData;
  isLoading: boolean;
  refreshGym: () => Promise<void>;
  updateGym: (updated: Partial<GymData>) => Promise<boolean>;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [gym, setGym] = useState<GymData>(() => ({
    name: DEFAULT_GYM_CONFIG.name,
    address: DEFAULT_GYM_CONFIG.address,
    phone: DEFAULT_GYM_CONFIG.phone,
    tagline: DEFAULT_GYM_CONFIG.tagline,
    currency: DEFAULT_GYM_CONFIG.currency,
    defaultMonthlyFee: DEFAULT_GYM_CONFIG.defaultMonthlyFee,
  }));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const fetchGym = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const activeToken = token || localStorage.getItem('ironforge_session_token');
      if (!activeToken) return;

      const res = await fetch('/api/gym/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setGym({
          id: data.id,
          name: data.name || DEFAULT_GYM_CONFIG.name,
          address: data.address !== undefined ? data.address : '',
          phone: data.phone !== undefined ? data.phone : '',
          adminEmail: data.adminEmail || '',
          tagline: data.tagline || DEFAULT_GYM_CONFIG.tagline,
          currency: {
            symbol: data.currencySymbol || DEFAULT_GYM_CONFIG.currency.symbol,
            code: data.currency || DEFAULT_GYM_CONFIG.currency.code,
          },
          defaultMonthlyFee: DEFAULT_GYM_CONFIG.defaultMonthlyFee,
        });
      }
    } catch (err) {
      console.warn('Failed to load gym info:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGym();
    } else {
      // Reset to default on unauthenticated
      setGym({
        name: DEFAULT_GYM_CONFIG.name,
        address: DEFAULT_GYM_CONFIG.address,
        phone: DEFAULT_GYM_CONFIG.phone,
        tagline: DEFAULT_GYM_CONFIG.tagline,
        currency: DEFAULT_GYM_CONFIG.currency,
        defaultMonthlyFee: DEFAULT_GYM_CONFIG.defaultMonthlyFee,
      });
    }
  }, [isAuthenticated, fetchGym]);

  const updateGym = async (updated: Partial<GymData>): Promise<boolean> => {
    try {
      const activeToken = token || localStorage.getItem('ironforge_session_token');
      const res = await fetch('/api/gym/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update gym profile');
      }

      const data = await res.json();
      setGym((prev) => ({
        ...prev,
        name: data.name || prev.name,
        address: data.address !== undefined ? data.address : prev.address,
        phone: data.phone !== undefined ? data.phone : prev.phone,
        tagline: data.tagline !== undefined ? data.tagline : prev.tagline,
      }));
      return true;
    } catch (err: any) {
      console.error('Update gym error:', err);
      throw err;
    }
  };

  return (
    <GymContext.Provider
      value={{
        gym,
        isLoading,
        refreshGym: fetchGym,
        updateGym,
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
