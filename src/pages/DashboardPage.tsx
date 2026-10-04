// ============================================================================
// IRONFORGE - Admin Dashboard Screen (Upgraded Layout)
// Widget-based grid layout: Space Grotesk typography for headings and stat numerals,
// compact stat cards, gold-styled revenue overview chart, circular membership health
// gauge, compact transaction-style rosters for due soon & overdue, program split bar,
// and dedicated quick actions.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
  Phone,
  Calendar,
  Check,
  Clock,
  ArrowRight,
  ShieldAlert,
  Dumbbell,
  Flame,
  Activity,
  CreditCard,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { gymService } from '../services/gymService';
import { useGym } from '../context/GymContext';
import { CountUp } from '../components/common/CountUp';
import { Member, FeePayment } from '../types';
import { formatPKR, formatDatePK } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { gym } = useGym();

  const [stats, setStats] = useState<{
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
  } | null>(null);

  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [chartHoverMonth, setChartHoverMonth] = useState<string | null>(null);
  const [isResetRevenueModalOpen, setIsResetRevenueModalOpen] = useState(false);
  const [resettingRevenue, setResettingRevenue] = useState(false);

  const handleResetRevenue = async () => {
    setResettingRevenue(true);
    try {
      await gymService.resetRevenue();
      await loadDashboardData();
      setSuccessToast('Revenue collections and ledger successfully reset to Rs 0.');
      setTimeout(() => setSuccessToast(null), 4000);
      setIsResetRevenueModalOpen(false);
    } catch {
      setSuccessToast('Failed to reset revenue ledger.');
      setTimeout(() => setSuccessToast(null), 4000);
    } finally {
      setResettingRevenue(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    const [statsData, paymentsData] = await Promise.all([
      gymService.getDashboardStats(),
      gymService.getPayments(),
    ]);
    setStats(statsData);
    setPayments(paymentsData);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickMarkPaid = async (memberId: string, memberName: string) => {
    try {
      await gymService.markMemberAsPaid(memberId);
      setSuccessToast(`Payment recorded for ${memberName}. Due date advanced by 1 month.`);
      setTimeout(() => setSuccessToast(null), 3500);
      await loadDashboardData();
    } catch {
      // ignore
    }
  };

  // Compute 6-month historical/projected revenue trend for the chart
  // Uses server-computed stats.monthlyRevenue as the single source of truth
  const revenueChartData = useMemo(() => {
    if (stats?.monthlyRevenue && stats.monthlyRevenue.length > 0) {
      const maxVal = Math.max(...stats.monthlyRevenue.map((m) => m.amount), 5000);
      return { months: stats.monthlyRevenue, maxVal };
    }

    // Timezone-safe fallback using integer calendar arithmetic
    const months = [];
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      let mIdx = curMonth - i;
      let y = curYear;
      while (mIdx < 0) {
        mIdx += 12;
        y -= 1;
      }
      const yearMonth = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
      const label = monthNames[mIdx];

      const sum = payments
        .filter((p) => p.status === 'Paid' && p.date && p.date.startsWith(yearMonth))
        .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

      months.push({
        yearMonth,
        label,
        amount: sum,
        isCurrent: i === 0,
      });
    }

    const maxVal = Math.max(...months.map((m) => m.amount), 5000);
    return { months, maxVal };
  }, [stats?.monthlyRevenue, payments]);

  // Compute health percentage (Paid vs Unpaid/Overdue)
  const healthRate = useMemo(() => {
    if (!stats || stats.totalMembers === 0) return 100;
    if (typeof stats.membershipHealthRate === 'number') {
      return stats.membershipHealthRate;
    }
    return Math.round((stats.paidThisMonthCount / stats.totalMembers) * 100);
  }, [stats]);

  const isCompletelyEmpty = stats && stats.totalMembers === 0;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn font-sans">
      {/* -------------------------------------------------------------------- */}
      {/* Top Header Banner: Space Grotesk Heading + Subtitle                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-space font-bold text-2xl md:text-3xl text-txt tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs md:text-sm text-txt-muted mt-1">
            Welcome to {gym.name}. Overview of athlete rosters, cash revenue, and billing cycles.
          </p>
        </div>

        {/* Quick Header Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/members')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-primary text-black font-semibold text-xs md:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Member</span>
          </button>

          <button
            onClick={() => navigate('/plans')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-txt font-semibold text-xs md:text-sm hover:border-gold-primary/50 hover:bg-surface-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-gold-primary" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs md:text-sm flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Zero State Alert for Brand-New Setup */}
      {isCompletelyEmpty && !loading && (
        <div className="p-6 rounded-2xl bg-surface border border-gold-primary/30 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gold-primary">
                <Dumbbell className="w-5 h-5" />
                <h3 className="font-space font-bold text-base text-txt">Fresh Registry</h3>
              </div>
              <p className="text-xs md:text-sm text-txt-muted">
                No members registered yet. Add your first athlete to begin tracking fees, programs, and generating AI plans.
              </p>
            </div>
            <button
              onClick={() => navigate('/members')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-primary text-black font-semibold text-xs md:text-sm hover:brightness-110 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add First Member</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 1. Top Row of Compact Stat Cards with Space Grotesk Numerals         */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Members */}
        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-gold-primary/40 transition-all group">
          <div className="flex items-center justify-between text-txt-muted mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-txt-muted">Total Members</span>
            <div className="w-9 h-9 rounded-xl bg-surface-2 group-hover:bg-gold-primary/10 text-txt-muted group-hover:text-gold-primary flex items-center justify-center transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-space font-bold text-3xl text-txt">
            {loading || !stats ? '0' : <CountUp end={stats.totalMembers} />}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60 text-[11px] text-txt-muted">
            <span>Enrolled Athletes</span>
            <span className="text-gold-primary font-medium flex items-center gap-0.5">
              Active <TrendingUp className="w-3 h-3 inline" />
            </span>
          </div>
        </div>

        {/* Card 2: Paid This Month */}
        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between text-txt-muted mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-txt-muted">Paid This Month</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-space font-bold text-3xl text-emerald-500">
            {loading || !stats ? '0' : <CountUp end={stats.paidThisMonthCount} />}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60 text-[11px] text-txt-muted">
            <span>Up-to-Date Memberships</span>
            <span className="text-emerald-500 font-semibold">{healthRate}% of total</span>
          </div>
        </div>

        {/* Card 3: Unpaid / Overdue */}
        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-rose-500/40 transition-all group">
          <div className="flex items-center justify-between text-txt-muted mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-txt-muted">Unpaid / Overdue</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-space font-bold text-3xl text-rose-500">
            {loading || !stats ? '0' : <CountUp end={stats.unpaidOrOverdueCount} />}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60 text-[11px] text-txt-muted">
            <span>Attention Needed</span>
            <span className="text-rose-500 font-semibold">
              {stats ? `${stats.overdueMembers.length} overdue` : '0'}
            </span>
          </div>
        </div>

        {/* Card 4: Revenue This Month */}
        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-gold-primary/40 transition-all group">
          <div className="flex items-center justify-between text-txt-muted mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-txt-muted">Collected This Month</span>
            <div className="w-9 h-9 rounded-xl bg-gold-primary/10 text-gold-primary flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="font-space font-bold text-2xl md:text-3xl text-gold-primary">
            {loading || !stats ? (
              formatPKR(0)
            ) : (
              formatPKR(stats.moneyCollectedThisMonth)
            )}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60 text-[11px] text-txt-muted">
            <span>Cash & Transfers</span>
            <span className="text-txt font-mono text-[10px]">{gym.currency.code}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. Middle Row: Revenue Overview Chart + Membership Health Gauge      */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Wider "Revenue Overview" Card with Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-surface border border-border space-y-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-primary" />
                <h3 className="font-space font-bold text-base text-txt">
                  Revenue Overview
                </h3>
              </div>
              <p className="text-xs text-txt-muted mt-0.5">
                Monthly collection breakdown and real-time cash reconciliation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">This Month</span>
                <span className="font-space font-bold text-lg text-gold-primary">
                  {formatPKR(stats?.moneyCollectedThisMonth ?? 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsResetRevenueModalOpen(true)}
                className="p-2 rounded-xl bg-surface-2 hover:bg-rose-500/15 hover:text-rose-400 border border-border text-txt-muted transition-colors cursor-pointer"
                title="Reset revenue collections to Rs 0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/fees')}
                className="p-2 rounded-xl bg-surface-2 hover:bg-gold-primary/10 hover:text-gold-primary border border-border text-txt-muted transition-colors cursor-pointer"
                title="View full billing ledger"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SVG Bar & Curve Chart */}
          <div className="space-y-4 pt-2">
            <div className="h-44 sm:h-52 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
              {revenueChartData.months.map((m) => {
                const heightPercent =
                  revenueChartData.maxVal > 0
                    ? Math.max(12, Math.round((m.amount / revenueChartData.maxVal) * 100))
                    : 12;

                const isHovered = chartHoverMonth === m.yearMonth;

                return (
                  <div
                    key={m.yearMonth}
                    onMouseEnter={() => setChartHoverMonth(m.yearMonth)}
                    onMouseLeave={() => setChartHoverMonth(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div
                      className={`absolute -top-9 px-2.5 py-1 rounded-lg bg-bg border border-gold-primary text-gold-primary text-[11px] font-mono whitespace-nowrap shadow-lg transition-all duration-200 pointer-events-none z-20 ${
                        isHovered || m.isCurrent
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95'
                      }`}
                    >
                      {formatPKR(m.amount)}
                    </div>

                    {/* Bar Container */}
                    <div className="w-full max-w-[48px] h-full flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 relative overflow-hidden ${
                          m.isCurrent
                            ? 'bg-gradient-to-t from-gold-primary to-amber-300 shadow-md shadow-gold-primary/20'
                            : 'bg-surface-2 group-hover:bg-gold-primary/40 border-t border-border group-hover:border-gold-primary/60'
                        }`}
                      >
                        {/* Subtle bar shine */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Month Label */}
                    <div className="mt-3 text-center">
                      <span
                        className={`text-xs font-medium block transition-colors ${
                          m.isCurrent
                            ? 'text-gold-primary font-bold'
                            : 'text-txt-muted group-hover:text-txt'
                        }`}
                      >
                        {m.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-txt-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gold-primary" />
                Current Active Cycle
              </span>
              <span className="font-mono text-[11px]">
                {payments.length} total payments logged
              </span>
            </div>
          </div>
        </div>

        {/* Right: "Membership Health" Radial Gauge Widget (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-surface border border-border space-y-5 flex flex-col justify-between">
          <div className="border-b border-border pb-3">
            <h3 className="font-space font-bold text-base text-txt">
              Membership Health
            </h3>
            <p className="text-xs text-txt-muted mt-0.5">
              Paid-up compliance ratio vs pending dues.
            </p>
          </div>

          {/* Circular SVG Gauge Visual */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-surface-2"
                  strokeWidth="9"
                  fill="transparent"
                />
                {/* Gold/Emerald progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-gold-primary transition-all duration-1000 ease-out"
                  strokeWidth="9"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * healthRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center percentage in Space Grotesk */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-space font-bold text-3xl text-txt">
                  {healthRate}%
                </span>
                <span className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                  Paid Up
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Badges */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-txt-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Paid Status
              </span>
              <span className="font-space font-semibold text-txt">
                {stats?.paidThisMonthCount ?? 0} members
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-txt-muted">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Due Soon
              </span>
              <span className="font-space font-semibold text-amber-500">
                {stats?.dueSoonMembers.length ?? 0} members
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-txt-muted">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Overdue
              </span>
              <span className="font-space font-semibold text-rose-500">
                {stats?.overdueMembers.length ?? 0} members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. Program Split & Quick Actions Row                                 */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Program Split Widget (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gold-primary" />
              <h3 className="font-space font-bold text-sm text-txt">
                Program Distribution
              </h3>
            </div>
            <span className="text-xs text-txt-muted">
              {stats?.totalMembers || 0} active athletes enrolled
            </span>
          </div>

          {/* Proportional Segmented Bar */}
          <div className="h-3 w-full rounded-full bg-surface-2 overflow-hidden flex">
            {stats && stats.totalMembers > 0 ? (
              <>
                <div
                  style={{
                    width: `${Math.max(5, (stats.regularCount / stats.totalMembers) * 100)}%`,
                  }}
                  className="bg-txt-muted/70 hover:opacity-90 transition-all"
                  title={`Regular: ${stats.regularCount}`}
                />
                <div
                  style={{
                    width: `${Math.max(5, (stats.cuttingCount / stats.totalMembers) * 100)}%`,
                  }}
                  className="bg-sky-400 hover:opacity-90 transition-all"
                  title={`Cutting: ${stats.cuttingCount}`}
                />
                <div
                  style={{
                    width: `${Math.max(5, (stats.bulkingCount / stats.totalMembers) * 100)}%`,
                  }}
                  className="bg-gold-primary hover:opacity-90 transition-all"
                  title={`Bulking: ${stats.bulkingCount}`}
                />
              </>
            ) : (
              <div className="w-full bg-surface-2" />
            )}
          </div>

          {/* 3 Program Mini Stat Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Regular Members */}
            <div className="p-3.5 rounded-xl bg-surface-2 border border-border/70 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Regular</span>
                <span className="text-xs text-txt-muted">Standard Gym</span>
              </div>
              <div className="text-right">
                <span className="font-space font-bold text-xl text-txt">{stats?.regularCount ?? 0}</span>
                <span className="text-[10px] text-txt-muted block">athletes</span>
              </div>
            </div>

            {/* On Cutting */}
            <div className="p-3.5 rounded-xl bg-surface-2 border border-sky-500/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] uppercase font-bold text-sky-400 block">Cutting</span>
                </div>
                <span className="text-xs text-txt-muted">Fat Loss & Definition</span>
              </div>
              <div className="text-right">
                <span className="font-space font-bold text-xl text-sky-400">{stats?.cuttingCount ?? 0}</span>
                <span className="text-[10px] text-txt-muted block">athletes</span>
              </div>
            </div>

            {/* On Bulking */}
            <div className="p-3.5 rounded-xl bg-surface-2 border border-gold-primary/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-gold-primary" />
                  <span className="text-[10px] uppercase font-bold text-gold-primary block">Bulking</span>
                </div>
                <span className="text-xs text-txt-muted">Mass & Hypertrophy</span>
              </div>
              <div className="text-right">
                <span className="font-space font-bold text-xl text-gold-primary">{stats?.bulkingCount ?? 0}</span>
                <span className="text-[10px] text-txt-muted block">athletes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions Dedicated Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-surface border border-border space-y-3.5 flex flex-col justify-between">
          <div>
            <h3 className="font-space font-bold text-sm text-txt">
              Quick Actions
            </h3>
            <p className="text-xs text-txt-muted mt-0.5">
              Direct administrative triggers for everyday gym duties.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/members')}
              className="w-full p-3 rounded-xl bg-gold-primary text-black font-semibold text-xs md:text-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-between shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Member</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/plans')}
              className="w-full p-3 rounded-xl bg-surface-2 hover:bg-surface border border-border text-txt font-semibold text-xs md:text-sm transition-all flex items-center justify-between hover:border-gold-primary/50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-primary" />
                <span>Create Workout Plan</span>
              </div>
              <ArrowRight className="w-4 h-4 text-txt-muted" />
            </button>

            <button
              onClick={() => navigate('/fees')}
              className="w-full p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-border/70 text-txt-muted hover:text-txt text-xs font-medium transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5" />
                <span>Reconcile Monthly Ledger</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. Compact Lists: Fees Due Soon & Overdue Members                    */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List 1: Fees Due Soon */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-space font-bold text-sm text-txt">Fees Due Soon</h3>
                <p className="text-[11px] text-txt-muted">Upcoming renewal cycles</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {stats?.dueSoonMembers.length || 0} Members
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-txt-muted py-6 text-center">Loading due soon members...</p>
          ) : !stats || stats.dueSoonMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-txt-muted space-y-2">
              <Clock className="w-6 h-6 mx-auto opacity-30" />
              <p>No members have fees due soon.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.dueSoonMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-xl bg-surface-2 border border-border/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-txt truncate text-sm">{member.name}</h4>
                    <div className="flex items-center gap-3 text-txt-muted mt-0.5 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <Calendar className="w-3 h-3" />
                        Due: {formatDatePK(member.nextDueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-space font-bold text-txt">
                      {formatPKR(member.monthlyFee)}
                    </span>
                    <button
                      onClick={() => handleQuickMarkPaid(member.id, member.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Record payment"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Mark Paid</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border/60">
            <button
              onClick={() => navigate('/members')}
              className="text-xs text-gold-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View all members</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List 2: Overdue Members */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-space font-bold text-sm text-txt">Overdue Members</h3>
                <p className="text-[11px] text-txt-muted">Lapsed payment deadlines</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30">
              {stats?.overdueMembers.length || 0} Overdue
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-txt-muted py-6 text-center">Loading overdue members...</p>
          ) : !stats || stats.overdueMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-txt-muted space-y-2">
              <ShieldAlert className="w-6 h-6 mx-auto opacity-30" />
              <p>No overdue members. Outstanding collections are fully resolved!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.overdueMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-xl bg-surface-2 border border-rose-500/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-txt truncate text-sm">{member.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500">
                        {member.daysOverdue} days overdue
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-txt-muted mt-0.5 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </span>
                      <span>Due: {formatDatePK(member.nextDueDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-space font-bold text-txt">
                      {formatPKR(member.monthlyFee)}
                    </span>
                    <button
                      onClick={() => handleQuickMarkPaid(member.id, member.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Collect & Mark Paid"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Mark Paid</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border/60">
            <button
              onClick={() => navigate('/fees')}
              className="text-xs text-gold-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View billing ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reset Revenue Confirmation Modal */}
      {isResetRevenueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 space-y-4 animate-scaleUp shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-heading text-lg text-txt">Reset Revenue Overview?</h3>
              <p className="text-xs text-txt-muted mt-1 leading-relaxed">
                This will reset collected cash and revenue totals back to <strong className="text-gold-primary">Rs 0</strong>. Member profiles and active roster will not be deleted.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetRevenueModalOpen(false)}
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
