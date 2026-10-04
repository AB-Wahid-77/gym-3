// ============================================================================
// IRONFORGE - Bulk Member Import Dialog (PDF / Word .docx)
// Extracts text client-side, parses structured member records via Gemini,
// provides an inline editable preview table with validation & highlighted blanks,
// and saves all confirmed athletes directly into the gym registry.
// ============================================================================

import React, { useState, useRef } from 'react';
import { getAuthToken } from '../context/AuthContext';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { extractTextFromDocument, MAX_FILE_SIZE_BYTES } from '../utils/documentParser';
import { Member, MemberProgram, FitnessGoal, Gender, FeeStatus } from '../types';
import { gymService } from '../services/gymService';
import { cmToFeetInches } from '../utils/formatters';

interface ExtractedMemberDraft {
  tempId: string;
  name: string;
  phone: string;
  age: string;
  gender: Gender;
  height: string; // in cm
  weight: string; // in kg
  goal: FitnessGoal;
  program: MemberProgram;
  monthlyFee: string;
  joinDate: string;
  notes: string;
  feeStatus: FeeStatus;
}

interface ImportMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMembersImported: (importedCount: number) => void;
  onFallbackToManualAdd: () => void;
}

export const ImportMembersDialog: React.FC<ImportMembersDialogProps> = ({
  isOpen,
  onClose,
  onMembersImported,
  onFallbackToManualAdd,
}) => {
  const [step, setStep] = useState<'upload' | 'extracting' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [draftMembers, setDraftMembers] = useState<ExtractedMemberDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setErrorMsg(null);
    setLoadingStatus('');
    setDraftMembers([]);
    setSaving(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelected = async (selectedFile: File) => {
    setErrorMsg(null);

    // 1. Client-side size validation
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('File exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    const name = selectedFile.name.toLowerCase();
    const isPdf = name.endsWith('.pdf') || selectedFile.type === 'application/pdf';
    const isDocx =
      name.endsWith('.docx') ||
      selectedFile.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isPdf && !isDocx) {
      setErrorMsg('Invalid file format. Please select a .pdf or .docx document.');
      return;
    }

    setFile(selectedFile);
    setStep('extracting');
    setLoadingStatus(`Reading document: ${selectedFile.name}...`);

    try {
      // 2. Client-side raw text extraction
      const parseResult = await extractTextFromDocument(selectedFile);

      setLoadingStatus('Document parsed. Analyzing with Gemini AI to extract member profiles...');

      // 3. Send text to backend server route
      const token = getAuthToken();
      const response = await fetch('/api/members/extract-from-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: parseResult.text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to extract member details from document.'
        );
      }

      const rawList = Array.isArray(data.members) ? data.members : [];

      if (rawList.length === 0) {
        setErrorMsg(
          'Gemini could not detect any member profiles in this document. You can enter them manually.'
        );
        setStep('upload');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Map into editable drafts
      const drafts: ExtractedMemberDraft[] = rawList.map((item: any, idx: number) => {
        let gender: Gender = 'Male';
        const gStr = String(item.gender || '').toLowerCase();
        if (gStr.includes('fem')) gender = 'Female';
        else if (gStr.includes('oth')) gender = 'Other';

        let goal: FitnessGoal = 'General Fitness';
        const goalStr = String(item.goal || '').toLowerCase();
        if (goalStr.includes('bulk')) goal = 'Bulking';
        else if (goalStr.includes('cut')) goal = 'Cutting';

        let program: MemberProgram = 'Regular member';
        const progStr = String(item.program || '').toLowerCase();
        if (progStr.includes('bulk')) program = 'Bulking';
        else if (progStr.includes('cut')) program = 'Cutting';

        return {
          tempId: `draft-${Date.now()}-${idx}`,
          name: item.name ? String(item.name).trim() : '',
          phone: item.phone ? String(item.phone).trim() : '',
          age: item.age ? String(item.age) : '',
          gender,
          height: item.height ? String(item.height) : '',
          weight: item.weight ? String(item.weight) : '',
          goal,
          program,
          monthlyFee: item.monthlyFee ? String(item.monthlyFee) : '3000',
          joinDate: item.joinDate && /^\d{4}-\d{2}-\d{2}$/.test(item.joinDate) ? item.joinDate : today,
          notes: item.notes ? String(item.notes) : '',
          feeStatus: 'Paid',
        };
      });

      setDraftMembers(drafts);
      setStep('preview');
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMsg(
        err.message ||
          'Failed to process file. You can still add members manually using "Add Member".'
      );
      setStep('upload');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  // Field updater in preview
  const handleUpdateDraft = (
    tempId: string,
    field: keyof ExtractedMemberDraft,
    value: any
  ) => {
    setDraftMembers((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, [field]: value } : d))
    );
  };

  // Remove row
  const handleRemoveDraft = (tempId: string) => {
    setDraftMembers((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  // Add empty manual row in table
  const handleAddEmptyRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const newDraft: ExtractedMemberDraft = {
      tempId: `draft-${Date.now()}-${draftMembers.length}`,
      name: '',
      phone: '',
      age: '',
      gender: 'Male',
      height: '',
      weight: '',
      goal: 'General Fitness',
      program: 'Regular member',
      monthlyFee: '3000',
      joinDate: today,
      notes: '',
      feeStatus: 'Paid',
    };
    setDraftMembers((prev) => [...prev, newDraft]);
  };

  // Validation checks
  const invalidRows = draftMembers.filter(
    (d) => !d.name.trim() || !d.phone.trim()
  );
  const validRows = draftMembers.filter((d) => d.name.trim() && d.phone.trim());

  // Confirm and Save All to gymService
  const handleConfirmImport = async () => {
    if (draftMembers.length === 0) return;

    if (invalidRows.length > 0) {
      setErrorMsg(
        `Please provide at least a Name and Phone number for all highlighted rows before importing (${invalidRows.length} incomplete).`
      );
      return;
    }

    try {
      setSaving(true);
      const membersToSave = draftMembers.map((d) => {
        const ageNum = parseInt(d.age, 10) || 25;
        const heightNum = parseInt(d.height, 10) || 175;
        const weightNum = parseFloat(d.weight) || 75;
        const feeNum = parseInt(d.monthlyFee, 10) || 3000;

        return {
          name: d.name.trim(),
          phone: d.phone.trim(),
          age: ageNum,
          gender: d.gender,
          height: heightNum,
          weight: weightNum,
          goal: d.goal,
          program: d.program,
          monthlyFee: feeNum,
          joinDate: d.joinDate || new Date().toISOString().split('T')[0],
          feeStatus: d.feeStatus,
          notes: d.notes.trim() || 'Imported via bulk document ingestion',
        };
      });

      await gymService.addMembersBulk(membersToSave);
      onMembersImported(membersToSave.length);
      handleClose();
    } catch (err: any) {
      console.error('Failed to save imported members:', err);
      setErrorMsg('Failed to save members to storage. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-5xl rounded-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-2/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-primary/20 text-gold-primary border border-gold-primary/30 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm sm:text-base text-txt tracking-wide">
                  IMPORT MEMBERS FROM FILE
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gold-primary/15 text-gold-primary border border-gold-primary/30 uppercase tracking-wider">
                  PDF & DOCX
                </span>
              </div>
              <p className="text-xs text-txt-muted">
                Extract athlete records automatically with Gemini AI & client-side text parsing.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs sm:text-sm space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-300">Import Alert</p>
                  <p className="mt-0.5 text-xs text-rose-300/90">{errorMsg}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-txt-muted">
                  You can fall back to the standard member registration form anytime.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onFallbackToManualAdd();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface text-txt border border-border hover:border-gold-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Use Manual &quot;Add Member&quot;</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-primary" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: UPLOAD ZONE */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                  dragActive
                    ? 'border-gold-primary bg-gold-primary/10'
                    : 'border-border hover:border-gold-primary/60 bg-surface-2/40 hover:bg-surface-2/70'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-gold-primary/15 text-gold-primary flex items-center justify-center shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-heading text-base sm:text-lg text-txt">
                    Select or Drop Member Document
                  </h4>
                  <p className="text-xs text-txt-muted mt-1 max-w-md mx-auto">
                    Upload an athlete registration sheet, roster list, or onboarding form in{' '}
                    <strong className="text-txt">.PDF</strong> or{' '}
                    <strong className="text-txt">.DOCX</strong> format (Max 10MB).
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-surface border border-border text-txt">
                    PDF Document (.pdf)
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-surface border border-border text-txt">
                    Word Document (.docx)
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Helpful Tips Card */}
              <div className="p-4 rounded-xl bg-surface-2/50 border border-border/70 text-xs space-y-2">
                <div className="flex items-center gap-2 text-gold-primary font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>How Bulk Import Works</span>
                </div>
                <ul className="text-txt-muted space-y-1 pl-4 list-disc marker:text-gold-primary text-[11px] leading-relaxed">
                  <li>
                    Client-side extraction reads text directly from your document without uploading sensitive files to third-party file storage.
                  </li>
                  <li>
                    Gemini AI automatically parses names, Pakistani phone numbers, age, height, weight, goal, and monthly fee.
                  </li>
                  <li>
                    You will review and edit every extracted athlete row in an interactive preview table before any member is saved.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: PARSING & AI EXTRACTION IN PROGRESS */}
          {step === 'extracting' && (
            <div className="p-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold-primary animate-spin" />
                <Sparkles className="w-5 h-5 text-gold-primary absolute" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-base text-txt">
                  EXTRACTING ATHLETE DATA
                </h4>
                <p className="text-xs text-txt-muted max-w-md mx-auto">{loadingStatus}</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-txt-muted">
                <FileText className="w-4 h-4 text-gold-primary" />
                <span>{file?.name}</span>
                <span>•</span>
                <span>{((file?.size || 0) / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & EDITABLE TABLE */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-2 border border-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-txt">
                    Found {draftMembers.length} Member{draftMembers.length === 1 ? '' : 's'}
                  </span>
                  <span className="text-xs text-txt-muted">
                    ({validRows.length} ready to save
                    {invalidRows.length > 0 && (
                      <span className="text-amber-400 font-semibold ml-1">
                        • {invalidRows.length} missing required fields
                      </span>
                    )}
                    )
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddEmptyRow}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary text-xs font-semibold text-txt flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-primary" />
                    <span>Add Row</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-rose-500/60 text-xs font-semibold text-txt-muted hover:text-txt cursor-pointer"
                  >
                    <span>Import Another File</span>
                  </button>
                </div>
              </div>

              {invalidRows.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Yellow highlighted cells indicate missing data. <strong>Name</strong> and{' '}
                    <strong>Phone</strong> are required before saving. Everything else can be filled or edited later.
                  </span>
                </div>
              )}

              {/* Table Container with Horizontal Scroll */}
              <div className="rounded-xl border border-border overflow-hidden bg-surface">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-2/90 border-b border-border sticky top-0 z-10 text-[11px] font-bold text-txt-muted uppercase tracking-wider whitespace-nowrap">
                        <th className="py-2.5 px-3 w-10 text-center">Status</th>
                        <th className="py-2.5 px-3 min-w-[160px]">
                          Name <span className="text-rose-400">*</span>
                        </th>
                        <th className="py-2.5 px-3 min-w-[140px]">
                          Phone <span className="text-rose-400">*</span>
                        </th>
                        <th className="py-2.5 px-3 min-w-[80px]">Age</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Gender</th>
                        <th className="py-2.5 px-3 min-w-[90px]">Height (cm)</th>
                        <th className="py-2.5 px-3 min-w-[90px]">Weight (kg)</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Goal</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Program</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Monthly Fee</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Join Date</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Notes</th>
                        <th className="py-2.5 px-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {draftMembers.map((draft, idx) => {
                        const isNameMissing = !draft.name.trim();
                        const isPhoneMissing = !draft.phone.trim();
                        const isValid = !isNameMissing && !isPhoneMissing;

                        return (
                          <tr
                            key={draft.tempId}
                            className={`hover:bg-surface-2/50 transition-colors ${
                              !isValid ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            {/* Validation Icon */}
                            <td className="py-2 px-3 text-center">
                              {isValid ? (
                                <span title="Ready to import">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline-block" />
                                </span>
                              ) : (
                                <span title="Missing Name or Phone">
                                  <AlertTriangle className="w-4 h-4 text-amber-400 inline-block" />
                                </span>
                              )}
                            </td>

                            {/* Name */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={draft.name}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'name', e.target.value)
                                }
                                placeholder="Full name (Required)"
                                className={`w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface border text-txt focus:outline-none focus:border-gold-primary ${
                                  isNameMissing
                                    ? 'border-amber-400/80 bg-amber-400/10 placeholder:text-amber-300/70'
                                    : 'border-border'
                                }`}
                              />
                            </td>

                            {/* Phone */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={draft.phone}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'phone', e.target.value)
                                }
                                placeholder="03XX-XXXXXXX"
                                className={`w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface border text-txt focus:outline-none focus:border-gold-primary ${
                                  isPhoneMissing
                                    ? 'border-amber-400/80 bg-amber-400/10 placeholder:text-amber-300/70'
                                    : 'border-border'
                                }`}
                              />
                            </td>

                            {/* Age */}
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min={10}
                                max={90}
                                value={draft.age}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'age', e.target.value)
                                }
                                placeholder="e.g. 25"
                                className={`w-full px-2 py-1.5 rounded-lg text-xs bg-surface border text-txt focus:outline-none focus:border-gold-primary ${
                                  !draft.age ? 'border-border/60 bg-surface/50' : 'border-border'
                                }`}
                              />
                            </td>

                            {/* Gender */}
                            <td className="py-2 px-3">
                              <select
                                value={draft.gender}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'gender', e.target.value)
                                }
                                className="w-full px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary cursor-pointer"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </td>

                            {/* Height (cm) */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  min={100}
                                  max={250}
                                  value={draft.height}
                                  onChange={(e) =>
                                    handleUpdateDraft(draft.tempId, 'height', e.target.value)
                                  }
                                  placeholder="cm"
                                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary"
                                />
                                {draft.height && parseInt(draft.height, 10) > 0 && (
                                  <span className="block text-[10px] text-txt-muted mt-0.5 whitespace-nowrap">
                                    {cmToFeetInches(parseInt(draft.height, 10)).display}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Weight (kg) */}
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min={30}
                                max={250}
                                step="0.5"
                                value={draft.weight}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'weight', e.target.value)
                                }
                                placeholder="kg"
                                className="w-full px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary"
                              />
                            </td>

                            {/* Goal */}
                            <td className="py-2 px-3">
                              <select
                                value={draft.goal}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'goal', e.target.value)
                                }
                                className="w-full px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary cursor-pointer"
                              >
                                <option value="General Fitness">General Fitness</option>
                                <option value="Bulking">Bulking</option>
                                <option value="Cutting">Cutting</option>
                              </select>
                            </td>

                            {/* Program */}
                            <td className="py-2 px-3">
                              <select
                                value={draft.program}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'program', e.target.value)
                                }
                                className="w-full px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary cursor-pointer"
                              >
                                <option value="Regular member">Regular member</option>
                                <option value="Bulking">Bulking</option>
                                <option value="Cutting">Cutting</option>
                              </select>
                            </td>

                            {/* Monthly Fee */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <span className="absolute left-2 top-1.5 text-[11px] text-txt-muted">
                                  Rs
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  step={100}
                                  value={draft.monthlyFee}
                                  onChange={(e) =>
                                    handleUpdateDraft(draft.tempId, 'monthlyFee', e.target.value)
                                  }
                                  placeholder="3000"
                                  className="w-full pl-7 pr-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary font-mono"
                                />
                              </div>
                            </td>

                            {/* Join Date */}
                            <td className="py-2 px-3">
                              <input
                                type="date"
                                value={draft.joinDate}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'joinDate', e.target.value)
                                }
                                className="w-full px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary"
                              />
                            </td>

                            {/* Notes */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={draft.notes}
                                onChange={(e) =>
                                  handleUpdateDraft(draft.tempId, 'notes', e.target.value)
                                }
                                placeholder="Injuries, health notes..."
                                className="w-full px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-txt focus:outline-none focus:border-gold-primary"
                              />
                            </td>

                            {/* Delete row action */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveDraft(draft.tempId)}
                                className="p-1 rounded-md text-txt-muted hover:text-rose-400 hover:bg-surface-2 transition-colors cursor-pointer"
                                title="Remove row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Confirmation Bar */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface-2/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-txt-muted">
            {step === 'preview' ? (
              <span>
                Ready to import <strong className="text-txt">{validRows.length}</strong> confirmed athlete{validRows.length === 1 ? '' : 's'} into IRONFORGE.
              </span>
            ) : (
              <span>All imports are encrypted in-transit and processed privately.</span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-surface border border-border text-txt-muted hover:text-txt text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            {step === 'preview' && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={saving || draftMembers.length === 0}
                className="px-5 py-2 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {saving ? 'Importing Members...' : `Add These Members (${validRows.length})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
