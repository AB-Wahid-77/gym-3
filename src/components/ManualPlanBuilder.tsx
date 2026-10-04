// ============================================================================
// IRONFORGE - Mode C: Manual Plan Builder Component
// Enables admin to manually compose workout days and Pakistani meals
// using free-writing, exercise library, and Pakistani food library.
// Starts completely empty until admin adds days and meals.
// ============================================================================

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Dumbbell,
  Apple,
  Calculator,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  WorkoutDay,
  SampleMeal,
  ExerciseItem,
  MuscleGroup,
  MealTimeSlot,
  GeneratedPlan,
  FitnessGoal,
  Gender,
  FoodPreference,
  BudgetLevel,
} from '../types';
import { EXERCISE_LIBRARY } from '../services/exerciseLibrary';
import { generateUUID } from '../utils/uuid';
import { PAKISTANI_FOOD_LIBRARY } from '../services/foodLibrary';
import { getActivityMultiplier } from '../services/planGenerator';

interface ManualPlanBuilderProps {
  memberName: string;
  selectedMemberId?: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weight: number;
  goal: FitnessGoal;
  foodPreference: FoodPreference;
  budget: BudgetLevel;
  injuries: string;
  onPlanCreated: (plan: GeneratedPlan) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
const MEAL_SLOTS: MealTimeSlot[] = ['Nashta', 'Lunch', 'Snack', 'Dinner'];

export const ManualPlanBuilder: React.FC<ManualPlanBuilderProps> = ({
  memberName,
  selectedMemberId,
  age,
  gender,
  heightCm,
  weight,
  goal,
  foodPreference,
  budget,
  injuries,
  onPlanCreated,
}) => {
  // 1. Days / Workouts State: starts completely empty
  const [days, setDays] = useState<WorkoutDay[]>([]);

  // 2. Meals State: starts completely empty
  const [meals, setMeals] = useState<SampleMeal[]>([]);

  // 3. Nutrition Targets: sensible starting numbers
  const [targetCalories, setTargetCalories] = useState<number>(2400);
  const [proteinGrams, setProteinGrams] = useState<number>(150);
  const [carbsGrams, setCarbsGrams] = useState<number>(240);
  const [fatGrams, setFatGrams] = useState<number>(65);
  const [customPlanTitle, setCustomPlanTitle] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Auto calculate targets from Mifflin-St Jeor
  const handleAutoCalculateStats = () => {
    let bmr = 10 * weight + 6.25 * heightCm - 5 * age;
    bmr = gender === 'Male' ? bmr + 5 : bmr - 161;
    const activityMultiplier = getActivityMultiplier(undefined, days.length || 4);
    const tdee = Math.round(bmr * activityMultiplier);

    let cal = tdee;
    let proRatio = 2.0;
    if (goal === 'Bulking') {
      cal = tdee + 400;
      proRatio = 2.0;
    } else if (goal === 'Cutting') {
      cal = tdee - 450;
      proRatio = 2.2;
    } else {
      cal = tdee;
      proRatio = 1.8;
    }

    const pro = Math.round(weight * proRatio);
    const fat = Math.round((cal * 0.25) / 9);
    const carbs = Math.max(80, Math.round((cal - (pro * 4 + fat * 9)) / 4));

    setTargetCalories(cal);
    setProteinGrams(pro);
    setFatGrams(fat);
    setCarbsGrams(carbs);
  };

  // Auto sum calories & protein directly from the meal rows
  const handleSumFromMeals = () => {
    const totalCal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalPro = meals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
    if (totalCal > 0) {
      setTargetCalories(totalCal);
      setProteinGrams(totalPro);
      const fat = Math.round((totalCal * 0.25) / 9);
      const carbs = Math.max(80, Math.round((totalCal - (totalPro * 4 + fat * 9)) / 4));
      setFatGrams(fat);
      setCarbsGrams(carbs);
    }
  };

  // Day Handlers
  const handleAddDay = () => {
    const dayNumber = days.length + 1;
    setDays([
      ...days,
      {
        day: `Day ${dayNumber}`,
        focus: '',
        notes: '',
        exercises: [],
      },
    ]);
  };

  const handleRemoveDay = (dayIndex: number) => {
    setDays(days.filter((_, i) => i !== dayIndex));
  };

  const handleUpdateDayField = (dayIndex: number, field: keyof WorkoutDay, val: any) => {
    setDays(
      days.map((d, i) => (i === dayIndex ? { ...d, [field]: val } : d))
    );
  };

  // Exercise Handlers
  const handleAddExerciseFromLibrary = (dayIndex: number, exerciseId: string) => {
    if (!exerciseId) return;
    const found = EXERCISE_LIBRARY.find((e) => e.id === exerciseId);
    if (!found) return;

    const newItem: ExerciseItem = {
      name: found.name,
      sets: found.defaultSets,
      reps: found.defaultReps,
      rest: found.defaultRest,
      notes: found.notes || '',
    };

    setDays(
      days.map((d, i) =>
        i === dayIndex ? { ...d, exercises: [...d.exercises, newItem] } : d
      )
    );
  };

  const handleAddBlankExercise = (dayIndex: number) => {
    const newItem: ExerciseItem = {
      name: '',
      sets: '3',
      reps: '10-12',
      rest: '60s',
      notes: '',
    };
    setDays(
      days.map((d, i) =>
        i === dayIndex ? { ...d, exercises: [...d.exercises, newItem] } : d
      )
    );
  };

  const handleUpdateExercise = (
    dayIndex: number,
    exIndex: number,
    field: keyof ExerciseItem,
    val: string
  ) => {
    setDays(
      days.map((d, i) => {
        if (i !== dayIndex) return d;
        const updated = d.exercises.map((ex, j) =>
          j === exIndex ? { ...ex, [field]: val } : ex
        );
        return { ...d, exercises: updated };
      })
    );
  };

  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
    setDays(
      days.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) };
      })
    );
  };

  // Meal Handlers
  const handleAddMealFromLibrary = (foodId: string) => {
    if (!foodId) return;
    const found = PAKISTANI_FOOD_LIBRARY.find((f) => f.id === foodId);
    if (!found) return;

    const slotLabelMap: Record<MealTimeSlot, string> = {
      Nashta: 'Breakfast (Nashta)',
      Lunch: 'Lunch (Dopahar)',
      Snack: 'Evening Snack (Asar)',
      Dinner: 'Dinner (Raat)',
    };

    const newMeal: SampleMeal = {
      time: slotLabelMap[found.slot] || found.slot,
      name: found.name,
      items: found.portion,
      calories: found.calories,
      proteinGrams: found.proteinGrams,
    };

    setMeals([...meals, newMeal]);
  };

  const handleAddBlankMeal = () => {
    const newMeal: SampleMeal = {
      time: 'Meal Slot',
      name: 'Custom Desi Meal',
      items: '',
      calories: 450,
      proteinGrams: 30,
    };
    setMeals([...meals, newMeal]);
  };

  const handleUpdateMeal = (mealIndex: number, field: keyof SampleMeal, val: any) => {
    setMeals(
      meals.map((m, i) => (i === mealIndex ? { ...m, [field]: val } : m))
    );
  };

  const handleRemoveMeal = (mealIndex: number) => {
    setMeals(meals.filter((_, i) => i !== mealIndex));
  };

  // Compile final plan
  const handleBuildAndSubmit = () => {
    const finalTitle =
      customPlanTitle.trim() ||
      `${goal} Manual Protocol - ${memberName || 'Athlete'}`;

    const plan: GeneratedPlan = {
      id: generateUUID(),
      title: finalTitle,
      memberId: selectedMemberId || undefined,
      memberName: memberName || 'Walk-in Athlete',
      goal,
      generatedDate: new Date().toISOString().split('T')[0],
      targetCalories,
      daysPerWeek: days.length,
      splitName: days.length > 0 ? `${days.length}-Day Custom Manual Program` : 'Custom Manual Program',
      injuries: injuries || 'None reported',
      foodPreference,
      budget,
      isAiGenerated: false,
      isManual: true,
      schedule: days,
      nutrition: {
        dailyCalories: targetCalories,
        proteinGrams,
        carbsGrams,
        fatGrams,
        sampleMeals: meals,
      },
      tips: [
        'Hydration: Drink at least 3.5 to 4.5 liters of clean water daily, especially in warm gym environments.',
        'Desi Cooking: Moderate excessive cooking oil/ghee in home salan to keep macros honest.',
        'Progressive Overload: Aim to increase weights or reps on compound movements every 2 weeks.',
        'Rest & Sleep: Muscles repair outside the gym; ensure 7-8 hours of uninterrupted sleep.',
      ],
      notes:
        adminNotes.trim() ||
        `Custom manually crafted fitness & Pakistani nutrition protocol for ${memberName || 'Athlete'}.`,
    };

    onPlanCreated(plan);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Quick Actions Header */}
      <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-gold-primary" />
          <div>
            <h4 className="font-heading text-sm text-txt uppercase tracking-wide">
              Mode C: Manual Program Architect
            </h4>
            <p className="text-xs text-txt-muted">
              Compose custom routines and Pakistani halal nutrition from an empty canvas or using library selections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoCalculateStats}
            className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary/50 text-xs font-semibold text-txt flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Calculate metabolic needs using Mifflin-St Jeor"
          >
            <Calculator className="w-3.5 h-3.5 text-gold-primary" />
            <span>Mifflin Calc</span>
          </button>
          <button
            type="button"
            onClick={handleSumFromMeals}
            className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary/50 text-xs font-semibold text-txt flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Auto-sum calories & protein from all meal slots below"
          >
            <Apple className="w-3.5 h-3.5 text-gold-primary" />
            <span>Sum Meals</span>
          </button>
        </div>
      </div>

      {/* Target Macros & Calories Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1">
          <span className="text-[10px] uppercase font-bold text-txt-muted block">
            Target Calories (kcal)
          </span>
          <input
            type="number"
            value={targetCalories}
            onChange={(e) => setTargetCalories(Number(e.target.value))}
            className="w-full bg-surface px-2.5 py-1.5 rounded-lg text-base font-heading text-gold-primary border border-border focus:border-gold-primary focus:outline-none"
          />
        </div>
        <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1">
          <span className="text-[10px] uppercase font-bold text-txt-muted block">
            Protein (grams)
          </span>
          <input
            type="number"
            value={proteinGrams}
            onChange={(e) => setProteinGrams(Number(e.target.value))}
            className="w-full bg-surface px-2.5 py-1.5 rounded-lg text-base font-heading text-txt border border-border focus:border-gold-primary focus:outline-none"
          />
        </div>
        <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1">
          <span className="text-[10px] uppercase font-bold text-txt-muted block">
            Carbohydrates (grams)
          </span>
          <input
            type="number"
            value={carbsGrams}
            onChange={(e) => setCarbsGrams(Number(e.target.value))}
            className="w-full bg-surface px-2.5 py-1.5 rounded-lg text-base font-heading text-txt border border-border focus:border-gold-primary focus:outline-none"
          />
        </div>
        <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1">
          <span className="text-[10px] uppercase font-bold text-txt-muted block">
            Healthy Fats (grams)
          </span>
          <input
            type="number"
            value={fatGrams}
            onChange={(e) => setFatGrams(Number(e.target.value))}
            className="w-full bg-surface px-2.5 py-1.5 rounded-lg text-base font-heading text-txt border border-border focus:border-gold-primary focus:outline-none"
          />
        </div>
      </div>

      {/* SECTION 1: WORKOUT ROUTINE BUILDER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-gold-primary" />
            <h3 className="font-heading text-sm text-txt uppercase tracking-wider">
              Workout Routine Schedule ({days.length} Days)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddDay}
            className="px-3 py-1.5 rounded-lg bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day</span>
          </button>
        </div>

        {days.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-2 border border-dashed border-border/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-gold-primary">
              <Dumbbell className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-txt">
              No days added yet — click 'Add Day' to start
            </p>
            <p className="text-xs text-txt-muted">
              Add workout days to schedule targeted muscle groups, exercises, sets, reps, and coaching notes.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="p-4 sm:p-5 rounded-2xl bg-surface-2 border border-border space-y-4"
              >
                {/* Day Header Inputs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={day.day}
                      onChange={(e) => handleUpdateDayField(dayIdx, 'day', e.target.value)}
                      placeholder="e.g. Day 1 (Mon)"
                      className="font-semibold text-xs sm:text-sm text-gold-primary bg-surface px-2.5 py-1 rounded-lg border border-border focus:border-gold-primary focus:outline-none w-36"
                    />
                    <input
                      type="text"
                      value={day.focus}
                      onChange={(e) => handleUpdateDayField(dayIdx, 'focus', e.target.value)}
                      placeholder="Focus: e.g. Chest & Triceps"
                      className="font-medium text-xs sm:text-sm text-txt bg-surface px-2.5 py-1 rounded-lg border border-border focus:border-gold-primary focus:outline-none flex-1 min-w-[160px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Pick from Exercise Library */}
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          handleAddExerciseFromLibrary(dayIdx, e.target.value);
                          e.target.value = '';
                        }}
                        defaultValue=""
                        className="bg-surface text-txt text-xs px-2.5 py-1.5 rounded-lg border border-border hover:border-gold-primary/50 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          + Add from Exercise Library
                        </option>
                        {MUSCLE_GROUPS.map((group) => (
                          <optgroup key={group} label={`-- ${group.toUpperCase()} --`}>
                            {EXERCISE_LIBRARY.filter((ex) => ex.muscleGroup === group).map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.name} ({ex.defaultSets}×{ex.defaultReps})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddBlankExercise(dayIdx)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary/50 text-xs font-semibold text-txt flex items-center gap-1 transition-colors cursor-pointer"
                      title="Add empty row for custom exercise"
                    >
                      <Plus className="w-3 h-3 text-gold-primary" />
                      <span className="hidden sm:inline">Custom</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveDay(dayIdx)}
                      className="p-1.5 rounded-lg bg-surface border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete this entire day"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Free-write Day Notes / Routine Textarea */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-txt-muted block">
                    Free-write Routine / Day Coaching Notes
                  </span>
                  <textarea
                    value={day.notes || ''}
                    onChange={(e) => handleUpdateDayField(dayIdx, 'notes', e.target.value)}
                    placeholder="Optional free-write routine or instructions (e.g. 5 min treadmill warmup, stretch calves, superset biceps with triceps)..."
                    rows={2}
                    className="w-full bg-surface text-xs text-txt p-2.5 rounded-xl border border-border focus:border-gold-primary focus:outline-none resize-none placeholder:text-txt-muted/50"
                  />
                </div>

                {/* Exercises Table / List */}
                {day.exercises.length > 0 ? (
                  <div className="space-y-2">
                    <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[10px] uppercase font-bold text-txt-muted px-2">
                      <span className="col-span-5">Exercise Name</span>
                      <span className="col-span-2 text-center">Sets</span>
                      <span className="col-span-2 text-center">Reps</span>
                      <span className="col-span-2 text-center">Rest</span>
                      <span className="col-span-1 text-right">Del</span>
                    </div>

                    {day.exercises.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 rounded-xl bg-surface/70 border border-border/60 text-xs"
                      >
                        <div className="sm:col-span-5 space-y-1">
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'name', e.target.value)}
                            placeholder="Exercise name"
                            className="w-full bg-surface px-2 py-1 rounded text-txt font-semibold border border-border focus:border-gold-primary focus:outline-none"
                          />
                          <input
                            type="text"
                            value={ex.notes || ''}
                            onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'notes', e.target.value)}
                            placeholder="Notes: tempo, form cues..."
                            className="w-full bg-transparent text-[11px] text-txt-muted px-1 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-1">
                          <span className="sm:hidden text-[11px] text-txt-muted">Sets:</span>
                          <input
                            type="text"
                            value={ex.sets}
                            onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'sets', e.target.value)}
                            placeholder="4"
                            className="w-16 sm:w-full bg-surface px-2 py-1 rounded text-center text-txt border border-border focus:border-gold-primary focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-1">
                          <span className="sm:hidden text-[11px] text-txt-muted">Reps:</span>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                            placeholder="8-10"
                            className="w-20 sm:w-full bg-surface px-2 py-1 rounded text-center text-txt border border-border focus:border-gold-primary focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-1">
                          <span className="sm:hidden text-[11px] text-txt-muted">Rest:</span>
                          <input
                            type="text"
                            value={ex.rest}
                            onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'rest', e.target.value)}
                            placeholder="90s"
                            className="w-16 sm:w-full bg-surface px-2 py-1 rounded text-center text-txt border border-border focus:border-gold-primary focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(dayIdx, exIdx)}
                            className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface/30 border border-dashed border-border text-center text-xs text-txt-muted">
                    No structured exercises added yet. Use the dropdown above or click 'Custom' to add exercises.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: AUTHENTIC PAKISTANI MEALS BUILDER */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-gold-primary" />
            <h3 className="font-heading text-sm text-txt uppercase tracking-wider">
              Pakistani Halal Nutrition & Meals ({meals.length} Slots)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Pick from Food Library */}
            <div className="relative">
              <select
                onChange={(e) => {
                  handleAddMealFromLibrary(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="bg-surface text-txt text-xs px-2.5 py-1.5 rounded-lg border border-border hover:border-gold-primary/50 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>
                  + Add from Food Library
                </option>
                {MEAL_SLOTS.map((slot) => (
                  <optgroup key={slot} label={`-- ${slot.toUpperCase()} --`}>
                    {PAKISTANI_FOOD_LIBRARY.filter((f) => f.slot === slot).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} (~{f.calories} kcal)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddBlankMeal}
              className="px-3 py-1.5 rounded-lg bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Meal</span>
            </button>
          </div>
        </div>

        {meals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-2 border border-dashed border-border/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-gold-primary">
              <Apple className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-txt">
              No meals added yet — click 'Add Meal' to start
            </p>
            <p className="text-xs text-txt-muted">
              Add meal slots manually or pick authentic Pakistani dishes directly from the library above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meals.map((meal, mealIdx) => (
              <div
                key={mealIdx}
                className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
                  <input
                    type="text"
                    value={meal.time}
                    onChange={(e) => handleUpdateMeal(mealIdx, 'time', e.target.value)}
                    placeholder="e.g. Breakfast (Nashta)"
                    className="font-semibold text-xs text-gold-primary bg-surface px-2 py-0.5 rounded border border-border focus:border-gold-primary focus:outline-none flex-1"
                  />

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={meal.calories || ''}
                        onChange={(e) => handleUpdateMeal(mealIdx, 'calories', Number(e.target.value))}
                        placeholder="kcal"
                        className="w-14 bg-surface text-center px-1.5 py-0.5 rounded border border-border focus:border-gold-primary focus:outline-none text-[11px] font-mono text-txt"
                      />
                      <span className="text-[10px] text-txt-muted">kcal</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMeal(mealIdx)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition-colors ml-1 cursor-pointer"
                      title="Remove meal slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => handleUpdateMeal(mealIdx, 'name', e.target.value)}
                    placeholder="Meal Name: e.g. Anda & Chapati Nashta"
                    className="w-full bg-surface text-txt font-bold px-2 py-1 rounded border border-border focus:border-gold-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-txt-muted block">
                    Free-write Portions & Foods
                  </span>
                  <textarea
                    value={meal.items}
                    onChange={(e) => handleUpdateMeal(mealIdx, 'items', e.target.value)}
                    placeholder="Type anything freely: 2 boiled eggs, 1 chapati, 1 katori daal, salad..."
                    rows={2}
                    className="w-full bg-surface text-xs text-txt p-2 rounded-xl border border-border focus:border-gold-primary focus:outline-none resize-none placeholder:text-txt-muted/50"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: PLAN TITLE & COACHING NOTES */}
      <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
        <h4 className="font-heading text-xs text-txt uppercase tracking-wider">
          Plan Identification & Coaching Notes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">
              Custom Plan Title
            </label>
            <input
              type="text"
              value={customPlanTitle}
              onChange={(e) => setCustomPlanTitle(e.target.value)}
              placeholder={`${goal} Manual Protocol - ${memberName || 'Athlete'}`}
              className="w-full bg-surface px-3 py-2 rounded-xl text-xs text-txt border border-border focus:border-gold-primary focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">
              General Notes for Member
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Focus on chest touchpoint, drink 4L water, avoid fried samosas..."
              className="w-full bg-surface px-3 py-2 rounded-xl text-xs text-txt border border-border focus:border-gold-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* FINAL SUBMIT BUTTON */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleBuildAndSubmit}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gold-primary text-black font-heading text-sm hover:brightness-110 transition-all shadow-lg shadow-gold-primary/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>BUILD & REVIEW MANUAL PLAN</span>
        </button>
      </div>
    </div>
  );
};
