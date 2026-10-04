// ============================================================================
// IRONFORGE - Plan Receipt Modal & Printable View
// Generates official gym receipts for workout and diet protocols.
// Features Print, Download PDF, and native Web Share API with PDF fallback.
// ============================================================================

import React, { useState } from 'react';
import { PlanReceipt } from '../types';
import { useGym } from '../context/GymContext';
import { formatPKR, formatDatePK } from '../utils/formatters';
import { downloadElementAsPdf, shareElementAsPdf } from '../utils/pdfExport';
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle,
  Receipt,
  Dumbbell,
  ShieldCheck,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';

interface PlanReceiptModalProps {
  receipt: PlanReceipt;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PlanReceiptModal: React.FC<PlanReceiptModalProps> = ({
  receipt,
  onClose,
  showToast,
}) => {
  const { gym } = useGym();
  const [isExporting, setIsExporting] = useState<'download' | 'share' | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('printable-plan-receipt');
    if (!el) return;

    try {
      setIsExporting('download');
      const filename = `Receipt-${receipt.receiptNumber}-${receipt.memberName.replace(/\s+/g, '_')}.pdf`;
      await downloadElementAsPdf(el, filename);
      showToast(`Receipt downloaded: ${filename}`, 'success');
    } catch (err: any) {
      console.error('Failed to download receipt PDF', err);
      showToast(err?.message || 'Failed to generate PDF. Please try printing instead.', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleSharePdf = async () => {
    const el = document.getElementById('printable-plan-receipt');
    if (!el) return;

    try {
      setIsExporting('share');
      const filename = `Receipt-${receipt.receiptNumber}-${receipt.memberName.replace(/\s+/g, '_')}.pdf`;
      const title = `${gym.name} - Protocol Receipt #${receipt.receiptNumber}`;
      const text = `Official coaching protocol receipt for ${receipt.memberName} - ${receipt.planTitle} (${formatPKR(receipt.amount)})`;

      const result = await shareElementAsPdf(el, filename, title, text);

      if (result.shared) {
        showToast('Receipt shared successfully!', 'success');
      } else if (result.downloadedFallback) {
        showToast(
          "Sharing isn't supported on this browser — the PDF was downloaded instead, you can share it manually.",
          'info'
        );
      }
    } catch (err: any) {
      console.error('Failed to share receipt PDF', err);
      showToast(err?.message || 'Failed to generate PDF. Please try printing instead.', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top Control Bar (Screen only) */}
        <div className="no-print p-4 border-b border-border flex items-center justify-between bg-surface-2/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-primary/20 text-gold-primary border border-gold-primary/30 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm text-txt">OFFICIAL PLAN RECEIPT</h3>
              <p className="text-[11px] text-txt-muted">Ref: {receipt.receiptNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-gold-primary" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting !== null}
              className="px-2.5 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Download PDF"
            >
              {isExporting === 'download' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-primary" />
              ) : (
                <Download className="w-3.5 h-3.5 text-gold-primary" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={handleSharePdf}
              disabled={isExporting !== null}
              className="px-3 py-1.5 rounded-lg bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-sm shadow-gold-primary/20 disabled:opacity-50 cursor-pointer"
              title="Share PDF via WhatsApp or email"
            >
              {isExporting === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>Share PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {/* Printable Layout Element */}
          <div
            id="printable-plan-receipt"
            className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-6 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
          >
            {/* Watermark / Background Accent */}
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03] select-none">
              <Dumbbell className="w-80 h-80 -mr-16 -mb-16 text-txt" />
            </div>

            {/* Receipt Header */}
            <div className="border-b border-border pb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-gold-primary text-black flex items-center justify-center font-bold">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl text-txt tracking-wide">
                      {receipt.gymName || gym.name}
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold-primary block">
                      STRENGTH & PERFORMANCE GYM • PAKISTAN
                    </span>
                  </div>
                </div>
                <p className="text-xs text-txt-muted mt-1">
                  {receipt.gymAddress || gym.address}
                </p>
                <p className="text-xs text-txt-muted">
                  Phone: {receipt.gymPhone || gym.phone}
                </p>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PAID RECEIPT</span>
                </span>
                <p className="text-xs font-mono font-bold text-gold-primary">
                  {receipt.receiptNumber}
                </p>
                <p className="text-[11px] text-txt-muted flex items-center justify-end gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDatePK(receipt.date)}</span>
                </p>
              </div>
            </div>

            {/* Client & Protocol Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-2/70 border border-border/80 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-txt-muted tracking-wider block">
                  BILLED TO (ATHLETE)
                </span>
                <div className="flex items-center gap-1.5 font-bold text-sm text-txt">
                  <User className="w-4 h-4 text-gold-primary" />
                  <span>{receipt.memberName || 'Walk-in client'}</span>
                </div>
                {receipt.memberPhone && (
                  <p className="text-txt-muted">Phone: {receipt.memberPhone}</p>
                )}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] uppercase font-bold text-txt-muted tracking-wider block">
                  SERVICE / ITEM
                </span>
                <p className="font-bold text-txt text-sm">{receipt.planTitle}</p>
                <span className="text-[11px] text-gold-primary block">
                  Pricing Tier: {receipt.priceType} Protocol
                </span>
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div className="space-y-3">
              <div className="border-b border-border/70 pb-2 flex items-center justify-between text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                <span>Description</span>
                <span className="text-right">Amount (PKR)</span>
              </div>

              <div className="flex items-start justify-between gap-3 text-xs py-1">
                <div className="space-y-1 pr-4">
                  <p className="font-semibold text-txt">{receipt.planTitle}</p>
                  <p className="text-txt-muted text-[11px] leading-relaxed">
                    {receipt.coverageDescription}
                  </p>
                </div>
                <div className="font-mono font-bold text-txt shrink-0 text-sm">
                  {formatPKR(receipt.amount)}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-txt uppercase tracking-wider block">
                    TOTAL AMOUNT PAID
                  </span>
                  <span className="text-[11px] text-txt-muted">
                    No hidden taxes • Valid for complete training cycle
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-heading text-gold-primary">
                    {formatPKR(receipt.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer / Coaching Seal */}
            <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-txt-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Authorized IronForge Coaching & Nutrition Seal</span>
              </div>
              <p className="italic">Thank you for training with {receipt.gymName || gym.name}!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
