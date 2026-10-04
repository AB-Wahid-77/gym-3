import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme, reduceMotion } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-txt transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary overflow-hidden min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={reduceMotion ? { opacity: 0 } : { rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="text-gold-primary"
          >
            <Moon className="w-5 h-5 fill-gold-primary/20" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={reduceMotion ? { opacity: 0 } : { rotate: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { rotate: -90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="text-gold-primary"
          >
            <Sun className="w-5 h-5 fill-gold-primary/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
