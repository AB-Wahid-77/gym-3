// ============================================================================
// IRONFORGE - Application Layout
// Clean layout for the gym admin: Sidebar on desktop, Bottom Nav on mobile.
// ============================================================================

import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Dumbbell, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useGym } from '../../context/GymContext';
import { useTheme } from '../../context/ThemeContext';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { gym, openSettings } = useGym();
  const { theme, toggleTheme } = useTheme();

  // If not logged in as admin, redirect to login screen
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-txt flex flex-col md:flex-row relative">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        {/* Mobile Top Header (only on phone screens, hidden on desktop) */}
        <header className="no-print md:hidden h-16 px-4 bg-surface border-b border-border flex items-center justify-between sticky top-0 z-30">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-primary text-black flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="font-heading text-sm text-txt tracking-wide">
              {gym.name}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={openSettings}
              className="p-2 rounded-lg border border-border bg-surface-2 text-txt hover:text-gold-primary transition-colors cursor-pointer"
              title="Gym Settings"
              aria-label="Gym Settings"
            >
              <Settings className="w-4 h-4 text-gold-primary" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border bg-surface-2 text-txt hover:text-gold-primary transition-colors cursor-pointer"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg border border-border bg-surface-2 text-txt-muted hover:text-rose-500 transition-colors cursor-pointer"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 px-4 md:px-8 pt-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
