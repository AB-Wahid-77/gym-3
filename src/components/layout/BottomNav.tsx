// ============================================================================
// IRONFORGE - Mobile Bottom Navigation Bar
// Touch-optimized navigation bar displayed on phone screens.
// ============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardList,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/fees', label: 'Fees', icon: CreditCard },
    { to: '/plans', label: 'Plans', icon: ClipboardList },
  ];

  return (
    <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-3 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-gold-primary font-semibold'
                  : 'text-txt-muted hover:text-txt'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
