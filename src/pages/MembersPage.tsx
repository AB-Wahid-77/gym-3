// ============================================================================
// IRONFORGE - Members Management Screen
// Admin member registry: Add, Edit, Delete, Search, Filter by Status and Program,
// Mark as Paid, and Details view.
// Localized for Pakistan: PKR currency, DD/MM/YYYY dates, Feet/Inches height input.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  Calendar,
  Phone,
  Sparkles,
  X,
  Dumbbell,
  AlertCircle,
  Flame,
  Activity,
  Layers,
  Receipt,
  Upload,
} from 'lucide-react';
import { Member, FeeStatus, FitnessGoal, Gender, FeePayment, MemberProgram, PlanReceipt } from '../types';
import { gymService, calculateFeeStatus } from '../services/gymService';
import { useGym } from '../context/GymContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatPKR, formatDatePK, cmToFeetInches, feetInchesToCm, addOneMonth } from '../utils/formatters';
import { PlanReceiptModal } from '../components/PlanReceiptModal';
import { ImportMembersDialog } from '../components/ImportMembersDialog';

export const MembersPage: React.FC = () => {
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Overdue'>('All');
  const [programFilter, setProgramFilter] = useState<MemberProgram | 'All'>('All');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [activePlanReceipt, setActivePlanReceipt] = useState<PlanReceipt | null>(null);

  // Notification / Toast banner inside page
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    const [mList, pList] = await Promise.all([
      gymService.getMembers(),
      gymService.getPayments(),
    ]);
    setMembers(mList);
    setPayments(pList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        m.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.program && m.program.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'Paid' && m.feeStatus !== 'Paid') return false;
      if (statusFilter === 'Overdue' && m.feeStatus !== 'Overdue') return false;
      if (statusFilter === 'Unpaid' && m.feeStatus !== 'Due soon' && m.feeStatus !== 'Overdue') return false;

      // Program filter
      if (programFilter !== 'All') {
        const memProg = m.program || 'Regular member';
        if (memProg !== programFilter) return false;
      }

      return true;
    });
  }, [members, searchQuery, statusFilter, programFilter]);

  // Mark as paid handler
  const handleMarkAsPaid = async (memberId: string, memberName: string) => {
    try {
      const { member } = await gymService.markMemberAsPaid(memberId);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? member : m)));
      const updatedPayments = await gymService.getPayments();
      setPayments(updatedPayments);
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember(member);
      }
      showFeedback(`Payment recorded for ${memberName}. Next due: ${formatDatePK(member.nextDueDate)}`);
    } catch (err: any) {
      console.error('Failed to record payment:', err);
      showFeedback(err.message || 'Failed to record payment. Please try again.', 'error');
    }
  };

  // Delete member handler
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await gymService.deleteMember(memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      if (selectedMember && selectedMember.id === memberToDelete.id) {
        setSelectedMember(null);
      }
      showFeedback(`Member ${memberToDelete.name} has been removed.`, 'info');
      setMemberToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete member:', err);
      showFeedback(err.message || 'Failed to delete member. Please try again.', 'error');
    }
  };

  const renderProgramBadge = (prog?: MemberProgram) => {
    const val = prog || 'Regular member';
    if (val === 'Bulking') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-primary/15 text-gold-primary border border-gold-primary/30">
          <Dumbbell className="w-2.5 h-2.5" />
          <span>Bulking</span>
        </span>
      );
    }
    if (val === 'Cutting') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <Flame className="w-2.5 h-2.5" />
          <span>Cutting</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-2 text-txt-muted border border-border">
        <span>Regular</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-txt">
            MEMBERS
          </h1>
          <p className="text-xs md:text-sm text-txt-muted mt-1">
            Manage gym athletes, fee statuses, training programs, and personal records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt font-semibold text-sm hover:bg-surface-2/80 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-gold-primary" />
            <span>Import from File</span>
          </button>

          <button
            onClick={() => {
              setEditingMember(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-primary text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between animate-fadeIn ${
            feedback.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
              : feedback.type === 'info'
              ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Status Filter & Program Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone (+92...), program, or goal..."
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-xl bg-surface-2 border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-gold-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {(['All', 'Paid', 'Unpaid', 'Overdue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab
                    ? 'bg-gold-primary text-black'
                    : 'bg-surface-2 text-txt-muted hover:text-txt hover:bg-surface-2/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Program Filter Pills */}
          <div className="flex items-center gap-1 border-l border-border pl-2">
            {(['All', 'Regular member', 'Cutting', 'Bulking'] as const).map((prog) => (
              <button
                key={prog}
                onClick={() => setProgramFilter(prog)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  programFilter === prog
                    ? 'bg-txt text-bg'
                    : 'bg-surface-2 text-txt-muted hover:text-txt hover:bg-surface-2/80'
                }`}
              >
                {prog === 'Regular member' ? 'Regular' : prog}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members List Container */}
      {loading ? (
        <div className="p-12 text-center text-txt-muted text-sm rounded-2xl bg-surface border border-border">
          Loading gym members...
        </div>
      ) : members.length === 0 ? (
        /* Completely Empty State */
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 text-gold-primary flex items-center justify-center mx-auto">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-txt">NO MEMBERS YET</h3>
            <p className="text-xs text-txt-muted max-w-sm mx-auto mt-1">
              Add your first member to begin tracking monthly fees, training programs, and customized fitness protocols.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingMember(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-primary text-black font-semibold text-xs md:text-sm hover:brightness-110 transition-all shadow-md shadow-gold-primary/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add First Member</span>
          </button>
        </div>
      ) : filteredMembers.length === 0 ? (
        /* Filter Empty State */
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-2 text-txt-muted flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-txt">No matching members found</p>
          <p className="text-xs text-txt-muted max-w-sm mx-auto">
            Try adjusting your search query, status, or program filter.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-txt-muted font-semibold">
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Program</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Metrics</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-2/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-txt group-hover:text-gold-primary transition-colors">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-txt-muted">
                          Joined {formatDatePK(member.joinDate)} • {member.age} yrs, {member.gender}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {renderProgramBadge(member.program)}
                      </td>
                      <td className="py-3.5 px-4 text-txt-muted whitespace-nowrap">
                        {member.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-txt">{member.goal}</span>
                        <div className="text-[11px] text-txt-muted">
                          {cmToFeetInches(member.height).display} • {member.weight}kg
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-txt">
                        {formatPKR(member.monthlyFee)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-txt-muted">
                        {formatDatePK(member.nextDueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={member.feeStatus} size="sm" />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {member.feeStatus !== 'Paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(member.id, member.name)}
                              className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 transition-colors"
                              title="Mark as paid"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              navigate('/plans', { state: { preselectMemberId: member.id } });
                            }}
                            className="p-1.5 rounded-lg text-txt-muted hover:text-gold-primary hover:bg-surface-2 transition-colors"
                            title="Generate fitness plan"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors"
                            title="Edit member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="p-1.5 rounded-lg text-txt-muted hover:text-rose-500 hover:bg-surface-2 transition-colors"
                            title="Delete member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="p-4 rounded-2xl bg-surface border border-border space-y-3 cursor-pointer hover:border-gold-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-txt text-sm">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {renderProgramBadge(member.program)}
                      <span className="text-[11px] text-txt-muted">{member.goal}</span>
                    </div>
                  </div>
                  <StatusBadge status={member.feeStatus} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/60">
                  <div>
                    <span className="text-[10px] text-txt-muted uppercase block">Phone</span>
                    <span className="font-medium text-txt">{member.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-txt-muted uppercase block">Fee & Due</span>
                    <span className="font-semibold text-txt">
                      {formatPKR(member.monthlyFee)} • {formatDatePK(member.nextDueDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-txt-muted uppercase block">Height & Weight</span>
                    <span className="text-txt">{cmToFeetInches(member.height).display} • {member.weight}kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-txt-muted uppercase block">Joined</span>
                    <span className="text-txt">{formatDatePK(member.joinDate)}</span>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      navigate('/plans', { state: { preselectMemberId: member.id } });
                    }}
                    className="text-xs text-gold-primary font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Plan</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {member.feeStatus !== 'Paid' && (
                      <button
                        onClick={() => handleMarkAsPaid(member.id, member.name)}
                        className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 transition-colors"
                        title="Mark as paid"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors"
                      title="Edit member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMemberToDelete(member)}
                      className="p-1.5 rounded-lg text-txt-muted hover:text-rose-500 hover:bg-surface-2 transition-colors"
                      title="Delete member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Member Details Drawer / Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-scaleUp shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-heading text-lg md:text-xl text-txt">
                  {selectedMember.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {renderProgramBadge(selectedMember.program)}
                  <span className="text-xs text-txt-muted">
                    Joined {formatDatePK(selectedMember.joinDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(selectedMember);
                    setIsAddModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-2 hover:bg-gold-primary/10 hover:text-gold-primary text-txt-muted text-xs font-semibold flex items-center gap-1 border border-border cursor-pointer transition-colors"
                  title="Edit Athlete Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-surface-2 border border-border">
              <div>
                <span className="text-[10px] uppercase text-txt-muted block">Phone</span>
                <span className="font-semibold text-txt">{selectedMember.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-txt-muted block">Demographics</span>
                <span className="font-semibold text-txt">
                  {selectedMember.age} yrs • {selectedMember.gender}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-txt-muted block">Height & Weight</span>
                <span className="font-semibold text-txt">
                  {cmToFeetInches(selectedMember.height).display} • {selectedMember.weight} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-txt-muted block">Primary Goal</span>
                <span className="font-semibold text-gold-primary">{selectedMember.goal}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-txt-muted block">Next Due Date</span>
                <span className="font-semibold text-txt">{formatDatePK(selectedMember.nextDueDate)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-txt-muted block">Fee Status</span>
                <StatusBadge status={selectedMember.feeStatus} size="sm" />
              </div>
            </div>

            {/* Notes */}
            {selectedMember.notes && (
              <div className="p-3 rounded-xl bg-surface-2/60 border border-border/70 text-xs">
                <span className="text-[10px] uppercase text-txt-muted block mb-1 font-semibold">
                  Admin Coaching Notes
                </span>
                <p className="text-txt leading-relaxed">{selectedMember.notes}</p>
              </div>
            )}

            {/* Payment History List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-txt">
                  Payment History
                </h4>
                <span className="text-[11px] text-txt-muted">
                  Monthly rate: {formatPKR(selectedMember.monthlyFee)}
                </span>
              </div>

              {payments.filter((p) => p.memberId === selectedMember.id).length === 0 ? (
                <p className="text-xs text-txt-muted py-2">No past payments recorded yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {payments
                    .filter((p) => p.memberId === selectedMember.id)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-border/50 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-txt">
                            {formatPKR(p.amount)}
                          </span>
                          <span className="text-txt-muted ml-2">{formatDatePK(p.date)}</span>
                        </div>
                        <StatusBadge status={p.status} size="sm" />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Assigned Coaching Protocols & Plan Receipts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-txt">
                  Assigned Protocols & Receipts
                </h4>
                <span className="text-[11px] text-txt-muted">
                  {selectedMember.savedPlans?.length || 0} Saved
                </span>
              </div>

              {(!selectedMember.savedPlans || selectedMember.savedPlans.length === 0) ? (
                <p className="text-xs text-txt-muted py-1">No custom training plans saved yet for this athlete.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedMember.savedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3 rounded-xl bg-surface-2 border border-border/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-txt">{plan.title}</span>
                        {plan.price && (
                          <span className="text-gold-primary font-mono font-bold">
                            {formatPKR(plan.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-txt-muted">
                        <span>{plan.goal} • {plan.daysPerWeek || 4} days/wk</span>
                        <span>{formatDatePK(plan.generatedDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {plan.receipt && (
                          <button
                            type="button"
                            onClick={() => setActivePlanReceipt(plan.receipt!)}
                            className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-gold-primary/60 text-gold-primary text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>View Receipt</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMember(null);
                            navigate('/plans', {
                              state: {
                                preselectMemberId: selectedMember.id,
                                viewPlanId: plan.id,
                              },
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-gold-primary/60 text-txt text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-gold-primary" />
                          <span>Open in Plans</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              {selectedMember.feeStatus !== 'Paid' && (
                <button
                  onClick={() => handleMarkAsPaid(selectedMember.id, selectedMember.name)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-colors"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Mark as Paid Now</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedMember(null);
                  navigate('/plans', { state: { preselectMemberId: selectedMember.id } });
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Workout Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <MemberFormModal
          key={editingMember ? editingMember.id : 'new-member'}
          initialData={editingMember}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingMember(null);
          }}
          onSave={async (saved) => {
            try {
              if (editingMember) {
                const updated = await gymService.updateMember(editingMember.id, saved);
                showFeedback(`Updated ${saved.name}`);
                if (selectedMember && selectedMember.id === editingMember.id) {
                  setSelectedMember(updated);
                }
              } else {
                await gymService.addMember(saved as any);
                showFeedback(`Added new member: ${saved.name}`);
              }
              await loadData();
              setIsAddModalOpen(false);
              setEditingMember(null);
            } catch (err: any) {
              console.error('Failed to save member:', err);
              showFeedback(err.message || 'Failed to save member. Please try again.', 'error');
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 space-y-4 animate-scaleUp">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-heading text-lg text-txt">Delete Member?</h3>
              <p className="text-xs text-txt-muted mt-1 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-txt">{memberToDelete.name}</span>? This will permanently delete their profile.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-txt text-xs font-semibold hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Member Import Dialog */}
      <ImportMembersDialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onMembersImported={(count) => {
          loadData();
          showFeedback(`Successfully imported and registered ${count} athlete${count === 1 ? '' : 's'}!`);
        }}
        onFallbackToManualAdd={() => {
          setEditingMember(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Plan Receipt Modal */}
      {activePlanReceipt && (
        <PlanReceiptModal
          receipt={activePlanReceipt}
          onClose={() => setActivePlanReceipt(null)}
          showToast={(msg, type) => showFeedback(msg, type || 'success')}
        />
      )}
    </div>
  );
};

// ============================================================================
// Member Form Modal (Add / Edit)
// Inputs: Name, +92 Phone, Age, Gender, Height (Feet & Inches with cm sync),
// Weight, Goal, Program, Monthly Fee, Join Date, Fee Status, Notes.
// ============================================================================
interface MemberFormModalProps {
  initialData: Member | null;
  onClose: () => void;
  onSave: (data: Partial<Member>) => Promise<void>;
}

const MemberFormModal: React.FC<MemberFormModalProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const { gym } = useGym();
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [age, setAge] = useState(initialData?.age || 25);
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'Male');

  // Height dual state: feet & inches (normalized to prevent 5 ft 12 in edge case)
  const initialHeightCm = initialData?.height || 175;
  const { feet: initialFeet, inches: initialInches } = cmToFeetInches(initialHeightCm);

  const [heightFeet, setHeightFeet] = useState(initialFeet);
  const [heightInches, setHeightInches] = useState(initialInches);
  const [heightCm, setHeightCm] = useState(initialHeightCm);

  const [weight, setWeight] = useState(initialData?.weight || 75);
  const [goal, setGoal] = useState<FitnessGoal>(initialData?.goal || 'General Fitness');
  const [program, setProgram] = useState<MemberProgram>(initialData?.program || 'Regular member');
  const [activityLevel, setActivityLevel] = useState<string>(
    initialData?.activityLevel || 'Moderately Active (3-5 days/week)'
  );
  const [joinDate, setJoinDate] = useState(
    initialData?.joinDate || new Date().toISOString().split('T')[0]
  );
  const [nextDueDate, setNextDueDate] = useState<string>(
    initialData?.nextDueDate || addOneMonth(initialData?.joinDate || new Date().toISOString().split('T')[0])
  );
  const [monthlyFee, setMonthlyFee] = useState(
    initialData?.monthlyFee || gym.defaultMonthlyFee
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [feeStatus, setFeeStatus] = useState<FeeStatus>(initialData?.feeStatus || 'Paid');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Keep internal state aligned if initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setAge(initialData.age || 25);
      setGender(initialData.gender || 'Male');
      const hCm = initialData.height || 175;
      setHeightCm(hCm);
      const { feet, inches } = cmToFeetInches(hCm);
      setHeightFeet(feet);
      setHeightInches(inches);
      setWeight(initialData.weight || 75);
      setGoal(initialData.goal || 'General Fitness');
      setProgram(initialData.program || 'Regular member');
      setActivityLevel(initialData.activityLevel || 'Moderately Active (3-5 days/week)');
      setJoinDate(initialData.joinDate || new Date().toISOString().split('T')[0]);
      setNextDueDate(initialData.nextDueDate || addOneMonth(new Date().toISOString().split('T')[0]));
      setMonthlyFee(initialData.monthlyFee || gym.defaultMonthlyFee);
      setNotes(initialData.notes || '');
      setFeeStatus(initialData.feeStatus || 'Paid');
    }
  }, [initialData, gym.defaultMonthlyFee]);

  // Sync feet & inches to cm
  const handleFeetChange = (f: number) => {
    setHeightFeet(f);
    const cm = feetInchesToCm(f, heightInches);
    setHeightCm(cm);
  };

  const handleInchesChange = (inch: number) => {
    if (inch >= 12) {
      const extraFeet = Math.floor(inch / 12);
      const remInches = inch % 12;
      const newFeet = heightFeet + extraFeet;
      setHeightFeet(newFeet);
      setHeightInches(remInches);
      const cm = feetInchesToCm(newFeet, remInches);
      setHeightCm(cm);
    } else {
      setHeightInches(inch);
      const cm = feetInchesToCm(heightFeet, inch);
      setHeightCm(cm);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Member name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        age: Number(age),
        gender,
        height: Number(heightCm) || 175,
        weight: Number(weight),
        goal,
        program,
        activityLevel,
        joinDate,
        nextDueDate,
        monthlyFee: Number(monthlyFee),
        notes: notes.trim(),
        feeStatus,
      });
    } catch {
      setError('Failed to save member');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-heading text-lg text-txt">
            {initialData ? 'EDIT MEMBER' : 'ADD NEW MEMBER'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bilal Ahmed"
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>

          {/* Program & Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Assigned Program *</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value as MemberProgram)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              >
                <option value="Regular member">Regular member</option>
                <option value="Cutting">Cutting</option>
                <option value="Bulking">Bulking</option>
              </select>
            </div>
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Primary Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              >
                <option value="Bulking">Bulking</option>
                <option value="Cutting">Cutting</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>
          </div>

          {/* Age, Gender, Height (Feet & Inches), Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Age & Gender</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  min="12"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  placeholder="Age"
                  className="w-full px-2.5 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-2 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Height in Feet & Inches (Pakistan Standard) */}
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">
                Height ({heightFeet}&apos;{heightInches}&quot; ~ {heightCm}cm)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="relative">
                  <input
                    type="number"
                    min="3"
                    max="7"
                    value={heightFeet}
                    onChange={(e) => handleFeetChange(Number(e.target.value))}
                    className="w-full px-2.5 py-2 pr-7 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-txt-muted text-[11px]">ft</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightInches}
                    onChange={(e) => handleInchesChange(Number(e.target.value))}
                    className="w-full px-2.5 py-2 pr-7 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-txt-muted text-[11px]">in</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="300"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>

          {/* Monthly Fee, Join Date & Fee Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">
                Monthly Fee ({gym.currency.symbol})
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Join Date</label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Fee Status</label>
              <select
                value={feeStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as FeeStatus;
                  setFeeStatus(newStatus);
                  const todayStr = new Date().toISOString().split('T')[0];
                  if (newStatus === 'Paid') {
                    setNextDueDate(addOneMonth(todayStr));
                  } else if (newStatus === 'Due soon') {
                    setNextDueDate(todayStr);
                  } else if (newStatus === 'Overdue') {
                    const past = new Date();
                    past.setDate(past.getDate() - 7);
                    setNextDueDate(past.toISOString().split('T')[0]);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              >
                <option value="Paid">Paid</option>
                <option value="Due soon">Due soon</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Next Fee Due Date & Activity Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Next Fee Due Date</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => {
                  setNextDueDate(e.target.value);
                  setFeeStatus(calculateFeeStatus(e.target.value));
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-txt-muted mb-1 font-semibold">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary"
              >
                <option value="Sedentary (desk job, little exercise)">Sedentary (desk job, little exercise)</option>
                <option value="Lightly Active (1-3 days/week)">Lightly Active (1-3 days/week)</option>
                <option value="Moderately Active (3-5 days/week)">Moderately Active (3-5 days/week)</option>
                <option value="Very Active (6-7 days/week)">Very Active (6-7 days/week)</option>
                <option value="Extremely Active (hard physical labor/athlete)">Extremely Active</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-txt-muted mb-1 font-semibold">Admin Notes & Health Constraints</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Past injuries, dietary habits, training experience..."
              className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-txt focus:outline-none focus:border-gold-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-txt hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gold-primary text-black font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-gold-primary/20"
            >
              {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
