// ============================================================================
// IRONFORGE - Exercise Swap Picker Modal
// Quick-swapping modal filtered by muscle group for fast routine editing.
// ============================================================================

import React, { useState } from 'react';
import { MuscleGroup, LibraryExercise } from '../types';
import { EXERCISE_LIBRARY } from '../services/exerciseLibrary';
import { X, Dumbbell, Check } from 'lucide-react';

interface ExerciseSwapPickerModalProps {
  isOpen: boolean;
  currentExerciseName: string;
  initialMuscleGroup: MuscleGroup;
  onSelect: (exercise: LibraryExercise) => void;
  onClose: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
];

export const ExerciseSwapPickerModal: React.FC<ExerciseSwapPickerModalProps> = ({
  isOpen,
  currentExerciseName,
  initialMuscleGroup,
  onSelect,
  onClose,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>(initialMuscleGroup);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesGroup = ex.muscleGroup === selectedGroup;
    const matchesSearch =
      !search.trim() || ex.name.toLowerCase().includes(search.toLowerCase().trim());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-primary/20 text-gold-primary flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-xs sm:text-sm text-txt">SWAP EXERCISE</h3>
              <p className="text-[11px] text-txt-muted truncate max-w-[240px]">
                Replacing: <strong className="text-gold-primary">{currentExerciseName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Muscle Group Filter Tabs */}
        <div className="p-3 border-b border-border bg-surface flex flex-wrap gap-1.5">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedGroup === group
                  ? 'bg-gold-primary text-black shadow-xs'
                  : 'bg-surface-2 text-txt-muted hover:text-txt hover:bg-surface-2/80'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 pt-2">
          <input
            type="text"
            placeholder={`Search ${selectedGroup} exercises...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-2 text-txt px-3 py-1.5 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
          />
        </div>

        {/* Exercise List */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((ex) => {
              const isCurrent = ex.name.toLowerCase() === currentExerciseName.toLowerCase();
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    onSelect(ex);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isCurrent
                      ? 'bg-gold-primary/10 border-gold-primary text-txt'
                      : 'bg-surface-2/60 border-border/70 hover:border-gold-primary/60 hover:bg-surface-2 text-txt'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="font-semibold block">{ex.name}</span>
                    <span className="text-[10px] text-txt-muted">
                      Default: {ex.defaultSets} sets × {ex.defaultReps} • Rest: {ex.defaultRest}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="shrink-0 text-[10px] font-bold text-gold-primary flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Current</span>
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-txt-muted text-center py-6">
              No exercises match &quot;{search}&quot; under {selectedGroup}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
