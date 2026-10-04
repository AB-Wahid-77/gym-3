// ============================================================================
// IRONFORGE - Admin Login Screen
// Real admin authentication portal powered by Supabase Auth via Express.
// Includes password visibility toggle, remember me, error handling, and theme toggle.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GYM_CONFIG } from '../config/gymConfig';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Login form state
  // Only pre-fill email if 'ironforge_remembered_email' exists in localStorage
  const [email, setEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('ironforge_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [rememberEmail, setRememberEmail] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email, password);

      // Only save email if user checked the box; otherwise remove any previously saved email
      try {
        if (rememberEmail) {
          localStorage.setItem('ironforge_remembered_email', email.trim());
        } else {
          localStorage.removeItem('ironforge_remembered_email');
        }
      } catch {
        // ignore storage errors
      }

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-txt flex flex-col items-center justify-center p-4 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle theme"
          className="p-2.5 rounded-xl border border-border bg-surface text-txt hover:text-gold-primary transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-gold-primary" /> : <Sun className="w-4 h-4 text-gold-primary" />}
          <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Card Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gold-primary text-black flex items-center justify-center font-black mx-auto shadow-xl shadow-gold-primary/25">
            <Dumbbell className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-txt tracking-wide">
            {GYM_CONFIG.name}
          </h1>
          <p className="text-xs md:text-sm text-txt-muted max-w-xs mx-auto">
            {GYM_CONFIG.tagline} • Admin Console
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-2xl space-y-6">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-primary" />
              <h2 className="font-heading text-lg text-txt">ADMIN SIGN IN</h2>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
              Enter your verified manager credentials to access the gym console.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs md:text-sm">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-txt-muted text-xs">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourgym.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors"
                />
              </div>
            </div>

            {/* Remember my email checkbox */}
            <div className="flex items-center gap-2.5 pt-0.5 pb-1">
              <input
                id="remember-email-checkbox"
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface-2 text-gold-primary accent-[#D4AF37] focus:ring-1 focus:ring-gold-primary cursor-pointer shrink-0"
              />
              <label
                htmlFor="remember-email-checkbox"
                className="text-xs text-txt-muted hover:text-txt cursor-pointer select-none font-medium leading-tight"
              >
                Remember my email on this device
              </label>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-txt-muted text-xs">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gold-primary text-black font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold-primary/20 disabled:opacity-50 cursor-pointer mt-4"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-txt-muted">
          Protected by Supabase Authentication. Only authorized staff have system access.
        </p>
      </div>
    </div>
  );
};
