// ============================================================================
// IRONFORGE - Status Badge Component
// Displays status with explicit text label and required status colors:
// Green = Paid, Orange = Due soon, Red = Overdue
// ============================================================================

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { FeeStatus } from '../../types';

interface StatusBadgeProps {
  status: FeeStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const norm = (status || '').toLowerCase().trim();
  const isSmall = size === 'sm';
  const sizeClasses = isSmall
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  if (norm === 'paid') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 ${sizeClasses} ${className}`}
      >
        <CheckCircle2 className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="font-semibold">Paid</span>
      </span>
    );
  }

  if (norm === 'due soon' || norm === 'unpaid' || norm === 'pending') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 ${sizeClasses} ${className}`}
      >
        <Clock className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="font-semibold">Due soon</span>
      </span>
    );
  }

  if (norm === 'overdue') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 ${sizeClasses} ${className}`}
      >
        <AlertTriangle className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="font-semibold">Overdue</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-surface-2 text-txt-muted border border-border ${sizeClasses} ${className}`}
    >
      <span className="capitalize">{status}</span>
    </span>
  );
};
