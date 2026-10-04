// ============================================================================
// IRONFORGE - Desktop Sidebar Navigation
// Sleek gold-accented sidebar for gym admin with instant screen navigation.
// ============================================================================

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardList,
  LogOut,
  Sun,
  Moon,
  Dumbbell,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGym } from '../../context/GymContext';
import { useTheme } from '../../context/ThemeContext';

export const Sidebar: React.FC = () => {
  const { logout, adminName, adminEmail } = useAuth();
  const { gym, openSettings } = useGym();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/fees', label: 'Fees & Billing', icon: CreditCard },
    { to: '/plans', label: 'Workout Plans', icon: ClipboardList },
  ];

  return (
    <aside className="no-print hidden md:flex flex-col w-64 bg-surface border-r border-border min-h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-gold-primary text-black flex items-center justify-center font-bold shadow-md shadow-gold-primary/20 shrink-0">
          <Dumbbell className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-heading text-lg tracking-wider text-txt truncate">
            {gym.name}
          </h1>
          <p className="text-[10px] text-txt-muted tracking-wider uppercase truncate">
            {gym.tagline || 'Admin Console'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-primary text-black font-semibold shadow-sm shadow-gold-primary/30'
                    : 'text-txt-muted hover:text-txt hover:bg-surface-2'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Gym Settings Button */}
        <button
          onClick={openSettings}
          type="button"
          className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors cursor-pointer text-left"
        >
          <Settings className="w-5 h-5 shrink-0 text-gold-primary" />
          <span>Gym Settings</span>
        </button>
      </nav>

      {/* Footer Controls: Theme Toggle & Admin Profile */}
      <div className="p-4 border-t border-border space-y-3 bg-surface-2/40">
        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle dark/light mode"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border bg-surface text-txt text-xs font-medium hover:border-gold-primary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-gold-primary" /> : <Sun className="w-4 h-4 text-gold-primary" />}
            <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
          </span>
          <span className="text-[11px] text-txt-muted uppercase font-semibold">
            {theme === 'dark' ? 'Gold/Black' : 'Warm Light'}
          </span>
        </button>

        {/* Admin Info & Logout */}
        <div className="pt-2 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-txt truncate">{adminName}</p>
            <p className="text-[11px] text-txt-muted truncate">{adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-lg text-txt-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
