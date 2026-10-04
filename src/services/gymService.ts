// ============================================================================
// IRONFORGE - Gym Management API Service
// Replaces localStorage storage with real Express backend & Supabase Postgres API calls.
// Attaches Bearer authentication token from AuthContext/localStorage.
// ============================================================================

import { Member, FeePayment, FeeStatus, GeneratedPlan, MemberProgram, PlanReceipt } from '../types';
import { addOneMonth } from '../utils/formatters';
import {
  getAuthToken,
  getRefreshToken,
  setStoredSession,
  clearStoredSession,
} from '../context/AuthContext';

// Re-export safe addOneMonth
export { addOneMonth };

// Parse local date safely without UTC offset shift
function parseLocalDate(dateString: string): Date {
  const parts = dateString.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateString);
}

// Helper to calculate days overdue (0 if not overdue)
export function calculateDaysOverdue(dueDateString: string): number {
  if (!dueDateString) return 0;
  const due = parseLocalDate(dueDateString);
  if (isNaN(due.getTime())) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Dynamically computes a member's fee status based on their nextDueDate and the current date:
 * - Payment currently valid (due date is > 7 days in future) -> 'Paid'
 * - Approaching due date (due within 7 days, or due today) -> 'Due soon'
 * - Due date passed (due date is in the past) -> 'Overdue'
 */
export function calculateFeeStatus(nextDueDateString?: string, baseDate: Date = new Date()): FeeStatus {
  if (!nextDueDateString) return 'Paid';
  const due = parseLocalDate(nextDueDateString);
  if (isNaN(due.getTime())) return 'Paid';

  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Overdue';
  } else if (diffDays <= 7) {
    return 'Due soon';
  } else {
    return 'Paid';
  }
}

// Shared refresh mutex to prevent duplicate simultaneous refresh requests
let refreshPromise: Promise<string | null> | null = null;

async function refreshSessionToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error('Session refresh failed with status ' + response.status);
      }

      const data = await response.json();
      if (!data.accessToken) {
        throw new Error('No access token in session refresh response');
      }

      setStoredSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || currentRefreshToken,
        expiresIn: data.expiresIn,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ironforge-token-refreshed', {
            detail: {
              token: data.accessToken,
              refreshToken: data.refreshToken || currentRefreshToken,
              expiresIn: data.expiresIn,
            },
          })
        );
      }

      return data.accessToken as string;
    } catch (err) {
      clearStoredSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ironforge-force-logout'));
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Internal helper for authenticated Express API requests with auto 401 retry
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, automatically refresh session token once and retry original request
  if (response.status === 401 && !endpoint.startsWith('/api/auth/')) {
    const newToken = await refreshSessionToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(endpoint, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      errorBody.error ||
      errorBody.message ||
      `Request failed with status ${response.status} (${response.statusText})`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

class GymService {
  // --- Members ---
  async getMembers(): Promise<Member[]> {
    return apiFetch<Member[]>('/api/members');
  }

  async getMemberById(id: string): Promise<Member | null> {
    try {
      return await apiFetch<Member>(`/api/members/${id}`);
    } catch {
      return null;
    }
  }

  async addMember(
    memberData: Omit<Member, 'id' | 'feeStatus' | 'nextDueDate' | 'savedPlans'> & {
      feeStatus?: FeeStatus;
      nextDueDate?: string;
      program?: MemberProgram;
    }
  ): Promise<Member> {
    return apiFetch<Member>('/api/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    return apiFetch<Member>(`/api/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteMember(id: string): Promise<boolean> {
    await apiFetch<{ success: boolean }>(`/api/members/${id}`, {
      method: 'DELETE',
    });
    return true;
  }

  async markMemberAsPaid(
    memberId: string,
    amountOverride?: number,
    paymentMethod: 'Cash' | 'Card' | 'Online Transfer' = 'Cash'
  ): Promise<{ member: Member; payment: FeePayment }> {
    return apiFetch<{ member: Member; payment: FeePayment }>(
      `/api/members/${memberId}/mark-paid`,
      {
        method: 'POST',
        body: JSON.stringify({
          amount: amountOverride,
          paymentMethod,
        }),
      }
    );
  }

  // --- Payments ---
  async getPayments(): Promise<FeePayment[]> {
    return apiFetch<FeePayment[]>('/api/payments');
  }

  async markPaymentAsPaid(paymentId: string): Promise<FeePayment> {
    return apiFetch<FeePayment>(`/api/payments/${paymentId}/mark-paid`, {
      method: 'POST',
    });
  }

  // --- Saved Plans ---
  async getSavedPlans(): Promise<GeneratedPlan[]> {
    return apiFetch<GeneratedPlan[]>('/api/plans');
  }

  async savePlan(plan: GeneratedPlan): Promise<GeneratedPlan> {
    return apiFetch<GeneratedPlan>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async deletePlan(planId: string): Promise<boolean> {
    await apiFetch<{ success: boolean }>(`/api/plans/${planId}`, {
      method: 'DELETE',
    });
    return true;
  }

  async savePlanToMember(memberId: string, plan: GeneratedPlan): Promise<void> {
    await apiFetch<{ success: boolean }>(`/api/plans/${plan.id}/save-to-member`, {
      method: 'POST',
      body: JSON.stringify({ memberId, plan }),
    });
  }

  // --- Plan Receipts ---
  async getPlanReceipts(): Promise<PlanReceipt[]> {
    return apiFetch<PlanReceipt[]>('/api/plan-receipts');
  }

  async savePlanReceipt(receipt: PlanReceipt): Promise<PlanReceipt> {
    return apiFetch<PlanReceipt>('/api/plan-receipts', {
      method: 'POST',
      body: JSON.stringify(receipt),
    });
  }

  async addMemberReceipt(memberId: string, receipt: PlanReceipt): Promise<void> {
    await this.savePlanReceipt({
      ...receipt,
      memberId,
    });
  }

  // --- General Plan Walk-in Sales ---
  async getGeneralPlanSales(): Promise<PlanReceipt[]> {
    return apiFetch<PlanReceipt[]>('/api/general-plan-sales');
  }

  async saveGeneralPlanSale(receipt: PlanReceipt): Promise<PlanReceipt> {
    return apiFetch<PlanReceipt>('/api/general-plan-sales', {
      method: 'POST',
      body: JSON.stringify(receipt),
    });
  }

  // --- Bulk Member Import ---
  async addMembersBulk(
    newMemberList: Array<
      Omit<Member, 'id' | 'feeStatus' | 'nextDueDate' | 'savedPlans'> & {
        feeStatus?: FeeStatus;
        nextDueDate?: string;
        program?: MemberProgram;
      }
    >
  ): Promise<Member[]> {
    return apiFetch<Member[]>('/api/members/bulk', {
      method: 'POST',
      body: JSON.stringify({ members: newMemberList }),
    });
  }

  // --- Dashboard Statistics Calculation ---
  async getDashboardStats() {
    return apiFetch<{
      totalMembers: number;
      paidThisMonthCount: number;
      unpaidOrOverdueCount: number;
      dueSoonCount?: number;
      overdueCount?: number;
      moneyCollectedThisMonth: number;
      monthlyRevenue?: Array<{
        yearMonth: string;
        label: string;
        amount: number;
        isCurrent: boolean;
        paymentCount: number;
      }>;
      membershipHealthRate?: number;
      regularCount: number;
      cuttingCount: number;
      bulkingCount: number;
      dueSoonMembers: Member[];
      overdueMembers: (Member & { daysOverdue: number })[];
      currencySymbol: string;
      currentYearMonth?: string;
    }>('/api/dashboard-stats');
  }

  // Resets revenue data (payments ledger, plan sales receipts, and member transaction history)
  async resetRevenue(): Promise<void> {
    await apiFetch<{ success: boolean }>('/api/reset-revenue', {
      method: 'POST',
    });
  }
}

export const gymService = new GymService();
