// ============================================================================
// IRONFORGE - Super Admin Console: Registered Gyms & Provisioning
// Obscure, unlinked route for managing multi-tenant gym workspaces.
// Strictly protected by SUPER_ADMIN_SECRET checked on the Express backend.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
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
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Building2,
  RefreshCw,
  Users,
  Calendar,
  Phone,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GYM_CONFIG } from '../config/gymConfig';

interface RegisteredGym {
  id: string;
  name: string;
  address: string;
  phone: string;
  adminEmail: string;
  createdAt: string;
  memberCount: number;
}

export const ProvisionGymPage: React.FC = () => {
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Super Admin Secret state (persisted in session storage for convenience)
  const [superAdminSecret, setSuperAdminSecret] = useState<string>(() => {
    try {
      return sessionStorage.getItem('ironforge_super_admin_key') || '';
    } catch {
      return '';
    }
  });
  const [showSuperAdminSecret, setShowSuperAdminSecret] = useState<boolean>(false);
  const [isKeyVerified, setIsKeyVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Registered gyms state
  const [gyms, setGyms] = useState<RegisteredGym[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = useState<boolean>(false);
  const [gymSearchQuery, setGymSearchQuery] = useState<string>('');

  // Provisioning form state
  const [gymName, setGymName] = useState<string>('');
  const [gymAddress, setGymAddress] = useState<string>('');
  const [gymPhone, setGymPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Feedback notifications
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch registered gyms from backend using the Super Admin key
  const fetchRegisteredGyms = useCallback(async (keyToUse: string): Promise<boolean> => {
    const cleanKey = keyToUse.trim();
    if (!cleanKey) {
      setErrorMessage('Super Admin Key is required.');
      return false;
    }

    setIsLoadingGyms(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/super-admin/gyms', {
        headers: {
          'x-super-admin-secret': cleanKey,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Not authorized. Invalid Super Admin Key.');
      }

      const data: RegisteredGym[] = await response.json();
      setGyms(data);
      setIsKeyVerified(true);

      try {
        sessionStorage.setItem('ironforge_super_admin_key', cleanKey);
      } catch {
        // ignore storage errors
      }

      return true;
    } catch (err: any) {
      setIsKeyVerified(false);
      setGyms([]);
      setErrorMessage(err.message || 'Not authorized. Please verify your Super Admin Key.');
      return false;
    } finally {
      setIsLoadingGyms(false);
    }
  }, []);

  // Attempt auto-verification on mount if key was already saved in session
  useEffect(() => {
    if (superAdminSecret) {
      fetchRegisteredGyms(superAdminSecret);
    }
  }, [fetchRegisteredGyms]);

  // Handle manual unlock button
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setInfoMessage('');
    const success = await fetchRegisteredGyms(superAdminSecret);
    if (success) {
      setInfoMessage('Super Admin Key verified. Console unlocked.');
    }
    setIsVerifying(false);
  };

  // Handle Lock / Reset Key
  const handleLockConsole = () => {
    setIsKeyVerified(false);
    setSuperAdminSecret('');
    setGyms([]);
    setInfoMessage('');
    setErrorMessage('');
    try {
      sessionStorage.removeItem('ironforge_super_admin_key');
    } catch {
      // ignore
    }
  };

  // Handle New Gym Provisioning Submission
  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!superAdminSecret.trim()) {
      setErrorMessage('Super Admin Key is strictly required to provision a gym.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signup({
        gymName: gymName.trim(),
        gymAddress: gymAddress.trim(),
        gymPhone: gymPhone.trim(),
        email: email.trim(),
        password,
        superAdminSecret: superAdminSecret.trim(),
      });

      setInfoMessage(
        result.message ||
          `Workspace "${gymName.trim()}" successfully provisioned and ready for administrator sign-in.`
      );

      // Reset form fields
      setGymName('');
      setGymAddress('');
      setGymPhone('');
      setEmail('');
      setPassword('');

      // Auto-reload the registered gyms list so the new gym immediately appears at the top
      await fetchRegisteredGyms(superAdminSecret);
    } catch (err: any) {
      setErrorMessage(err.message || 'Not authorized. Please verify your Super Admin Key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered gyms
  const filteredGyms = gyms.filter((g) => {
    if (!gymSearchQuery.trim()) return true;
    const q = gymSearchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.adminEmail.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      g.address.toLowerCase().includes(q)
    );
  });

  const totalMembersAcrossGyms = gyms.reduce((acc, g) => acc + (g.memberCount || 0), 0);

  return (
    <div className="min-h-screen bg-bg text-txt flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
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

      <div className="w-full max-w-5xl space-y-6 pt-4">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gold-primary text-black flex items-center justify-center font-black mx-auto shadow-xl shadow-gold-primary/25">
            <Dumbbell className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-txt tracking-wide">
            {GYM_CONFIG.name}
          </h1>
          <p className="text-xs md:text-sm text-txt-muted max-w-sm mx-auto">
            Super Admin Portal • Centralized Facility Provisioning & Registry
          </p>
        </div>

        {/* Global Notifications */}
        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs md:text-sm flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs md:text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GATE: If Super Admin Key is NOT yet verified                       */}
        {/* ------------------------------------------------------------------ */}
        {!isKeyVerified ? (
          <div className="max-w-md mx-auto p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-2xl space-y-6 animate-fadeIn">
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-gold-primary" />
                <h2 className="font-heading text-lg text-txt">
                  SUPER ADMIN AUTHENTICATION
                </h2>
              </div>
              <p className="text-xs text-txt-muted mt-1">
                Enter your server-side secret key to unlock registered gym workspaces and provision new facilities.
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-2 border border-gold-primary/30 space-y-2">
                <label className="flex items-center gap-1.5 font-bold text-gold-primary text-xs uppercase tracking-wider">
                  <KeyRound className="w-4 h-4" />
                  <span>Super Admin Key *</span>
                </label>
                <div className="relative">
                  <input
                    type={showSuperAdminSecret ? 'text' : 'password'}
                    required
                    value={superAdminSecret}
                    onChange={(e) => setSuperAdminSecret(e.target.value)}
                    placeholder="Enter backend SUPER_ADMIN_SECRET"
                    className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-surface border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuperAdminSecret(!showSuperAdminSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt cursor-pointer"
                    tabIndex={-1}
                  >
                    {showSuperAdminSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-txt-muted">
                  Checked against process.env.SUPER_ADMIN_SECRET before unlocking workspace data.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !superAdminSecret.trim()}
                className="w-full py-3 rounded-xl bg-gold-primary text-black font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold-primary/20 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Secret...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Unlock Super Admin Console</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* UNLOCKED: Show Super Admin Status, Registered Gyms & Provision Form */
          /* ------------------------------------------------------------------ */
          <div className="space-y-6 animate-fadeIn">
            {/* Authenticated Header Bar */}
            <div className="p-4 rounded-2xl bg-surface border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      Super Admin Authenticated
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-txt-muted font-mono">
                    SUPER_ADMIN_SECRET active • Direct PostgreSQL service-role bypass
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchRegisteredGyms(superAdminSecret)}
                  disabled={isLoadingGyms}
                  className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-txt hover:text-gold-primary hover:border-gold-primary/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reload registered gyms"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGyms ? 'animate-spin text-gold-primary' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleLockConsole}
                  className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-rose-500/15 text-txt-muted hover:text-rose-400 border border-border text-xs font-semibold transition-colors cursor-pointer"
                  title="Lock console and clear session key"
                >
                  Lock Console
                </button>
              </div>
            </div>

            {/* SECTION 1: Registered Gyms Section */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-gold-primary" />
                    <h2 className="font-heading text-lg md:text-xl text-txt">
                      REGISTERED GYMS
                    </h2>
                  </div>
                  <p className="text-xs text-txt-muted mt-1">
                    <strong className="text-gold-primary font-mono">{gyms.length}</strong> {gyms.length === 1 ? 'gym' : 'gyms'} registered •{' '}
                    <strong className="text-txt font-mono">{totalMembersAcrossGyms}</strong> total athletes across all facilities
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search filter */}
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                    <input
                      type="text"
                      value={gymSearchQuery}
                      onChange={(e) => setGymSearchQuery(e.target.value)}
                      placeholder="Filter gyms..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchRegisteredGyms(superAdminSecret)}
                    disabled={isLoadingGyms}
                    className="p-2 rounded-xl bg-surface-2 border border-border text-txt hover:text-gold-primary transition-colors cursor-pointer"
                    title="Refresh gym list"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingGyms ? 'animate-spin text-gold-primary' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Gyms Table / List */}
              {isLoadingGyms && gyms.length === 0 ? (
                <div className="py-12 text-center text-txt-muted text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-gold-primary" />
                  <span>Loading registered gym workspaces...</span>
                </div>
              ) : filteredGyms.length === 0 ? (
                <div className="py-12 text-center text-txt-muted space-y-2">
                  <Building2 className="w-8 h-8 text-txt-muted/50 mx-auto" />
                  <p className="text-xs">
                    {gymSearchQuery ? 'No gyms match your filter.' : 'No gyms registered in the database yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-2 text-txt-muted font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Gym Name</th>
                        <th className="py-3 px-4">Admin Email</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4 text-center">Members</th>
                        <th className="py-3 px-4">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredGyms.map((gymItem) => {
                        const dateFormatted = gymItem.createdAt
                          ? new Date(gymItem.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—';

                        return (
                          <tr key={gymItem.id} className="hover:bg-surface-2/50 transition-colors">
                            {/* Gym Name & Address */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-txt flex items-center gap-2">
                                <Dumbbell className="w-3.5 h-3.5 text-gold-primary shrink-0" />
                                <span>{gymItem.name}</span>
                              </div>
                              {gymItem.address && (
                                <p className="text-[11px] text-txt-muted mt-0.5 truncate max-w-xs">
                                  {gymItem.address}
                                </p>
                              )}
                            </td>

                            {/* Admin Email */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-txt">
                                <Mail className="w-3.5 h-3.5 text-txt-muted shrink-0" />
                                <span className="font-mono text-xs">{gymItem.adminEmail || '—'}</span>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-txt-muted">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-mono text-xs">{gymItem.phone || '—'}</span>
                              </div>
                            </td>

                            {/* Member Count */}
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-primary/10 text-gold-primary font-bold font-mono text-xs border border-gold-primary/20">
                                <Users className="w-3 h-3" />
                                <span>{gymItem.memberCount}</span>
                              </span>
                            </td>

                            {/* Created Date */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-txt-muted text-xs">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <span>{dateFormatted}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 2: Provision New Gym Form */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-2xl space-y-6">
              <div className="border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-gold-primary" />
                  <h2 className="font-heading text-lg md:text-xl text-txt">
                    PROVISION NEW GYM WORKSPACE
                  </h2>
                </div>
                <p className="text-xs text-txt-muted mt-1">
                  Initializes an isolated tenant workspace in Supabase and generates owner credentials.
                </p>
              </div>

              <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gym Name */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-txt-muted text-xs">
                      Gym Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type="text"
                        required
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder="e.g. IronForge Club Lahore"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Gym Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-txt-muted text-xs">
                      Gym Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={gymPhone}
                      onChange={(e) => setGymPhone(e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Gym Physical Address */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-txt-muted text-xs">
                    Gym Physical Address
                  </label>
                  <input
                    type="text"
                    value={gymAddress}
                    onChange={(e) => setGymAddress(e.target.value)}
                    placeholder="e.g. Sector F-7 Markaz, Islamabad, Pakistan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Admin Email */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-txt-muted text-xs">
                      Owner / Administrator Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@newgym.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Admin Password */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-txt-muted text-xs">
                      Administrator Initial Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
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
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gold-primary text-black font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold-primary/20 disabled:opacity-50 cursor-pointer mt-3"
                >
                  <span>{isSubmitting ? 'Provisioning Workspace...' : 'Authorize & Provision Gym'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-txt-muted pb-8">
          Super Admin Restricted Portal. All provisioned records are isolated under unique tenant IDs.
        </p>
      </div>
    </div>
  );
};
