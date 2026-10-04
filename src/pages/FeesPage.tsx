// ============================================================================
// IRONFORGE - Fees & Billing Screen
// Manage gym collections, mark fees as paid, and generate clean printable receipts.
// Formatted with Pakistani PKR currency and DD/MM/YYYY dates.
// Responsive: Table on desktop, Cards on mobile.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Check,
  Printer,
  Calendar,
  X,
  Dumbbell,
  Receipt,
  FileCheck,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { FeePayment } from '../types';
import { gymService } from '../services/gymService';
import { useGym } from '../context/GymContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatPKR, formatDatePK } from '../utils/formatters';

export const FeesPage: React.FC = () => {
  const { gym } = useGym();
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Overdue'>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Active receipt modal for printing
  const [receiptToPrint, setReceiptToPrint] = useState<FeePayment | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resettingRevenue, setResettingRevenue] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    const data = await gymService.getPayments();
    setPayments(data);
    setLoading(false);
  };

  const handleResetRevenue = async () => {
    setResettingRevenue(true);
    try {
      await gymService.resetRevenue();
      await loadPayments();
      setBannerMessage('All revenue collections and payment ledger have been successfully reset to Rs 0.');
      setIsResetModalOpen(false);
    } catch {
      setBannerMessage('Failed to reset revenue ledger.');
    } finally {
      setResettingRevenue(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Compute unique months from payment records for month filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    payments.forEach((p) => {
      if (p.date) {
        months.add(p.date.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(months).sort().reverse();
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'Paid' && p.status !== 'Paid') return false;
      if (statusFilter === 'Overdue' && p.status !== 'Overdue') return false;
      if (statusFilter === 'Unpaid' && p.status !== 'Due soon' && p.status !== 'Overdue') return false;

      // Month filter
      if (selectedMonth !== 'All') {
        if (!p.date.startsWith(selectedMonth)) return false;
      }

      return true;
    });
  }, [payments, searchQuery, statusFilter, selectedMonth]);

  // Mark single payment as paid
  const handleMarkPaymentPaid = async (paymentId: string, memberName: string) => {
    try {
      const updated = await gymService.markPaymentAsPaid(paymentId);
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? updated : p)));
      setBannerMessage(`Payment marked as Paid for ${memberName}.`);
      setTimeout(() => setBannerMessage(null), 3500);
    } catch (err: any) {
      console.error('Error marking payment as paid:', err);
      setBannerMessage(err.message || 'Failed to record payment update.');
      setTimeout(() => setBannerMessage(null), 4000);
    }
  };

  // Direct print trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-txt">
            FEES & BILLING
          </h1>
          <p className="text-xs md:text-sm text-txt-muted mt-1">
            Track membership dues, generate receipts, and reconcile PKR fee collections.
          </p>
        </div>

        {/* Quick summary pill & Reset Revenue */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-surface border border-border text-xs">
            <span className="text-txt-muted block text-[10px] uppercase font-semibold">Total Records</span>
            <span className="font-heading text-base text-gold-primary">{filteredPayments.length}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-2 hover:bg-rose-500/15 text-txt-muted hover:text-rose-400 border border-border hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Reset revenue collections and payment ledger"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Revenue</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {bannerMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs md:text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-emerald-500 hover:text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Month Filter & Status Tabs */}
      <div className="p-3 rounded-2xl bg-surface border border-border space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by member or receipt #..."
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Filter Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs">
            <Calendar className="w-3.5 h-3.5 text-txt-muted" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-txt text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-surface text-txt">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-surface text-txt">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Paid', 'Unpaid', 'Overdue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab
                    ? 'bg-gold-primary text-black'
                    : 'bg-surface-2 text-txt-muted hover:text-txt'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Content */}
      {loading ? (
        <div className="p-12 text-center text-txt-muted text-sm rounded-2xl bg-surface border border-border">
          Loading billing data...
        </div>
      ) : payments.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 text-gold-primary flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-base font-heading text-txt">NO PAYMENTS YET</p>
          <p className="text-xs text-txt-muted max-w-sm mx-auto">
            Fee payments and receipts will appear here as members are enrolled and monthly dues are collected.
          </p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-2 text-txt-muted flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-txt">No matching records found</p>
          <p className="text-xs text-txt-muted max-w-sm mx-auto">
            No payments match the selected status or month filter.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-txt-muted font-semibold">
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Date / Due</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-gold-primary">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-txt block">{p.memberName}</span>
                        {p.memberPhone && (
                          <span className="text-[11px] text-txt-muted">{p.memberPhone}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-txt">
                        {formatPKR(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-txt">{formatDatePK(p.date)}</div>
                        <div className="text-[10px] text-txt-muted">Due: {formatDatePK(p.dueDate)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-txt-muted">
                        {p.paymentMethod || 'Cash'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {p.status !== 'Paid' && (
                            <button
                              onClick={() => handleMarkPaymentPaid(p.id, p.memberName)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 font-semibold text-xs transition-colors border border-emerald-500/30 flex items-center gap-1"
                              title="Mark as Paid"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Mark Paid</span>
                            </button>
                          )}
                          <button
                            onClick={() => setReceiptToPrint(p)}
                            className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-txt font-medium text-xs border border-border flex items-center gap-1.5 transition-colors"
                            title="View and print official fee receipt"
                          >
                            <Printer className="w-3.5 h-3.5 text-gold-primary" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-surface border border-border space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-gold-primary block">{p.receiptNumber}</span>
                    <h3 className="font-semibold text-txt text-base">{p.memberName}</h3>
                  </div>
                  <StatusBadge status={p.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-2 border border-border/50">
                  <div>
                    <span className="text-[10px] uppercase text-txt-muted block">Amount</span>
                    <span className="font-bold text-txt text-sm">
                      {formatPKR(p.amount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-txt-muted block">Date</span>
                    <span className="font-medium text-txt">{formatDatePK(p.date)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {p.status !== 'Paid' ? (
                    <button
                      onClick={() => handleMarkPaymentPaid(p.id, p.memberName)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Mark Paid</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Reconciled
                    </span>
                  )}

                  <button
                    onClick={() => setReceiptToPrint(p)}
                    className="px-3 py-1.5 rounded-lg bg-surface-2 text-txt text-xs font-medium border border-border flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-gold-primary" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Printable Fee Receipt Modal */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 space-y-6 animate-scaleUp shadow-2xl relative">
            {/* Modal Controls (Hidden in print) */}
            <div className="no-print flex items-center justify-between border-b border-border pb-3">
              <span className="font-heading text-sm text-txt">FEE RECEIPT</span>
              <button
                onClick={() => setReceiptToPrint(null)}
                className="p-1 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Document Content (Styled for print) */}
            <div id="printable-receipt" className="space-y-5 text-txt">
              {/* Gym Header */}
              <div className="text-center space-y-1 pb-4 border-b border-border/80">
                <div className="w-10 h-10 rounded-xl bg-gold-primary text-black flex items-center justify-center font-bold mx-auto mb-2">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-lg text-txt tracking-wide">{gym.name}</h2>
                <p className="text-[10px] text-txt-muted uppercase tracking-wider">{gym.tagline}</p>
                <p className="text-xs text-txt-muted">{gym.address}</p>
                <p className="text-xs text-txt-muted">Phone: {gym.phone} • {gym.adminEmail || ''}</p>
              </div>

              {/* Receipt Metadata */}
              <div className="flex items-center justify-between text-xs py-2 border-b border-border/50">
                <div>
                  <span className="text-[10px] uppercase text-txt-muted block">Receipt Number</span>
                  <span className="font-mono font-bold text-gold-primary">{receiptToPrint.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-txt-muted block">Payment Date</span>
                  <span className="font-semibold text-txt">{formatDatePK(receiptToPrint.date)}</span>
                </div>
              </div>

              {/* Member Details */}
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border/70 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-txt-muted">Member Name:</span>
                  <span className="font-bold text-txt">{receiptToPrint.memberName}</span>
                </div>
                {receiptToPrint.memberPhone && (
                  <div className="flex justify-between">
                    <span className="text-txt-muted">Contact Phone:</span>
                    <span className="font-medium text-txt">{receiptToPrint.memberPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-txt-muted">Payment Method:</span>
                  <span className="font-medium text-txt">{receiptToPrint.paymentMethod || 'Cash'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-muted">Billing Cycle Due:</span>
                  <span className="font-medium text-txt">{formatDatePK(receiptToPrint.dueDate)}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <div className="flex justify-between px-3 py-2 bg-surface-2 font-semibold text-txt-muted border-b border-border">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between px-3 py-2.5">
                  <div>
                    <span className="font-medium text-txt block">Gym Membership Fee</span>
                    <span className="text-[10px] text-txt-muted">Access to all fitness equipment</span>
                  </div>
                  <span className="font-bold text-txt">
                    {formatPKR(receiptToPrint.amount)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2.5 bg-surface-2/50 font-bold border-t border-border">
                  <span>Total Paid</span>
                  <span className="text-gold-primary text-sm">
                    {formatPKR(receiptToPrint.amount)}
                  </span>
                </div>
              </div>

              {/* Status & Confirmation Footer */}
              <div className="text-center pt-2 space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-bold text-xs border border-emerald-500/30">
                  STATUS: {receiptToPrint.status.toUpperCase()}
                </span>
                <p className="text-[11px] text-txt-muted">
                  Thank you for training with {gym.name}.
                </p>
              </div>
            </div>

            {/* Modal Actions (Hidden in print) */}
            <div className="no-print flex items-center gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setReceiptToPrint(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-txt text-xs font-semibold hover:bg-surface-2 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-colors shadow-md shadow-gold-primary/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Revenue Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 space-y-4 animate-scaleUp shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-heading text-lg text-txt">Reset Revenue Ledger?</h3>
              <p className="text-xs text-txt-muted mt-1 leading-relaxed">
                This will reset all collected fee records and plan sale receipts back to <strong className="text-gold-primary">Rs 0</strong>. Member profiles and athlete rosters will remain untouched.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={resettingRevenue}
                className="flex-1 py-2.5 rounded-xl border border-border text-txt text-xs font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetRevenue}
                disabled={resettingRevenue}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-500/20"
              >
                {resettingRevenue ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
