// ============================================================================
// IRONFORGE - Localization and Formatting Utilities for Pakistan
// Currency: PKR (Rs)
// Dates: DD/MM/YYYY
// Height: Feet & Inches <-> Centimeters
// ============================================================================

/**
 * Format currency in Pakistani Rupee (PKR, Rs)
 * Example: 3000 -> "Rs 3,000"
 */
export function formatPKR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs 0';
  }
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `Rs ${formatted}`;
}

/**
 * Format a date string (YYYY-MM-DD or ISO) into Pakistani format (DD/MM/YYYY)
 * Example: "2026-09-15" -> "15/09/2026"
 */
export function formatDatePK(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';

  try {
    let d: Date;
    if (typeof dateInput === 'string') {
      // Check if already in DD/MM/YYYY format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
        return dateInput;
      }
      // If YYYY-MM-DD
      const parts = dateInput.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
      d = new Date(dateInput);
    } else {
      d = dateInput;
    }

    if (isNaN(d.getTime())) return String(dateInput);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Convert centimeters to Feet & Inches (Pakistan standard)
 * Normalizes output so inches never reaches 12 (e.g. 6' 0" instead of 5' 12")
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number; display: string } {
  if (!cm || cm <= 0) return { feet: 5, inches: 7, display: `5' 7"` };
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return {
    feet,
    inches,
    display: `${feet}' ${inches}"`,
  };
}

/**
 * Convert Feet & Inches to centimeters
 * Handles inch overflow (e.g. 12 inches rolls over to +1 foot)
 */
export function feetInchesToCm(feet: number, inches: number): number {
  let f = Math.max(0, Number(feet) || 0);
  let i = Math.max(0, Number(inches) || 0);
  if (i >= 12) {
    f += Math.floor(i / 12);
    i = i % 12;
  }
  return Math.round((f * 12 + i) * 2.54);
}

/**
 * Safely adds one calendar month to a YYYY-MM-DD date string without month-end overflow.
 * Correct examples:
 * January 31 -> February 28/29
 * March 31 -> April 30
 * May 31 -> June 30
 * July 31 -> August 31
 */
export function addOneMonth(dateInput: string | Date): string {
  let year: number;
  let month: number; // 0-indexed: 0 = Jan, 11 = Dec
  let day: number;

  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) {
        const now = new Date();
        year = now.getFullYear();
        month = now.getMonth();
        day = now.getDate();
      } else {
        year = d.getFullYear();
        month = d.getMonth();
        day = d.getDate();
      }
    }
  } else {
    year = dateInput.getFullYear();
    month = dateInput.getMonth();
    day = dateInput.getDate();
  }

  let targetYear = year;
  let targetMonth = month + 1;
  if (targetMonth > 11) {
    targetYear += Math.floor(targetMonth / 12);
    targetMonth = targetMonth % 12;
  }

  // Days in target month (day 0 of next month gives last day of target month)
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  const mm = String(targetMonth + 1).padStart(2, '0');
  const dd = String(targetDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
}
