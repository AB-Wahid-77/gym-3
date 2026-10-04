// ============================================================================
// IRONFORGE - Sell General Fitness Plan Modal
// Allows admin to sell a standard built-in protocol to an existing gym member
// or a walk-in client, computes automatic suggested pricing or manual override,
// generates an official PlanReceipt in PKR, and links to member or general sales.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  User,
  DollarSign,
  Receipt,
  Check,
  Building,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react';
import { GeneralPlan, Member, PlanReceipt } from '../types';
import { calculateGeneralPlanPrice } from '../services/planPricing';
import { useGym } from '../context/GymContext';
import { formatPKR, formatDatePK } from '../utils/formatters';
import { gymService } from '../services/gymService';
import { generateUUID } from '../utils/uuid';

interface SellGeneralPlanModalProps {
  isOpen: boolean;
  plan: GeneralPlan;
  members: Member[];
  onClose: () => void;
  onReceiptGenerated: (receipt: PlanReceipt) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SellGeneralPlanModal: React.FC<SellGeneralPlanModalProps> = ({
  isOpen,
  plan,
  members,
  onClose,
  onReceiptGenerated,
  showToast,
}) => {
  const { gym } = useGym();
  const [customerType, setCustomerType] = useState<'member' | 'walkin'>('member');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [walkinName, setWalkinName] = useState<string>('');
  const [walkinPhone, setWalkinPhone] = useState<string>('');

  const [priceType, setPriceType] = useState<'Automatic' | 'Manual'>('Automatic');
  const [priceAmount, setPriceAmount] = useState<number>(2000);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Calculate automatic suggested price
  const automaticPricing = calculateGeneralPlanPrice({
    goal: plan.goal,
    level: plan.level,
    daysPerWeek: plan.daysPerWeek || 4,
  });

  useEffect(() => {
    if (priceType === 'Automatic') {
      setPriceAmount(automaticPricing.totalComputed);
    }
  }, [priceType, plan]);

  useEffect(() => {
    // If members exist, select the first one by default
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [members]);

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.phone.includes(memberSearchQuery)
  );

  const customerName =
    customerType === 'member'
      ? selectedMember?.name || ''
      : walkinName.trim();

  const customerPhone =
    customerType === 'member'
      ? selectedMember?.phone || ''
      : walkinPhone.trim();

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName) {
      showToast('Please specify a customer name or select a member.', 'info');
      return;
    }

    if (priceAmount <= 0) {
      showToast('Please enter a valid price amount.', 'info');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const receiptNum = `REC-GEN-${new Date().getFullYear()}-${String(timestamp).slice(-4)}`;

    const newReceipt: PlanReceipt = {
      id: generateUUID(),
      receiptNumber: receiptNum,
      planId: plan.id,
      planTitle: `General Plan: ${plan.title}`,
      memberId: customerType === 'member' ? selectedMember?.id : undefined,
      memberName: customerName,
      memberPhone: customerPhone || undefined,
      date: today,
      amount: priceAmount,
      priceType,
      coverageDescription: `Standard ${plan.duration || '6-8 Weeks'} ${plan.goal} Protocol (${plan.level}, ${plan.daysPerWeek || 4} Days/Wk)`,
      gymName: gym.name,
      gymAddress: gym.address,
      gymPhone: gym.phone,
      status: 'Paid',
    };

    try {
      if (customerType === 'member' && selectedMember) {
        // Link receipt into member's record
        await gymService.addMemberReceipt(selectedMember.id, newReceipt);
      } else {
        // Save to general sales repository
        await gymService.saveGeneralPlanSale(newReceipt);
      }

      showToast(`General Plan sold to ${customerName}! Receipt generated.`, 'success');
      onReceiptGenerated(newReceipt);
      onClose();
    } catch (err: any) {
      console.error('Failed to process general plan sale:', err);
      showToast(err.message || 'Failed to record sale. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-2/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-primary/20 text-gold-primary border border-gold-primary/30 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm sm:text-base text-txt tracking-wide">
                SELL GENERAL PLAN
              </h3>
              <p className="text-xs text-txt-muted line-clamp-1">
                {plan.title} ({plan.goal} • {plan.daysPerWeek}d/wk)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleConfirmSale} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Customer Selection Type */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider block">
              Customer Classification
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCustomerType('member')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  customerType === 'member'
                    ? 'bg-gold-primary text-black border-gold-primary font-bold shadow-sm'
                    : 'bg-surface-2 text-txt-muted hover:text-txt border-border'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Existing Member</span>
              </button>

              <button
                type="button"
                onClick={() => setCustomerType('walkin')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  customerType === 'walkin'
                    ? 'bg-gold-primary text-black border-gold-primary font-bold shadow-sm'
                    : 'bg-surface-2 text-txt-muted hover:text-txt border-border'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Walk-in Customer</span>
              </button>
            </div>
          </div>

          {/* Member Selection Dropdown */}
          {customerType === 'member' ? (
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider block">
                Select Athlete Profile
              </label>
              {members.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs text-txt-muted text-center">
                  No registered members found. Choose &quot;Walk-in Customer&quot; above.
                </div>
              ) : (
                <div className="space-y-2">
                  {members.length > 5 && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-txt-muted" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder="Search athlete by name or phone..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-txt focus:outline-none focus:border-gold-primary"
                      />
                    </div>
                  )}

                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-border text-txt text-xs focus:outline-none focus:border-gold-primary cursor-pointer"
                  >
                    {filteredMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone}) — {m.program || 'Regular'}
                      </option>
                    ))}
                  </select>

                  {selectedMember && (
                    <div className="p-3 rounded-xl bg-surface-2/60 border border-border text-xs flex items-center justify-between text-txt-muted">
                      <span>Phone: <strong className="text-txt">{selectedMember.phone}</strong></span>
                      <span>Program: <strong className="text-gold-primary">{selectedMember.program || 'Regular'}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Walk-in Customer Inputs */
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider block">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Bilal Ahmed"
                  className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt text-xs focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider block">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt text-xs focus:outline-none focus:border-gold-primary"
                />
              </div>
            </div>
          )}

          {/* Pricing Selector: Automatic vs Manual */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider block">
                Billing Rate Strategy
              </label>
              <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setPriceType('Automatic');
                    setPriceAmount(automaticPricing.totalComputed);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    priceType === 'Automatic'
                      ? 'bg-gold-primary text-black font-bold'
                      : 'text-txt-muted hover:text-txt'
                  }`}
                >
                  Suggested Rate
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('Manual')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    priceType === 'Manual'
                      ? 'bg-gold-primary text-black font-bold'
                      : 'text-txt-muted hover:text-txt'
                  }`}
                >
                  Custom Override
                </button>
              </div>
            </div>

            {priceType === 'Automatic' ? (
              <div className="p-3.5 rounded-xl bg-gold-primary/10 border border-gold-primary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gold-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Standard General Plan Rate:
                  </span>
                  <span className="text-lg font-heading text-txt">
                    {formatPKR(automaticPricing.totalComputed)}
                  </span>
                </div>
                <ul className="text-[11px] text-txt-muted space-y-0.5 pl-4 list-disc marker:text-gold-primary">
                  {automaticPricing.explanation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] text-txt-muted block">
                  Enter Custom Price in PKR (Rs)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-txt-muted">
                    Rs
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-2 border border-border text-txt text-sm font-mono font-bold focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Receipt Preview Snippet */}
          <div className="p-4 rounded-xl bg-surface-2/60 border border-border/70 space-y-2 text-xs">
            <div className="flex items-center justify-between text-txt-muted">
              <span>Item:</span>
              <strong className="text-txt">General Plan: {plan.title}</strong>
            </div>
            <div className="flex items-center justify-between text-txt-muted">
              <span>Customer:</span>
              <strong className="text-txt">{customerName || '—'}</strong>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border text-txt font-semibold">
              <span>Total Billable:</span>
              <span className="text-base font-heading text-gold-primary">
                {formatPKR(priceAmount)}
              </span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface border border-border text-txt-muted hover:text-txt text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!customerName || priceAmount <= 0}
              className="px-5 py-2.5 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 disabled:opacity-50 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Confirm & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
