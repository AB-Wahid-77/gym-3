// ============================================================================
// IRONFORGE - Gym Settings Modal
// Allows the authenticated gym admin to manage their dynamic gym workspace:
// Name, Physical Address, Phone number, and Brand Tagline.
// Changes are stored in Supabase `gyms` table via PUT /api/gym/me.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useGym } from '../context/GymContext';

export const GymSettingsModal: React.FC = () => {
  const { gym, isSettingsOpen, closeSettings, updateGym } = useGym();

  const [name, setName] = useState(gym.name || '');
  const [address, setAddress] = useState(gym.address || '');
  const [phone, setPhone] = useState(gym.phone || '');
  const [tagline, setTagline] = useState(gym.tagline || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isSettingsOpen) {
      setName(gym.name || '');
      setAddress(gym.address || '');
      setPhone(gym.phone || '');
      setTagline(gym.tagline || '');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isSettingsOpen, gym]);

  if (!isSettingsOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      await updateGym({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        tagline: tagline.trim(),
      });
      setSuccessMsg('Gym profile updated successfully!');
      setTimeout(() => {
        closeSettings();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update gym profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-primary/15 text-gold-primary border border-gold-primary/30 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-base md:text-lg text-txt tracking-wide">
                GYM SETTINGS & BRANDING
              </h2>
              <p className="text-xs text-txt-muted">
                Manage your gym workspace details and printable document headers
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            type="button"
            className="p-2 rounded-xl text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Gym Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-txt-muted">
              Gym Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. TITAN FORGE GYM"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm font-semibold transition-colors"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-txt-muted">
              Tagline / Subtitle
            </label>
            <div className="relative">
              <Sparkles className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. STRENGTH & DISCIPLINE GYM"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-txt-muted">
              Gym Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300 1234567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors font-mono"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-txt-muted">
              Physical Address / Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-txt-muted" />
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 12, Main Boulevard, Gulberg, Lahore"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary text-xs md:text-sm transition-colors resize-none"
              />
            </div>
            <p className="text-[11px] text-txt-muted">
              This address and phone appear on all printable fee receipts and personalized workout protocol slips.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeSettings}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-border bg-surface-2 text-txt-muted hover:text-txt text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gold-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
