// ============================================================================
// IRONFORGE - Workout & Diet Plans Screen
// Multi-mode plan generation localized for Pakistan:
// - Mode A: Live Details Form (Generate bespoke plan for any member or walk-in client)
// - Mode B: Photo Analysis (Image upload, client-side canvas resizing, explicit consent, visual frame observations)
// - Mode C: Build Manually (Free-write & library picker for exercises and Pakistani meals)
// - Structured Editor: Dynamically edit days-per-week, swap exercises via library, edit meals inline
// - Plan Pricing & Official Receipts: Automatic smart rate formula vs manual PKR price, official receipts
// - PDF Engine: Direct client-side PDF download & native Web Share API with fallback
// - Saved Plans: Store, search, print, download, share, and manage receipts
// - General Plans: Pakistani halal fitness & nutrition protocols (Bulking, Cutting, General)
// ============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Upload,
  Printer,
  Save,
  Check,
  Dumbbell,
  Apple,
  Copy,
  Edit3,
  X,
  AlertCircle,
  Clock,
  Flame,
  Activity,
  Trash2,
  Eye,
  ShieldCheck,
  ChevronRight,
  User,
  RefreshCw,
  Filter,
  RotateCcw,
  Download,
  Share2,
  Receipt,
  Plus,
  Loader2,
  FileText,
  DollarSign,
  Layers,
  ChevronDown,
  BookmarkCheck,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import {
  Member,
  GeneratedPlan,
  GeneralPlan,
  FitnessGoal,
  Gender,
  FoodPreference,
  BudgetLevel,
  WorkoutDay,
  ExerciseItem,
  SampleMeal,
  MuscleGroup,
  LibraryExercise,
  MealTimeSlot,
  PlanReceipt,
} from '../types';
import { gymService } from '../services/gymService';
import { useGym } from '../context/GymContext';
import {
  GENERAL_PLANS,
  getMealAlternatives,
  detectMealSlot,
} from '../services/planGenerator';
import { EXERCISE_LIBRARY } from '../services/exerciseLibrary';
import { PAKISTANI_FOOD_LIBRARY } from '../services/foodLibrary';
import {
  calculateAutomaticPlanPrice,
  PricingBreakdown,
} from '../services/planPricing';
import {
  detectMuscleGroup,
  adjustScheduleToDays,
} from '../services/planEditHelpers';
import { downloadElementAsPdf, shareElementAsPdf } from '../utils/pdfExport';
import { formatPKR, formatDatePK, cmToFeetInches, feetInchesToCm } from '../utils/formatters';
import { ManualPlanBuilder } from '../components/ManualPlanBuilder';
import { PlanReceiptModal } from '../components/PlanReceiptModal';
import { ExerciseSwapPickerModal } from '../components/ExerciseSwapPickerModal';
import { getAuthToken } from '../context/AuthContext';
import { generateUUID } from '../utils/uuid';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { SellGeneralPlanModal } from '../components/SellGeneralPlanModal';

export const PlansPage: React.FC = () => {
  const { gym } = useGym();
  const location = useLocation();
  const preselectedId = (location.state as { preselectMemberId?: string })?.preselectMemberId;

  // Primary Tabs
  const [activeMainTab, setActiveMainTab] = useState<'generate' | 'saved' | 'general'>('generate');

  // Generator Sub-Mode: 'form' (Mode A) vs 'photo' (Mode B) vs 'manual' (Mode C)
  const [generatorMode, setGeneratorMode] = useState<'form' | 'photo' | 'manual'>('form');

  const [members, setMembers] = useState<Member[]>([]);
  const [savedPlans, setSavedPlans] = useState<GeneratedPlan[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Form Fields State
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<Gender>('Male');
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(10);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [weight, setWeight] = useState<number>(75);
  const [goal, setGoal] = useState<FitnessGoal>('General Fitness');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [activityLevel, setActivityLevel] = useState<string>('Moderately Active (3-5 days/week)');
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('Non-veg');
  const [budget, setBudget] = useState<BudgetLevel>('Medium');
  const [injuries, setInjuries] = useState<string>('');

  // Photo Mode State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Mode Key for clean resets
  const [manualBuilderKey, setManualBuilderKey] = useState<number>(0);

  // Generation & Active Plan
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlan | null>(null);
  const [viewingSavedPlan, setViewingSavedPlan] = useState<GeneratedPlan | null>(null);

  // Effective plan displayed in the presentation canvas
  const activePlan = viewingSavedPlan || currentPlan;

  // Structured Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPlanTitle, setEditedPlanTitle] = useState('');
  const [editedSplitName, setEditedSplitName] = useState('');
  const [editedCalories, setEditedCalories] = useState<number>(2400);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedDaysPerWeek, setEditedDaysPerWeek] = useState<number>(4);
  const [editedSchedule, setEditedSchedule] = useState<WorkoutDay[]>([]);
  const [editedMeals, setEditedMeals] = useState<SampleMeal[]>([]);

  // Exercise Swap Picker Modal State
  const [swapModalState, setSwapModalState] = useState<{
    isOpen: boolean;
    dayIndex: number;
    exerciseIndex: number;
    currentName: string;
    initialGroup: MuscleGroup;
  }>({
    isOpen: false,
    dayIndex: 0,
    exerciseIndex: 0,
    currentName: '',
    initialGroup: 'Chest',
  });

  // Plan Pricing State
  const [planPriceType, setPlanPriceType] = useState<'Automatic' | 'Manual'>('Automatic');
  const [planPrice, setPlanPrice] = useState<number>(2800);
  const [priceBreakdown, setPriceBreakdown] = useState<PricingBreakdown | null>(null);

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<PlanReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Export Loading States
  const [isExportingPlan, setIsExportingPlan] = useState<'download' | 'share' | null>(null);
  const [isExportingGeneral, setIsExportingGeneral] = useState<'download' | 'share' | null>(null);

  // General Plans Tab Filter State
  const [filterGoal, setFilterGoal] = useState<string>('All');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterDays, setFilterDays] = useState<string>('All');
  const [selectedGeneralPlan, setSelectedGeneralPlan] = useState<GeneralPlan | null>(GENERAL_PLANS[0]);
  const [isSellGeneralPlanModalOpen, setIsSellGeneralPlanModalOpen] = useState(false);

  // Meal swap counters map for cycling through alternatives
  const [mealSwapCounters, setMealSwapCounters] = useState<Record<string, number>>({});

  // Filtered General Plans
  const filteredGeneralPlans = useMemo(() => {
    return GENERAL_PLANS.filter((plan) => {
      if (filterGoal !== 'All' && plan.goal !== filterGoal) return false;
      if (filterLevel !== 'All' && plan.level !== filterLevel) return false;
      if (filterDays !== 'All' && String(plan.daysPerWeek) !== filterDays) return false;
      return true;
    });
  }, [filterGoal, filterLevel, filterDays]);

  // Toast Banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Recalculate automatic price whenever relevant plan parameters change
  const refreshPlanPricing = (plan: Partial<GeneratedPlan>, customDays?: number) => {
    const days = customDays || plan.daysPerWeek || plan.schedule?.length || 4;
    const breakdown = calculateAutomaticPlanPrice({
      goal: plan.goal || 'General Fitness',
      daysPerWeek: days,
      hasPhotoAnalysis: Boolean(plan.visualObservations || plan.photoUrl),
      budget: plan.budget,
      isAiGenerated: plan.isAiGenerated,
      isManual: plan.isManual,
    });
    setPriceBreakdown(breakdown);

    // If currently Automatic or newly set, update the price
    if (plan.price && plan.priceType === 'Manual') {
      setPlanPriceType('Manual');
      setPlanPrice(plan.price);
    } else {
      setPlanPriceType('Automatic');
      setPlanPrice(breakdown.totalComputed);
    }
  };

  // Update plan pricing when activePlan changes
  useEffect(() => {
    if (activePlan) {
      refreshPlanPricing(activePlan);
    }
  }, [activePlan?.id]);

  // Meal swap handler for Generated Plan (Mode A, Mode B, Mode C or Saved Plan)
  const handleSwapGeneratedMeal = (mealIndex: number) => {
    if (!activePlan) return;
    const meal = isEditMode
      ? editedMeals[mealIndex]
      : activePlan.nutrition.sampleMeals[mealIndex];
    if (!meal) return;

    const slot = detectMealSlot(`${meal.time} ${meal.name}`);
    const alternatives = getMealAlternatives(
      slot,
      activePlan.goal,
      activePlan.foodPreference,
      activePlan.budget
    );

    if (!alternatives || alternatives.length === 0) {
      showToast('No alternative Pakistani meals found for this slot.', 'info');
      return;
    }

    const swapKey = `gen-${mealIndex}`;
    const currentIndex = mealSwapCounters[swapKey] ?? 0;
    const nextIndex = (currentIndex + 1) % alternatives.length;
    setMealSwapCounters((prev) => ({ ...prev, [swapKey]: nextIndex }));

    const alt = alternatives[nextIndex];
    const oldCal = meal.calories || 0;
    const newCal = alt.calories;
    const calDiff = newCal - oldCal;

    const oldPro = meal.proteinGrams || 0;
    const proDiff = alt.proteinGrams - oldPro;

    const newMealObj: SampleMeal = {
      ...meal,
      name: alt.name,
      items: `${alt.portion}${alt.description ? ` • ${alt.description}` : ''}`,
      calories: alt.calories,
      proteinGrams: alt.proteinGrams,
    };

    if (isEditMode) {
      const nextMeals = [...editedMeals];
      nextMeals[mealIndex] = newMealObj;
      setEditedMeals(nextMeals);
      setEditedCalories((prev) => Math.max(1200, prev + calDiff));
    } else {
      const updatedMeals = activePlan.nutrition.sampleMeals.map((m, i) =>
        i === mealIndex ? newMealObj : m
      );
      const updatedDailyCalories = Math.max(
        1200,
        (activePlan.nutrition.dailyCalories || 2400) + calDiff
      );
      const updatedProtein = Math.max(
        60,
        (activePlan.nutrition.proteinGrams || 150) + proDiff
      );

      const updatedPlan: GeneratedPlan = {
        ...activePlan,
        targetCalories: updatedDailyCalories,
        nutrition: {
          ...activePlan.nutrition,
          dailyCalories: updatedDailyCalories,
          proteinGrams: updatedProtein,
          sampleMeals: updatedMeals,
        },
      };

      if (viewingSavedPlan) {
        setViewingSavedPlan(updatedPlan);
      } else {
        setCurrentPlan(updatedPlan);
      }
      setEditedCalories(updatedDailyCalories);
    }

    showToast(`Swapped to "${alt.name}" (~${alt.calories} kcal)`);
  };

  // Meal swap handler for General Plans
  const handleSwapGeneralPlanMeal = (mealIndex: number) => {
    if (!selectedGeneralPlan) return;
    const meal = selectedGeneralPlan.dietSummary[mealIndex];
    if (!meal) return;

    const slot = detectMealSlot(meal.meal);
    const alternatives = getMealAlternatives(slot, selectedGeneralPlan.goal);

    if (!alternatives || alternatives.length === 0) {
      showToast('No alternative Pakistani meals found for this slot.', 'info');
      return;
    }

    const swapKey = `gp-${selectedGeneralPlan.id}-${mealIndex}`;
    const currentIndex = mealSwapCounters[swapKey] ?? 0;
    const nextIndex = (currentIndex + 1) % alternatives.length;
    setMealSwapCounters((prev) => ({ ...prev, [swapKey]: nextIndex }));

    const alt = alternatives[nextIndex];
    const oldCal = meal.calories || 450;
    const calDiff = alt.calories - oldCal;

    const updatedDietSummary = selectedGeneralPlan.dietSummary.map((m, i) => {
      if (i === mealIndex) {
        return {
          ...m,
          items: `${alt.portion} • ${alt.description || alt.name}`,
          calories: alt.calories,
          proteinGrams: alt.proteinGrams,
        };
      }
      return m;
    });

    const newTotalCalories = Math.max(1200, selectedGeneralPlan.calories + calDiff);

    setSelectedGeneralPlan({
      ...selectedGeneralPlan,
      calories: newTotalCalories,
      dietSummary: updatedDietSummary,
    });

    showToast(`Swapped to "${alt.name}" (~${alt.calories} kcal)`);
  };

  // Load initial data
  const loadData = async () => {
    setLoadingMembers(true);
    const [mList, pList] = await Promise.all([
      gymService.getMembers(),
      gymService.getSavedPlans(),
    ]);
    setMembers(mList);
    setSavedPlans(pList);

    if (preselectedId) {
      const match = mList.find((m: Member) => m.id === preselectedId);
      if (match) {
        populateFormFromMember(match);
      }
    }

    const viewPlanId = (location.state as { viewPlanId?: string })?.viewPlanId;
    if (viewPlanId) {
      const matchPlan = pList.find((p: GeneratedPlan) => p.id === viewPlanId);
      if (matchPlan) {
        setViewingSavedPlan(matchPlan);
        setCurrentPlan(null);
        setEditedPlanTitle(matchPlan.title || '');
        setEditedSplitName(matchPlan.splitName || '');
        setEditedCalories(matchPlan.targetCalories || 2400);
        setEditedNotes(matchPlan.notes || '');
        setEditedDaysPerWeek(matchPlan.daysPerWeek || matchPlan.schedule.length || 4);
        setEditedSchedule(JSON.parse(JSON.stringify(matchPlan.schedule)));
        setEditedMeals(JSON.parse(JSON.stringify(matchPlan.nutrition.sampleMeals)));
        refreshPlanPricing(matchPlan);
      }
    }

    setLoadingMembers(false);
  };

  useEffect(() => {
    loadData();
  }, [preselectedId]);

  // Mode Switcher with complete state isolation between generator modes
  const handleSwitchGeneratorMode = (newMode: 'form' | 'photo' | 'manual') => {
    if (generatorMode === newMode) return;
    setGeneratorMode(newMode);
    setCurrentPlan(null);
    setIsEditMode(false);
    setPhotoPreview(null);
    setPhotoBase64(null);
    setHasConsent(false);
    setIsCameraOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setManualBuilderKey((prev) => prev + 1);
  };

  // Sync feet & inches to cm
  const handleFeetChange = (f: number) => {
    setHeightFeet(f);
    setHeightCm(feetInchesToCm(f, heightInches));
  };

  const handleInchesChange = (inch: number) => {
    if (inch >= 12) {
      const extraFeet = Math.floor(inch / 12);
      const remInches = inch % 12;
      const newFeet = heightFeet + extraFeet;
      setHeightFeet(newFeet);
      setHeightInches(remInches);
      setHeightCm(feetInchesToCm(newFeet, remInches));
    } else {
      setHeightInches(inch);
      setHeightCm(feetInchesToCm(heightFeet, inch));
    }
  };

  // Helper: auto-fill from selected member
  const populateFormFromMember = (m: Member) => {
    setSelectedMemberId(m.id);
    setMemberName(m.name);
    setAge(m.age);
    setGender(m.gender);
    const cm = m.height || 175;
    setHeightCm(cm);
    const { feet: ft, inches: inVal } = cmToFeetInches(cm);
    setHeightFeet(ft);
    setHeightInches(inVal);
    setWeight(m.weight);
    setGoal(m.goal);
    if (m.activityLevel) setActivityLevel(m.activityLevel);
    if (m.injuries) setInjuries(m.injuries);
  };

  const handleSelectMemberDropdown = (mId: string) => {
    if (!mId) {
      setSelectedMemberId('');
      return;
    }
    const match = members.find((m) => m.id === mId);
    if (match) {
      populateFormFromMember(match);
    }
  };

  // Client-Side Canvas Image Resizing (down to max 1024x1024)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setPhotoPreview(resizedDataUrl);
        setPhotoBase64(resizedDataUrl);
        showToast('Photo uploaded & resized for private analysis');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Process data URL captured directly from in-browser camera
  const processImageDataUrl = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1024;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      setPhotoPreview(resizedDataUrl);
      setPhotoBase64(resizedDataUrl);
      showToast('Photo captured & processed for private analysis');
    };
    img.src = dataUrl;
  };

  // Trigger Plan Generation
  const handleGeneratePlan = async () => {
    if (generatorMode === 'photo' && !hasConsent) {
      showToast('Please confirm explicit athlete consent for photo analysis', 'error');
      return;
    }
    if (generatorMode === 'photo' && !photoBase64) {
      showToast('Please upload an athlete physique photo first', 'error');
      return;
    }

    setIsGenerating(true);
    setIsEditMode(false);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mode: generatorMode,
          memberId: selectedMemberId || undefined,
          memberName: memberName || 'Athlete',
          age,
          gender,
          heightCm,
          weight,
          goal,
          activityLevel,
          daysPerWeek,
          foodPreference,
          budget,
          injuries,
          photoBase64: generatorMode === 'photo' ? photoBase64 : undefined,
          hasConsent: generatorMode === 'photo' ? hasConsent : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.plan) {
        throw new Error('Invalid plan payload returned');
      }

      const plan: GeneratedPlan = data.plan;
      setViewingSavedPlan(null);
      setCurrentPlan(plan);
      setEditedPlanTitle(plan.title || '');
      setEditedSplitName(plan.splitName || '');
      setEditedCalories(plan.targetCalories || 2400);
      setEditedNotes(plan.notes || '');
      setEditedDaysPerWeek(plan.daysPerWeek || 4);
      setEditedSchedule(JSON.parse(JSON.stringify(plan.schedule)));
      setEditedMeals(JSON.parse(JSON.stringify(plan.nutrition.sampleMeals)));

      refreshPlanPricing(plan);

      if (data.isAiGenerated) {
        showToast(`AI Plan successfully generated for ${plan.memberName}!`);
      } else {
        showToast(`Plan created for ${plan.memberName} using Pakistani nutrition logic.`);
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      showToast('Failed to generate plan. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enter Structured Edit Mode
  const handleStartEditing = () => {
    if (!activePlan) return;
    setEditedPlanTitle(activePlan.title || '');
    setEditedSplitName(activePlan.splitName || '');
    setEditedCalories(activePlan.nutrition.dailyCalories || activePlan.targetCalories || 2400);
    setEditedNotes(activePlan.notes || '');
    setEditedDaysPerWeek(activePlan.daysPerWeek || activePlan.schedule.length || 4);
    setEditedSchedule(JSON.parse(JSON.stringify(activePlan.schedule)));
    setEditedMeals(JSON.parse(JSON.stringify(activePlan.nutrition.sampleMeals)));
    setIsEditMode(true);
  };

  // Save changes from Structured Editor
  const handleFinishEditing = async () => {
    if (!activePlan) return;

    const updatedPlan: GeneratedPlan = {
      ...activePlan,
      title: editedPlanTitle || activePlan.title,
      splitName: editedSplitName || `${editedDaysPerWeek}-Day Customized Split`,
      daysPerWeek: editedDaysPerWeek,
      targetCalories: editedCalories,
      schedule: editedSchedule,
      nutrition: {
        ...activePlan.nutrition,
        dailyCalories: editedCalories,
        sampleMeals: editedMeals,
      },
      notes: editedNotes,
    };

    try {
      if (viewingSavedPlan) {
        setViewingSavedPlan(updatedPlan);
        await gymService.savePlan(updatedPlan);
        const refreshedPlans = await gymService.getSavedPlans();
        setSavedPlans(refreshedPlans);
      } else {
        setCurrentPlan(updatedPlan);
      }
      setIsEditMode(false);
      refreshPlanPricing(updatedPlan, editedDaysPerWeek);
      showToast('Plan routine and meals updated successfully!');
    } catch (err: any) {
      console.error('Error updating plan:', err);
      showToast(err.message || 'Failed to save updated plan. Please try again.', 'error');
    }
  };

  // Change Days Per Week in Editor
  const handleDaysPerWeekDropdownChange = (newDays: number) => {
    setEditedDaysPerWeek(newDays);
    const adjusted = adjustScheduleToDays(editedSchedule, newDays, activePlan?.goal);
    setEditedSchedule(adjusted);

    // If automatic pricing is enabled, update live price calculation
    if (planPriceType === 'Automatic' && activePlan) {
      const breakdown = calculateAutomaticPlanPrice({
        goal: activePlan.goal,
        daysPerWeek: newDays,
        hasPhotoAnalysis: Boolean(activePlan.visualObservations || activePlan.photoUrl),
        budget: activePlan.budget,
      });
      setPriceBreakdown(breakdown);
      setPlanPrice(breakdown.totalComputed);
    }
  };

  // Add a brand new day to schedule in editor
  const handleAddWorkoutDay = () => {
    const nextNum = editedSchedule.length + 1;
    const newDay: WorkoutDay = {
      day: `Day ${nextNum}`,
      focus: 'Custom Training Focus',
      exercises: [
        { name: 'Barbell Flat Bench Press', sets: '3', reps: '10', rest: '60s' },
        { name: 'Lat Pulldowns (Wide)', sets: '3', reps: '10', rest: '60s' },
      ],
    };
    const nextSchedule = [...editedSchedule, newDay];
    setEditedSchedule(nextSchedule);
    setEditedDaysPerWeek(nextSchedule.length);
  };

  // Remove a day from schedule
  const handleRemoveWorkoutDay = (dayIndex: number) => {
    if (editedSchedule.length <= 1) {
      showToast('A routine must contain at least 1 training day.', 'info');
      return;
    }
    const nextSchedule = editedSchedule.filter((_, idx) => idx !== dayIndex);
    setEditedSchedule(nextSchedule);
    setEditedDaysPerWeek(nextSchedule.length);
  };

  // Open Swap Picker Modal for an exercise
  const handleOpenExerciseSwapPicker = (dayIdx: number, exIdx: number) => {
    const day = editedSchedule[dayIdx];
    const exercise = day.exercises[exIdx];
    const group = detectMuscleGroup(exercise.name, day.focus);

    setSwapModalState({
      isOpen: true,
      dayIndex: dayIdx,
      exerciseIndex: exIdx,
      currentName: exercise.name,
      initialGroup: group,
    });
  };

  // Handle exercise chosen in swap picker
  const handleExerciseSwapped = (selected: LibraryExercise) => {
    const { dayIndex, exerciseIndex } = swapModalState;
    const nextSchedule = [...editedSchedule];
    const day = { ...nextSchedule[dayIndex] };
    const exList = [...day.exercises];

    exList[exerciseIndex] = {
      name: selected.name,
      sets: selected.defaultSets,
      reps: selected.defaultReps,
      rest: selected.defaultRest,
    };

    day.exercises = exList;
    nextSchedule[dayIndex] = day;
    setEditedSchedule(nextSchedule);
    showToast(`Swapped to "${selected.name}"`);
  };

  // Add exercise to day from library
  const handleAddLibraryExerciseToDay = (dayIdx: number, libraryExerciseId: string) => {
    if (!libraryExerciseId) return;
    const ex = EXERCISE_LIBRARY.find((e) => e.id === libraryExerciseId);
    if (!ex) return;

    const nextSchedule = [...editedSchedule];
    const day = { ...nextSchedule[dayIdx] };
    day.exercises = [
      ...day.exercises,
      {
        name: ex.name,
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        rest: ex.defaultRest,
      },
    ];
    nextSchedule[dayIdx] = day;
    setEditedSchedule(nextSchedule);
    showToast(`Added ${ex.name} to ${day.day}`);
  };

  // Add custom exercise row to day
  const handleAddCustomExerciseRow = (dayIdx: number) => {
    const nextSchedule = [...editedSchedule];
    const day = { ...nextSchedule[dayIdx] };
    day.exercises = [
      ...day.exercises,
      {
        name: 'New Exercise',
        sets: '3',
        reps: '10-12',
        rest: '60s',
      },
    ];
    nextSchedule[dayIdx] = day;
    setEditedSchedule(nextSchedule);
  };

  // Remove exercise from day
  const handleRemoveExercise = (dayIdx: number, exIdx: number) => {
    const nextSchedule = [...editedSchedule];
    const day = { ...nextSchedule[dayIdx] };
    day.exercises = day.exercises.filter((_, idx) => idx !== exIdx);
    nextSchedule[dayIdx] = day;
    setEditedSchedule(nextSchedule);
  };

  // Add Pakistani food to nutrition from library
  const handleAddFoodFromLibrary = (foodId: string) => {
    if (!foodId) return;
    const food = PAKISTANI_FOOD_LIBRARY.find((f) => f.id === foodId);
    if (!food) return;

    const slotNames: Record<MealTimeSlot, string> = {
      Nashta: 'Breakfast (Nashta)',
      Lunch: 'Lunch (Dopahar)',
      Snack: 'Evening Snack (Asar)',
      Dinner: 'Dinner (Raat)',
    };

    const newMeal: SampleMeal = {
      time: slotNames[food.slot] || food.slot,
      name: food.name,
      items: `${food.portion}${food.description ? ` • ${food.description}` : ''}`,
      calories: food.calories,
      proteinGrams: food.proteinGrams,
    };

    setEditedMeals([...editedMeals, newMeal]);
    setEditedCalories((prev) => prev + food.calories);
    showToast(`Added ${food.name} to meal plan`);
  };

  // Add custom meal slot
  const handleAddCustomMealSlot = () => {
    const newMeal: SampleMeal = {
      time: 'Mid-Meal / Snack',
      name: 'Custom Nutrition Meal',
      items: 'Specify portion size and ingredients here...',
      calories: 350,
      proteinGrams: 25,
    };
    setEditedMeals([...editedMeals, newMeal]);
    setEditedCalories((prev) => prev + 350);
  };

  // Remove meal
  const handleRemoveMeal = (mealIdx: number) => {
    if (editedMeals.length <= 1) {
      showToast('Nutrition plan must have at least 1 meal.', 'info');
      return;
    }
    const removed = editedMeals[mealIdx];
    const nextMeals = editedMeals.filter((_, idx) => idx !== mealIdx);
    setEditedMeals(nextMeals);
    if (removed.calories) {
      setEditedCalories((prev) => Math.max(1200, prev - (removed.calories || 0)));
    }
  };

  // Sum all meal calories and sync with target calories
  const handleRecalculateMealCalories = () => {
    const total = editedMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
    setEditedCalories(total);
    showToast(`Synced total calories: ${total} kcal`);
  };

  // Save Plan to Storage & Generate Official Receipt
  const handleSavePlan = async () => {
    if (!activePlan) return;

    try {
      const finalPlan: GeneratedPlan = {
        ...activePlan,
        title: editedPlanTitle || activePlan.title,
        splitName: editedSplitName || activePlan.splitName,
        daysPerWeek: editedDaysPerWeek || activePlan.daysPerWeek || activePlan.schedule.length,
        targetCalories: editedCalories || activePlan.targetCalories,
        schedule: isEditMode ? editedSchedule : activePlan.schedule,
        nutrition: {
          ...activePlan.nutrition,
          dailyCalories: editedCalories || activePlan.nutrition.dailyCalories,
          sampleMeals: isEditMode ? editedMeals : activePlan.nutrition.sampleMeals,
        },
        notes: editedNotes || activePlan.notes,
        price: planPrice,
        priceType: planPriceType,
      };

      // Generate Official Plan Receipt with UUID primary key
      const receiptNumber = `RCP-PLAN-${Math.floor(10000 + Math.random() * 90000)}`;
      const coverageDescription = `Personalized ${finalPlan.goal} Protocol, ${
        finalPlan.daysPerWeek || 4
      } days/week • Pakistani Halal Diet`;

      const receipt: PlanReceipt = {
        id: generateUUID(),
        receiptNumber,
        planId: finalPlan.id,
        planTitle: finalPlan.title || 'Personalized Protocol',
        memberId: finalPlan.memberId,
        memberName: finalPlan.memberName || 'Walk-in client',
        date: new Date().toISOString().split('T')[0],
        amount: planPrice,
        priceType: planPriceType,
        coverageDescription,
        gymName: gym.name,
        gymAddress: gym.address,
        gymPhone: gym.phone,
        status: 'Paid',
      };

      finalPlan.receipt = receipt;
      finalPlan.receiptId = receipt.id;

      await gymService.savePlan(finalPlan);
      const updated = await gymService.getSavedPlans();
      setSavedPlans(updated);
      if (viewingSavedPlan) {
        setViewingSavedPlan(finalPlan);
      } else {
        setCurrentPlan(finalPlan);
      }
      setIsEditMode(false);

      // Open receipt modal immediately
      setActiveReceipt(receipt);
      setIsReceiptModalOpen(true);
      showToast('Plan saved. Receipt ready to download or share.');
    } catch (err: any) {
      console.error('Failed to save plan:', err);
      showToast(err.message || 'Failed to save plan. Please try again.', 'error');
    }
  };

  // Delete Saved Plan
  const handleDeleteSavedPlan = async (planId: string) => {
    try {
      await gymService.deletePlan(planId);
      const updated = await gymService.getSavedPlans();
      setSavedPlans(updated);
      if (currentPlan && currentPlan.id === planId) {
        setCurrentPlan(null);
      }
      if (viewingSavedPlan && viewingSavedPlan.id === planId) {
        setViewingSavedPlan(null);
      }
      showToast('Plan removed from saved roster', 'info');
    } catch (err: any) {
      console.error('Failed to delete plan:', err);
      showToast(err.message || 'Failed to delete plan. Please try again.', 'error');
    }
  };

  // Print Active Plan
  const handlePrint = () => {
    window.print();
  };

  // Download Generated Plan as PDF
  const handleDownloadPlanPdf = async () => {
    const el = document.getElementById('printable-plan');
    if (!el || !activePlan) return;

    try {
      setIsExportingPlan('download');
      const filename = `IronForge-Plan-${activePlan.memberName.replace(/\s+/g, '_')}.pdf`;
      await downloadElementAsPdf(el, filename);
      showToast(`Downloaded PDF: ${filename}`);
    } catch (err: any) {
      console.error('Failed to download plan PDF', err);
      showToast(err?.message || 'Failed to generate PDF. Please try printing instead.', 'error');
    } finally {
      setIsExportingPlan(null);
    }
  };

  // Share Generated Plan as PDF
  const handleSharePlanPdf = async () => {
    const el = document.getElementById('printable-plan');
    if (!el || !activePlan) return;

    try {
      setIsExportingPlan('share');
      const filename = `IronForge-Plan-${activePlan.memberName.replace(/\s+/g, '_')}.pdf`;
      const title = `${gym.name} - ${activePlan.title}`;
      const text = `Custom training protocol for ${activePlan.memberName} (${activePlan.goal})`;

      const result = await shareElementAsPdf(el, filename, title, text);

      if (result.shared) {
        showToast('Plan PDF shared successfully!');
      } else if (result.downloadedFallback) {
        showToast(
          "Sharing isn't supported on this browser — the PDF was downloaded instead, you can share it manually.",
          'info'
        );
      }
    } catch (err: any) {
      console.error('Failed to share plan PDF', err);
      showToast(err?.message || 'Failed to generate PDF. Please try printing instead.', 'error');
    } finally {
      setIsExportingPlan(null);
    }
  };

  // Download General Plan as PDF
  const handleDownloadGeneralPlanPdf = async () => {
    const el = document.getElementById('printable-general-plan');
    if (!el || !selectedGeneralPlan) return;

    try {
      setIsExportingGeneral('download');
      const filename = `IronForge-GeneralPlan-${selectedGeneralPlan.title.replace(/\s+/g, '_')}.pdf`;
      await downloadElementAsPdf(el, filename);
      showToast(`Downloaded PDF: ${filename}`);
    } catch (err: any) {
      console.error('Failed to download general plan PDF', err);
      showToast(err?.message || 'Failed to generate PDF. Please try printing instead.', 'error');
    } finally {
      setIsExportingGeneral(null);
    }
  };

  // Share General Plan as PDF
  const handleShareGeneralPlanPdf = async () => {
    const el = document.getElementById('printable-general-plan');
    if (!el || !selectedGeneralPlan) return;

    try {
      setIsExportingGeneral('share');
      const filename = `IronForge-GeneralPlan-${selectedGeneralPlan.title.replace(/\s+/g, '_')}.pdf`;
      const title = `${gym.name} - ${selectedGeneralPlan.title}`;
      const text = `Pakistani Halal Protocol: ${selectedGeneralPlan.title} (${selectedGeneralPlan.calories} kcal)`;

      const result = await shareElementAsPdf(el, filename, title, text);

      if (result.shared) {
        showToast('Plan PDF shared successfully!');
      } else if (result.downloadedFallback) {
        showToast(
          "Sharing isn't supported on this browser — the PDF was downloaded instead, you can share it manually.",
          'info'
        );
      }
    } catch (err: any) {
      console.error('Failed to share general plan PDF', err);
      showToast(err?.message || 'Failed to generate PDF. Please try printing instead.', 'error');
    } finally {
      setIsExportingGeneral(null);
    }
  };

  const handleCopyGeneralPlan = (plan: GeneralPlan) => {
    const text = `IRONFORGE GYM - ${plan.title}\nGoal: ${plan.goal}\nDuration: ${plan.duration}\nCalories: ${plan.calories} kcal/day\n\nWorkout Routine:\n${plan.schedule.map((s) => `${s.day} (${s.focus}): ${s.exercises.map((e) => e.name).join(', ')}`).join('\n')}\n\nNutrition:\n${plan.dietSummary.map((d) => `${d.meal}: ${d.items}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    showToast(`Copied ${plan.title} to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header / Dedicated Saved Plan Header */}
      {viewingSavedPlan ? (
        <div className="no-print p-4 md:p-5 rounded-2xl bg-surface border border-gold-primary/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setViewingSavedPlan(null);
                setIsEditMode(false);
                setActiveMainTab('saved');
              }}
              className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-xs font-semibold text-txt flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-gold-primary" />
              <span>Back to Saved Plans</span>
            </button>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-primary/20 text-gold-primary">
                  Saved Athlete Plan
                </span>
                <h3 className="font-heading text-base md:text-lg text-txt uppercase tracking-wide">
                  {viewingSavedPlan.title}
                </h3>
              </div>
              <p className="text-xs text-txt-muted mt-0.5">
                Athlete: <strong className="text-txt">{viewingSavedPlan.memberName}</strong> • Generated on {formatDatePK(viewingSavedPlan.generatedDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isEditMode ? (
              <button
                onClick={handleStartEditing}
                className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-gold-primary" />
                <span>Edit Plan Text</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs font-semibold text-txt-muted hover:text-txt cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishEditing}
                  className="px-3.5 py-2 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Changes</span>
                </button>
              </>
            )}

            <button
              onClick={handleDownloadPlanPdf}
              disabled={isExportingPlan !== null}
              className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Download Direct PDF"
            >
              {isExportingPlan === 'download' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-primary" />
              ) : (
                <Download className="w-3.5 h-3.5 text-gold-primary" />
              )}
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleSharePlanPdf}
              disabled={isExportingPlan !== null}
              className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Share via WhatsApp or Email"
            >
              {isExportingPlan === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-primary" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-gold-primary" />
              )}
              <span>Share PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {viewingSavedPlan.receipt ? (
              <button
                onClick={() => {
                  setActiveReceipt(viewingSavedPlan.receipt!);
                  setIsReceiptModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/25 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Receipt</span>
              </button>
            ) : (
              <button
                onClick={handleSavePlan}
                className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-gold-primary" />
                <span>Generate Receipt</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-txt">
              WORKOUT & DIET PLANS
            </h1>
            <p className="text-xs md:text-sm text-txt-muted mt-1">
              Build bespoke training regimes, analyze physical frame, and prescribe authentic Pakistani halal nutrition.
            </p>
          </div>

          {/* Main Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
            <button
              onClick={() => setActiveMainTab('generate')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'generate'
                  ? 'bg-gold-primary text-black shadow-sm'
                  : 'text-txt-muted hover:text-txt'
              }`}
            >
              Plan Generator
            </button>
            <button
              onClick={() => setActiveMainTab('saved')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'saved'
                  ? 'bg-gold-primary text-black shadow-sm'
                  : 'text-txt-muted hover:text-txt'
              }`}
            >
              Saved Plans ({savedPlans.length})
            </button>
            <button
              onClick={() => setActiveMainTab('general')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'general'
                  ? 'bg-gold-primary text-black shadow-sm'
                  : 'text-txt-muted hover:text-txt'
              }`}
            >
              General Plans
            </button>
          </div>
        </div>
      )}

      {/* Inline Feedback Toast */}
      {feedback && (
        <div
          className={`no-print p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between animate-fadeIn ${
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
          <button onClick={() => setFeedback(null)} className="opacity-80 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GENERATE PLAN (OR DEDICATED SAVED PLAN VIEW) */}
      {/* ========================================================================= */}
      {(viewingSavedPlan || activeMainTab === 'generate') && (
        <div className="space-y-6">
          {/* Generator Controls Box (ONLY shown during generation, NEVER when viewing a saved plan) */}
          {!viewingSavedPlan && (
          <div className="no-print p-6 rounded-2xl bg-surface border border-border space-y-6">
            {/* Mode Switcher Banner: Mode A vs Mode B vs Mode C */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-primary/15 text-gold-primary flex items-center justify-center font-bold">
                  {generatorMode === 'form' ? (
                    <Sparkles className="w-5 h-5" />
                  ) : generatorMode === 'photo' ? (
                    <Camera className="w-5 h-5" />
                  ) : (
                    <Edit3 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading text-sm md:text-base text-txt">
                    {generatorMode === 'form'
                      ? 'MODE A: LIVE DETAILS GENERATOR'
                      : generatorMode === 'photo'
                      ? 'MODE B: VISUAL FRAME DIAGNOSTIC'
                      : 'MODE C: BUILD MANUALLY (FREE WRITE & LIBRARY)'}
                  </h3>
                  <p className="text-xs text-txt-muted">
                    {generatorMode === 'form'
                      ? 'Enter metrics & goals to construct an authentic Pakistani training program.'
                      : generatorMode === 'photo'
                      ? 'Confidential posture and physique frame diagnostic with explicit consent.'
                      : 'Admin-built custom routine: pick from exercise & food libraries or free-type any text.'}
                  </p>
                </div>
              </div>

              {/* Tri-State Mode Selector */}
              <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-border gap-1 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => handleSwitchGeneratorMode('form')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    generatorMode === 'form'
                      ? 'bg-gold-primary text-black shadow-xs'
                      : 'text-txt-muted hover:text-txt'
                  }`}
                >
                  Mode A: Details
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchGeneratorMode('photo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    generatorMode === 'photo'
                      ? 'bg-gold-primary text-black shadow-xs'
                      : 'text-txt-muted hover:text-txt'
                  }`}
                >
                  Mode B: Photo
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchGeneratorMode('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    generatorMode === 'manual'
                      ? 'bg-gold-primary text-black shadow-xs'
                      : 'text-txt-muted hover:text-txt'
                  }`}
                >
                  Mode C: Build Manually
                </button>
              </div>
            </div>

            {/* MODE C: MANUAL PLAN BUILDER */}
            {generatorMode === 'manual' ? (
              <ManualPlanBuilder
                key={manualBuilderKey}
                memberName={memberName || 'Athlete'}
                selectedMemberId={selectedMemberId || undefined}
                age={age}
                gender={gender}
                heightCm={heightCm}
                weight={weight}
                goal={goal}
                foodPreference={foodPreference}
                budget={budget}
                injuries={injuries}
                onPlanCreated={(plan) => {
                  setViewingSavedPlan(null);
                  setCurrentPlan(plan);
                  setEditedPlanTitle(plan.title || '');
                  setEditedSplitName(plan.splitName || '');
                  setEditedCalories(plan.targetCalories || 2400);
                  setEditedNotes(plan.notes || '');
                  setEditedDaysPerWeek(plan.daysPerWeek || plan.schedule.length || 4);
                  setEditedSchedule(JSON.parse(JSON.stringify(plan.schedule)));
                  setEditedMeals(JSON.parse(JSON.stringify(plan.nutrition.sampleMeals)));
                  refreshPlanPricing(plan);
                  showToast(`Manual Plan created for ${plan.memberName}! Review and save below.`);
                }}
              />
            ) : (
              <>
                {/* Member Quick-Fill Dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3.5 rounded-xl bg-surface-2/60 border border-border/80">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gold-primary shrink-0" />
                    <span className="text-xs text-txt font-semibold">Load Existing Athlete Profile:</span>
                  </div>
                  <div>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => handleSelectMemberDropdown(e.target.value)}
                      className="w-full bg-surface text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                    >
                      <option value="">-- Choose Member or Enter Walk-in Below --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.program}, {m.weight}kg)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Fields Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Athlete Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                      Athlete Name
                    </label>
                    <input
                      type="text"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder="e.g. Bilal Ahmed"
                      className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                    />
                  </div>

                  {/* Age & Gender */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                        Age
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="80"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="w-full bg-surface-2 text-txt px-2 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Height (Pakistani standard ft/in + cm) */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider flex justify-between">
                      <span>Height</span>
                      <span className="text-gold-primary font-mono">{heightCm} cm</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="3"
                          max="7"
                          value={heightFeet}
                          onChange={(e) => handleFeetChange(Number(e.target.value))}
                          className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-txt-muted">ft</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => handleInchesChange(Number(e.target.value))}
                          className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-txt-muted">in</span>
                      </div>
                    </div>
                  </div>

                  {/* Weight (kg) */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                      Body Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="30"
                        max="220"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-txt-muted">kg</span>
                    </div>
                  </div>

                  {/* Fitness Goal */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                      Primary Objective
                    </label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                      className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                    >
                      <option value="Bulking">Bulking (Muscle Mass)</option>
                      <option value="Cutting">Cutting (Fat Shred)</option>
                      <option value="General Fitness">General Fitness & Endurance</option>
                    </select>
                  </div>

                  {/* Days per week */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                      Days per Week
                    </label>
                    <select
                      value={daysPerWeek}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDaysPerWeek(val);
                        if (val <= 2) setActivityLevel('Lightly Active (1-3 days/week)');
                        else if (val <= 5) setActivityLevel('Moderately Active (3-5 days/week)');
                        else setActivityLevel('Very Active (6-7 days/week)');
                      }}
                      className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                    >
                      <option value={3}>3 Days (Full Body Routine)</option>
                      <option value={4}>4 Days (Upper / Lower Split)</option>
                      <option value={5}>5 Days (Bro Split / Hypertrophy)</option>
                      <option value={6}>6 Days (Push / Pull / Legs)</option>
                    </select>
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                      Activity Level
                    </label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                    >
                      <option value="Sedentary (desk job, little exercise)">Sedentary</option>
                      <option value="Lightly Active (1-3 days/week)">Lightly Active (1-3 days/week)</option>
                      <option value="Moderately Active (3-5 days/week)">Moderately Active (3-5 days/week)</option>
                      <option value="Very Active (6-7 days/week)">Very Active (6-7 days/week)</option>
                    </select>
                  </div>

                  {/* Food Preference */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                      Pakistani Diet Matrix
                    </label>
                    <select
                      value={foodPreference}
                      onChange={(e) => setFoodPreference(e.target.value as FoodPreference)}
                      className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                    >
                      <option value="Non-veg">Non-Veg (Chicken, Mutton, Eggs, Fish)</option>
                      <option value="Vegetarian">Vegetarian (Daal, Paneer, Chana, Sabzi)</option>
                    </select>
                  </div>

                  {/* Food Budget */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                      Nutrition Budget Level
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value as BudgetLevel)}
                      className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                    >
                      <option value="Budget-Friendly">Budget (Anda, Chana, Daal, Doodh)</option>
                      <option value="Medium">Medium (Chicken Breast, Quwwat Staples)</option>
                      <option value="High">High (Mutton, Fish, Olive Oil, Dry Fruits)</option>
                    </select>
                  </div>
                </div>

                {/* Known Injuries / Joint Limitations */}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                    Known Injuries / Musculoskeletal Limitations (Optional)
                  </label>
                  <input
                    type="text"
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    placeholder="e.g. Lower back stiffness, right shoulder impingement, weak knee ligaments"
                    className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                  />
                </div>

                {/* MODE B: PHOTO UPLOAD & CONSENT ACCORDION */}
                {generatorMode === 'photo' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface-2 border border-gold-primary/30 space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 text-gold-primary">
                      <Camera className="w-5 h-5 shrink-0" />
                      <h4 className="font-heading text-xs sm:text-sm">
                        PHYSIQUE FRAME OBSERVATION & POSTURE ANALYSIS
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Photo Dropzone / Upload Box */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileInputChange}
                          className="hidden"
                        />

                        {photoPreview ? (
                          <div className="relative group rounded-xl overflow-hidden border border-border max-h-56 bg-black flex items-center justify-center">
                            <img
                              src={photoPreview}
                              alt="Physique Preview"
                              className="max-h-56 w-auto object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg bg-surface text-txt text-xs font-semibold flex items-center gap-1.5 hover:border-gold-primary border border-border cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-gold-primary" />
                                <span>Upload</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsCameraOpen(true)}
                                className="px-3 py-1.5 rounded-lg bg-surface text-txt text-xs font-semibold flex items-center gap-1.5 hover:border-gold-primary border border-border cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5 text-gold-primary" />
                                <span>Take Photo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhotoPreview(null);
                                  setPhotoBase64(null);
                                  if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Upload Photo Option */}
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="p-5 rounded-xl border-2 border-dashed border-border hover:border-gold-primary/60 transition-colors text-center cursor-pointer bg-surface/40 space-y-2 flex flex-col items-center justify-center hover:bg-surface-2"
                            >
                              <div className="w-10 h-10 rounded-full bg-gold-primary/10 text-gold-primary flex items-center justify-center">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-txt">
                                  Upload Photo
                                </p>
                                <p className="text-[11px] text-txt-muted mt-0.5">
                                  Device files (PNG, JPG)
                                </p>
                              </div>
                            </div>

                            {/* Take Photo Option (In-Browser Live Camera) */}
                            <div
                              onClick={() => setIsCameraOpen(true)}
                              className="p-5 rounded-xl border-2 border-dashed border-border hover:border-gold-primary/60 transition-colors text-center cursor-pointer bg-surface/40 space-y-2 flex flex-col items-center justify-center hover:bg-surface-2"
                            >
                              <div className="w-10 h-10 rounded-full bg-gold-primary/10 text-gold-primary flex items-center justify-center">
                                <Camera className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-txt">
                                  Take Photo
                                </p>
                                <p className="text-[11px] text-txt-muted mt-0.5">
                                  Live webcam or mobile camera
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Explicit Consent Checkbox & Ethics Disclaimer */}
                      <div className="space-y-3 p-4 rounded-xl bg-surface border border-border/80 text-xs">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="photo-consent"
                            checked={hasConsent}
                            onChange={(e) => setHasConsent(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-gold-primary rounded cursor-pointer"
                          />
                          <label
                            htmlFor="photo-consent"
                            className="text-txt text-xs font-medium cursor-pointer leading-relaxed"
                          >
                            <strong className="text-gold-primary">Explicit Athlete Consent:</strong> I confirm that the athlete has given informed permission for their image to be analyzed for body composition & posture diagnostics.
                          </label>
                        </div>

                        <div className="p-3 rounded-lg bg-surface-2 text-[11px] text-txt-muted space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-txt">
                            <ShieldCheck className="w-3.5 h-3.5 text-gold-primary shrink-0" />
                            <span>Privacy & Diagnostics Protocol:</span>
                          </div>
                          <p>
                            The AI performs visual symmetry, clavicle-to-hip ratio, and estimated body composition analysis. Photos are processed in-memory and not shared publicly.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Camera Capture In-Browser Modal */}
                    <CameraCaptureModal
                      isOpen={isCameraOpen}
                      onClose={() => setIsCameraOpen(false)}
                      onPhotoCaptured={processImageDataUrl}
                      onFallbackUpload={() => fileInputRef.current?.click()}
                    />
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || (generatorMode === 'photo' && (!photoBase64 || !hasConsent))}
                    className="px-6 py-3 rounded-xl bg-gold-primary text-black font-heading text-xs tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold-primary/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>SYNTHESIZING PROTOCOL...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>GENERATE BESPOKE PLAN</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
          )}

          {/* Generated Plan Presentation Canvas (Shown for viewingSavedPlan or when currentPlan was generated in this session) */}
          {activePlan ? (
            <div className="space-y-6">
              {/* PLAN PRICING CONFIGURATION SECTION */}
              <div className="no-print p-5 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gold-primary" />
                      <h4 className="font-heading text-xs sm:text-sm text-txt uppercase tracking-wider">
                        COACHING PLAN PRICE & RECEIPT GENERATOR
                      </h4>
                    </div>
                    <p className="text-[11px] text-txt-muted mt-0.5">
                      Set official athlete billing amount in PKR. Saving this plan generates an official branded receipt.
                    </p>
                  </div>

                  {/* Toggle: Automatic vs Manual */}
                  <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-border gap-1 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setPlanPriceType('Automatic');
                        if (priceBreakdown) {
                          setPlanPrice(priceBreakdown.totalComputed);
                        } else {
                          refreshPlanPricing(activePlan, editedDaysPerWeek);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        planPriceType === 'Automatic'
                          ? 'bg-gold-primary text-black shadow-xs'
                          : 'text-txt-muted hover:text-txt'
                      }`}
                    >
                      Automatic (Smart Rate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanPriceType('Manual')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        planPriceType === 'Manual'
                          ? 'bg-gold-primary text-black shadow-xs'
                          : 'text-txt-muted hover:text-txt'
                      }`}
                    >
                      Manual (Custom)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Price Input & Amount Display with Reset button */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted font-bold text-xs">
                        Rs
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={planPrice}
                        onChange={(e) => {
                          setPlanPrice(Number(e.target.value));
                        }}
                        className="w-36 sm:w-40 bg-surface-2 text-txt pl-11 pr-3 py-2 rounded-xl border border-border font-mono text-base font-bold focus:outline-none focus:border-gold-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPlanPriceType('Automatic');
                        refreshPlanPricing(activePlan, editedDaysPerWeek);
                        showToast('Pricing reset to suggested automatic recommendation.');
                      }}
                      className="px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-txt-muted hover:text-gold-primary border border-border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                      title="Reset price to automatic formula"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gold-primary" />
                      <span>Reset Price</span>
                    </button>
                    <div className="text-xs text-txt-muted">
                      <span>Billed for </span>
                      <strong className="text-txt">{activePlan.memberName || 'Athlete'}</strong>
                      <span className="block text-[10px] text-gold-primary mt-0.5">
                        {planPriceType === 'Automatic' ? 'Suggested Rate' : 'Custom Override'}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown explanation */}
                  {planPriceType === 'Automatic' && priceBreakdown ? (
                    <div className="text-[11px] text-txt-muted space-y-0.5 bg-surface-2/60 p-3 rounded-xl border border-border/60">
                      <span className="font-bold text-gold-primary block mb-1">Pricing Formula Breakdown:</span>
                      {priceBreakdown.explanation.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-gold-primary">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-txt-muted italic bg-surface-2/60 p-3 rounded-xl border border-border/60">
                      Custom price entered by coach. Will be documented on the official receipt upon saving.
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Bar (shown for generator session; saved plan view uses dedicated top bar) */}
              {!viewingSavedPlan && (
                <div className="no-print p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs text-txt-muted uppercase tracking-wider mr-1">
                      CONTROLS:
                    </span>
                    {isEditMode ? (
                      <button
                        onClick={handleFinishEditing}
                        className="px-4 py-2 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Done Editing (Save Routine)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartEditing}
                        className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gold-primary" />
                        <span>Edit Plan & Routine</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={handleSavePlan}
                      className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Save Plan & Generate Receipt"
                    >
                      <Save className="w-4 h-4 text-gold-primary" />
                      <span>Save Plan & Receipt</span>
                    </button>

                    <button
                      onClick={handleDownloadPlanPdf}
                      disabled={isExportingPlan !== null}
                      className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Download Direct PDF"
                    >
                      {isExportingPlan === 'download' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
                      ) : (
                        <Download className="w-4 h-4 text-gold-primary" />
                      )}
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={handleSharePlanPdf}
                      disabled={isExportingPlan !== null}
                      className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Share via WhatsApp or Email"
                    >
                      {isExportingPlan === 'share' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
                      ) : (
                        <Share2 className="w-4 h-4 text-gold-primary" />
                      )}
                      <span>Share PDF</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
                      title="Print Document"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STRUCTURED PLAN EDITOR (When Edit Mode is active) */}
              {isEditMode ? (
                <div className="p-6 md:p-8 rounded-2xl bg-surface border-2 border-gold-primary/50 space-y-8 animate-fadeIn shadow-2xl">
                  {/* Top Alert in Edit Mode */}
                  <div className="p-4 rounded-xl bg-gold-primary/10 border border-gold-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gold-primary text-black flex items-center justify-center font-bold">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-heading text-xs sm:text-sm text-txt">
                          STRUCTURED PLAN EDITOR ACTIVE
                        </h4>
                        <p className="text-[11px] text-txt-muted">
                          Adjust days-per-week split, swap exercises with library items, and edit meals. Click &quot;Done Editing&quot; when complete.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleFinishEditing}
                      className="px-4 py-1.5 rounded-lg bg-gold-primary text-black font-bold text-xs hover:brightness-110 transition-all shadow-sm shadow-gold-primary/25 self-start sm:self-auto cursor-pointer"
                    >
                      Done Editing
                    </button>
                  </div>

                  {/* Header Free-Text Editing */}
                  <div className="space-y-4 border-b border-border pb-6">
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                        Plan Title
                      </label>
                      <input
                        type="text"
                        value={editedPlanTitle}
                        onChange={(e) => setEditedPlanTitle(e.target.value)}
                        className="text-lg md:text-xl font-heading text-gold-primary bg-surface-2 px-3 py-2 rounded-xl border border-border w-full focus:outline-none focus:border-gold-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                          Daily Target Calories (kcal)
                        </label>
                        <input
                          type="number"
                          value={editedCalories}
                          onChange={(e) => setEditedCalories(Number(e.target.value))}
                          className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border font-mono text-base font-bold focus:outline-none focus:border-gold-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">
                          Split Designation
                        </label>
                        <input
                          type="text"
                          value={editedSplitName}
                          onChange={(e) => setEditedSplitName(e.target.value)}
                          placeholder="e.g. Upper / Lower Hypertrophy Split"
                          className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WORKOUT SCHEDULE EDITOR */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-gold-primary" />
                        <h3 className="font-heading text-sm md:text-base text-txt">
                          WORKOUT ROUTINE STRUCTURE
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Days Per Week Dropdown (3/4/5/6) */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-txt-muted">Days/Week:</span>
                          <select
                            value={editedDaysPerWeek}
                            onChange={(e) => handleDaysPerWeekDropdownChange(Number(e.target.value))}
                            className="bg-surface-2 text-txt px-3 py-1.5 rounded-xl border border-gold-primary font-bold text-xs focus:outline-none"
                          >
                            <option value={3}>3 Days Split</option>
                            <option value={4}>4 Days Split</option>
                            <option value={5}>5 Days Split</option>
                            <option value={6}>6 Days Split</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddWorkoutDay}
                          className="px-3 py-1.5 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-gold-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Day</span>
                        </button>
                      </div>
                    </div>

                    {/* Workout Days List */}
                    <div className="space-y-6">
                      {editedSchedule.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-5 rounded-2xl bg-surface-2/70 border border-border space-y-4"
                        >
                          {/* Day Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                              <input
                                type="text"
                                value={day.day}
                                onChange={(e) => {
                                  const next = [...editedSchedule];
                                  next[dIdx].day = e.target.value;
                                  setEditedSchedule(next);
                                }}
                                className="bg-surface text-txt px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:outline-none focus:border-gold-primary"
                                placeholder="Day Label (e.g. Day 1 (Mon))"
                              />
                              <input
                                type="text"
                                value={day.focus}
                                onChange={(e) => {
                                  const next = [...editedSchedule];
                                  next[dIdx].focus = e.target.value;
                                  setEditedSchedule(next);
                                }}
                                className="bg-surface text-gold-primary px-3 py-1.5 rounded-xl border border-border text-xs font-semibold focus:outline-none focus:border-gold-primary"
                                placeholder="Focus (e.g. Chest & Triceps)"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveWorkoutDay(dIdx)}
                              className="px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                              title="Delete this entire day"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Day</span>
                            </button>
                          </div>

                          {/* Exercise Rows */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-txt-muted px-2">
                              <span className="col-span-5 sm:col-span-6">Exercise Name & Library Swap</span>
                              <span className="col-span-2">Sets</span>
                              <span className="col-span-2">Reps</span>
                              <span className="col-span-2">Rest</span>
                              <span className="col-span-1 text-right">Del</span>
                            </div>

                            {day.exercises.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-surface border border-border/70 text-xs"
                              >
                                {/* Exercise Name & Swap Button */}
                                <div className="col-span-5 sm:col-span-6 flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={ex.name}
                                    onChange={(e) => {
                                      const next = [...editedSchedule];
                                      next[dIdx].exercises[exIdx].name = e.target.value;
                                      setEditedSchedule(next);
                                    }}
                                    className="w-full bg-surface-2 text-txt px-2.5 py-1.5 rounded-lg border border-border/70 text-xs focus:outline-none focus:border-gold-primary font-medium"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenExerciseSwapPicker(dIdx, exIdx)}
                                    title="Swap this exercise with another from the Exercise Library"
                                    className="px-2 py-1.5 rounded-lg bg-surface-2 border border-border hover:border-gold-primary/60 text-gold-primary flex items-center gap-1 text-[11px] font-medium shrink-0 cursor-pointer"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span className="hidden sm:inline">Change</span>
                                  </button>
                                </div>

                                {/* Sets */}
                                <div className="col-span-2">
                                  <input
                                    type="text"
                                    value={ex.sets}
                                    onChange={(e) => {
                                      const next = [...editedSchedule];
                                      next[dIdx].exercises[exIdx].sets = e.target.value;
                                      setEditedSchedule(next);
                                    }}
                                    className="w-full bg-surface-2 text-txt px-2 py-1.5 rounded-lg border border-border/70 text-xs text-center font-mono focus:outline-none focus:border-gold-primary"
                                  />
                                </div>

                                {/* Reps */}
                                <div className="col-span-2">
                                  <input
                                    type="text"
                                    value={ex.reps}
                                    onChange={(e) => {
                                      const next = [...editedSchedule];
                                      next[dIdx].exercises[exIdx].reps = e.target.value;
                                      setEditedSchedule(next);
                                    }}
                                    className="w-full bg-surface-2 text-txt px-2 py-1.5 rounded-lg border border-border/70 text-xs text-center font-mono focus:outline-none focus:border-gold-primary"
                                  />
                                </div>

                                {/* Rest */}
                                <div className="col-span-2">
                                  <input
                                    type="text"
                                    value={ex.rest || '60s'}
                                    onChange={(e) => {
                                      const next = [...editedSchedule];
                                      next[dIdx].exercises[exIdx].rest = e.target.value;
                                      setEditedSchedule(next);
                                    }}
                                    className="w-full bg-surface-2 text-txt px-2 py-1.5 rounded-lg border border-border/70 text-xs text-center font-mono focus:outline-none focus:border-gold-primary"
                                  />
                                </div>

                                {/* Remove Button */}
                                <div className="col-span-1 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExercise(dIdx, exIdx)}
                                    className="p-1.5 text-txt-muted hover:text-rose-400 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Day Footer: Add Exercise Options */}
                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-txt-muted font-semibold">
                                + Add from Library:
                              </span>
                              <select
                                onChange={(e) => {
                                  handleAddLibraryExerciseToDay(dIdx, e.target.value);
                                  e.target.value = '';
                                }}
                                defaultValue=""
                                className="bg-surface text-txt px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-gold-primary"
                              >
                                <option value="" disabled>
                                  -- Pick an Exercise --
                                </option>
                                <optgroup label="Chest">
                                  {EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'Chest').map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Back">
                                  {EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'Back').map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Legs">
                                  {EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'Legs').map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Shoulders">
                                  {EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'Shoulders').map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Arms">
                                  {EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'Arms').map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Core">
                                  {EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'Core').map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Cardio">
                                  {EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'Cardio').map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddCustomExerciseRow(dIdx)}
                              className="px-2.5 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary/60 text-txt text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Custom Exercise Row</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NUTRITION & PAKISTANI MEALS EDITOR */}
                  <div className="space-y-6 pt-4 border-t border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Apple className="w-5 h-5 text-gold-primary" />
                        <h3 className="font-heading text-sm md:text-base text-txt">
                          PAKISTANI HALAL MEAL PROTOCOL
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleRecalculateMealCalories}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-medium flex items-center gap-1 cursor-pointer"
                          title="Recalculate total calories from meals"
                        >
                          <Activity className="w-3.5 h-3.5 text-gold-primary" />
                          <span>Sync Total Calories</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddCustomMealSlot}
                          className="px-3 py-1.5 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-gold-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Meal Slot</span>
                        </button>
                      </div>
                    </div>

                    {/* Meal Slots List */}
                    <div className="space-y-4">
                      {editedMeals.map((meal, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-4 rounded-xl bg-surface-2/70 border border-border space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                              <input
                                type="text"
                                value={meal.time}
                                onChange={(e) => {
                                  const next = [...editedMeals];
                                  next[mIdx].time = e.target.value;
                                  setEditedMeals(next);
                                }}
                                className="bg-surface text-gold-primary font-semibold px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-gold-primary"
                                placeholder="Meal Slot (e.g. Breakfast (Nashta))"
                              />
                              <input
                                type="text"
                                value={meal.name}
                                onChange={(e) => {
                                  const next = [...editedMeals];
                                  next[mIdx].name = e.target.value;
                                  setEditedMeals(next);
                                }}
                                className="bg-surface text-txt font-bold px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-gold-primary"
                                placeholder="Meal Title (e.g. Lean Protein Nashta)"
                              />
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleSwapGeneratedMeal(mIdx)}
                                title="Swap this meal with authentic Pakistani food alternatives"
                                className="px-2.5 py-1.5 rounded-lg bg-surface border border-border hover:border-gold-primary/60 text-gold-primary flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Change (Swap)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveMeal(mIdx)}
                                className="p-1.5 text-txt-muted hover:text-rose-400 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Portion items text */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                              Meal Components & Portions
                            </label>
                            <textarea
                              rows={2}
                              value={meal.items}
                              onChange={(e) => {
                                const next = [...editedMeals];
                                next[mIdx].items = e.target.value;
                                setEditedMeals(next);
                              }}
                              className="w-full bg-surface text-txt p-2 rounded-lg border border-border text-xs focus:outline-none focus:border-gold-primary resize-none leading-relaxed"
                            />
                          </div>

                          {/* Inline Calories & Protein */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase text-txt-muted font-bold">
                                Calories (kcal)
                              </label>
                              <input
                                type="number"
                                value={meal.calories || 0}
                                onChange={(e) => {
                                  const next = [...editedMeals];
                                  next[mIdx].calories = Number(e.target.value);
                                  setEditedMeals(next);
                                }}
                                className="w-full bg-surface text-txt px-2 py-1 rounded border border-border font-mono text-xs focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase text-txt-muted font-bold">
                                Protein (g)
                              </label>
                              <input
                                type="number"
                                value={meal.proteinGrams || 0}
                                onChange={(e) => {
                                  const next = [...editedMeals];
                                  next[mIdx].proteinGrams = Number(e.target.value);
                                  setEditedMeals(next);
                                }}
                                className="w-full bg-surface text-txt px-2 py-1 rounded border border-border font-mono text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Pakistani Food from Library */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-txt-muted font-semibold">
                          + Add Pakistani Meal from Library:
                        </span>
                        <select
                          onChange={(e) => {
                            handleAddFoodFromLibrary(e.target.value);
                            e.target.value = '';
                          }}
                          defaultValue=""
                          className="bg-surface text-txt px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-gold-primary"
                        >
                          <option value="" disabled>
                            -- Pick a Pakistani Food Item --
                          </option>
                          <optgroup label="Nashta (Breakfast)">
                            {PAKISTANI_FOOD_LIBRARY.filter((f) => f.slot === 'Nashta').map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.calories} kcal)
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Lunch (Dopahar)">
                            {PAKISTANI_FOOD_LIBRARY.filter((f) => f.slot === 'Lunch').map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.calories} kcal)
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Snack (Asar)">
                            {PAKISTANI_FOOD_LIBRARY.filter((f) => f.slot === 'Snack').map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.calories} kcal)
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Dinner (Raat)">
                            {PAKISTANI_FOOD_LIBRARY.filter((f) => f.slot === 'Dinner').map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.calories} kcal)
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Coach Directives in Edit Mode */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <label className="text-[11px] uppercase font-bold text-txt-muted tracking-wider block">
                      Coach Directives & Special Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add coaching recommendations, progressive overload rules, or recovery tips..."
                      className="w-full p-3 rounded-xl bg-surface-2 text-txt text-xs border border-border resize-none leading-relaxed focus:outline-none focus:border-gold-primary"
                    />
                  </div>

                  {/* Bottom Save Bar inside Editor */}
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 rounded-xl text-txt-muted hover:text-txt text-xs font-semibold cursor-pointer"
                    >
                      Cancel Edits
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishEditing}
                      className="px-6 py-2.5 rounded-xl bg-gold-primary text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-md shadow-gold-primary/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Done Editing (Save Routine)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* PRINTABLE DOCUMENT SHEET */
                <div
                  id="printable-plan"
                  className="p-6 md:p-8 rounded-2xl bg-surface border border-border space-y-8 print:p-0 print:border-none print:shadow-none"
                >
                  {/* Header */}
                  <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-gold-primary text-black flex items-center justify-center font-bold">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <span className="font-heading text-lg text-txt tracking-wide">
                          {gym.name}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-heading text-gold-primary">
                        {activePlan.title}
                      </h2>
                      <p className="text-xs text-txt-muted mt-1">
                        Athlete: <strong className="text-txt">{activePlan.memberName}</strong> • Generated on {formatDatePK(activePlan.generatedDate)}
                      </p>
                    </div>

                    <div className="text-left md:text-right space-y-1">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold-primary/15 text-gold-primary border border-gold-primary/30">
                        {activePlan.goal.toUpperCase()} PROTOCOL
                      </span>
                      <p className="text-[11px] text-txt-muted">{gym.address}</p>
                      <p className="text-[11px] text-txt-muted">Phone: {gym.phone}</p>
                    </div>
                  </div>

                  {/* Visual Frame Observations (If photo mode) */}
                  {activePlan.visualObservations && (
                    <div className="p-4 rounded-xl bg-gold-primary/10 border border-gold-primary/30 space-y-1.5">
                      <div className="flex items-center gap-2 text-gold-primary text-xs font-bold uppercase tracking-wider">
                        <Eye className="w-4 h-4" />
                        <span>Visual Frame Assessment</span>
                      </div>
                      <p className="text-xs text-txt leading-relaxed">
                        {activePlan.visualObservations}
                      </p>
                    </div>
                  )}

                  {/* Macro Target & Metabolic Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-surface-2 border border-border text-center">
                      <span className="text-[10px] uppercase text-txt-muted font-bold block mb-1">
                        Daily Target Calories
                      </span>
                      <span className="text-2xl font-heading text-gold-primary">
                        {activePlan.nutrition.dailyCalories}
                      </span>
                      <span className="text-[10px] text-txt-muted block mt-0.5">kcal / day</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-2 border border-border text-center">
                      <span className="text-[10px] uppercase text-txt-muted font-bold block mb-1">
                        Target Protein
                      </span>
                      <span className="text-2xl font-heading text-txt">
                        {activePlan.nutrition.proteinGrams}g
                      </span>
                      <span className="text-[10px] text-txt-muted block mt-0.5">high satiety & repair</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-2 border border-border text-center">
                      <span className="text-[10px] uppercase text-txt-muted font-bold block mb-1">
                        Complex Carbs
                      </span>
                      <span className="text-2xl font-heading text-txt">
                        {activePlan.nutrition.carbsGrams}g
                      </span>
                      <span className="text-[10px] text-txt-muted block mt-0.5">glycogen & energy</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-2 border border-border text-center">
                      <span className="text-[10px] uppercase text-txt-muted font-bold block mb-1">
                        Healthy Fats
                      </span>
                      <span className="text-2xl font-heading text-txt">
                        {activePlan.nutrition.fatGrams}g
                      </span>
                      <span className="text-[10px] text-txt-muted block mt-0.5">hormone synthesis</span>
                    </div>
                  </div>

                  {/* Section 1: Workout Routine */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Dumbbell className="w-4 h-4 text-gold-primary" />
                      <h3 className="font-heading text-sm text-txt">
                        WORKOUT SCHEDULE — {activePlan.splitName || `${activePlan.daysPerWeek || 4}-Day Split`}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activePlan.schedule.map((day, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-border/60 pb-2">
                            <span className="font-heading text-xs text-txt">{day.day}</span>
                            <span className="text-[11px] font-medium text-gold-primary">{day.focus}</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            {day.exercises.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="flex items-start justify-between gap-2 p-1.5 rounded bg-surface/40"
                              >
                                <div>
                                  <span className="font-semibold text-txt block">{ex.name}</span>
                                  {ex.notes && (
                                    <span className="text-[10px] text-txt-muted">{ex.notes}</span>
                                  )}
                                </div>
                                <div className="text-right shrink-0 font-mono text-[11px] text-txt-muted">
                                  <span className="font-bold text-txt">{ex.sets} sets</span> × {ex.reps}
                                  {ex.rest && <span className="block text-[10px]">Rest: {ex.rest}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Authentic Pakistani Nutrition Meals */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Apple className="w-4 h-4 text-gold-primary" />
                      <h3 className="font-heading text-sm text-txt">
                        AUTHENTIC PAKISTANI MEAL PLAN ({activePlan.foodPreference || 'Halal'})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activePlan.nutrition.sampleMeals.map((meal, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gold-primary">{meal.time}</span>
                            <div className="flex items-center gap-2">
                              {meal.calories && (
                                <span className="font-mono text-[11px] text-txt-muted">
                                  ~{meal.calories} kcal • {meal.proteinGrams}g pro
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSwapGeneratedMeal(idx)}
                                title="Swap with another authentic Pakistani meal alternative"
                                className="no-print px-2 py-0.5 rounded-md bg-surface border border-border hover:border-gold-primary/60 text-txt-muted hover:text-gold-primary flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3 text-gold-primary" />
                                <span>Change</span>
                              </button>
                            </div>
                          </div>
                          <h4 className="font-bold text-txt text-sm">{meal.name}</h4>
                          <p className="text-txt-muted leading-relaxed">{meal.items}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Coaching Tips & Hydration */}
                  <div className="space-y-3">
                    <h4 className="font-heading text-xs text-txt uppercase tracking-wider">
                      PRACTICAL RECOVERY GUIDELINES
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-txt-muted">
                      {activePlan.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-2">
                          <Check className="w-3.5 h-3.5 text-gold-primary shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Admin Notes */}
                  {activePlan.notes && (
                    <div className="p-4 rounded-xl bg-surface-2/60 border border-border text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-txt-muted block">
                        Coach Directives
                      </span>
                      <p className="text-txt leading-relaxed">{activePlan.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SAVED PLANS */}
      {/* ========================================================================= */}
      {!viewingSavedPlan && activeMainTab === 'saved' && (
        <div className="space-y-6">
          {savedPlans.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-2 text-gold-primary flex items-center justify-center mx-auto">
                <Save className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-txt">NO PLANS SAVED YET</h3>
                <p className="text-xs text-txt-muted max-w-sm mx-auto mt-1">
                  Generated workout & diet protocols for your athletes will be stored here for fast printing, reviews, receipts, and progression updates.
                </p>
              </div>
              <button
                onClick={() => setActiveMainTab('generate')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-primary text-black font-semibold text-xs md:text-sm hover:brightness-110 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate First Plan</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl bg-surface border border-border hover:border-gold-primary/40 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-primary/15 text-gold-primary border border-gold-primary/30">
                        {plan.goal}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-txt-muted block">
                          {formatDatePK(plan.generatedDate)}
                        </span>
                        {plan.price && (
                          <span className="text-xs font-mono font-bold text-gold-primary block">
                            {formatPKR(plan.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-heading text-base text-txt truncate">{plan.title}</h4>
                    <p className="text-xs text-txt-muted">
                      Athlete: <strong className="text-txt">{plan.memberName}</strong>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-surface-2 border border-border/60">
                      <div>
                        <span className="text-txt-muted block text-[10px] uppercase">Calories</span>
                        <span className="font-bold text-txt">{plan.targetCalories} kcal</span>
                      </div>
                      <div>
                        <span className="text-txt-muted block text-[10px] uppercase">Split</span>
                        <span className="font-bold text-txt">{plan.daysPerWeek || plan.schedule.length} Days/wk</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setViewingSavedPlan(plan);
                          setCurrentPlan(null);
                          setEditedPlanTitle(plan.title || '');
                          setEditedSplitName(plan.splitName || '');
                          setEditedCalories(plan.targetCalories || 2400);
                          setEditedNotes(plan.notes || '');
                          setEditedDaysPerWeek(plan.daysPerWeek || plan.schedule.length || 4);
                          setEditedSchedule(JSON.parse(JSON.stringify(plan.schedule)));
                          setEditedMeals(JSON.parse(JSON.stringify(plan.nutrition.sampleMeals)));
                          refreshPlanPricing(plan);
                        }}
                        className="font-semibold text-gold-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View & Print</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {plan.receipt && (
                        <button
                          onClick={() => {
                            setActiveReceipt(plan.receipt!);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                          title="View Official Receipt"
                        >
                          <Receipt className="w-3 h-3 text-gold-primary" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSavedPlan(plan.id)}
                      className="p-1.5 rounded-lg text-txt-muted hover:text-rose-500 hover:bg-surface-2 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GENERAL BUILT-IN PLANS (PAKISTANI NUTRITION) */}
      {/* ========================================================================= */}
      {!viewingSavedPlan && activeMainTab === 'general' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="no-print p-4 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gold-primary" />
                <h3 className="font-heading text-xs uppercase tracking-wider text-txt">
                  FILTER GENERAL PLANS ({filteredGeneralPlans.length} AVAILABLE)
                </h3>
              </div>
              {(filterGoal !== 'All' || filterLevel !== 'All' || filterDays !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterGoal('All');
                    setFilterLevel('All');
                    setFilterDays('All');
                  }}
                  className="text-xs text-gold-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filter by Goal */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                  Goal
                </label>
                <select
                  value={filterGoal}
                  onChange={(e) => setFilterGoal(e.target.value)}
                  className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary cursor-pointer"
                >
                  <option value="All">All Goals</option>
                  <option value="Bulking">Bulking (Mass)</option>
                  <option value="Cutting">Cutting (Shred)</option>
                  <option value="General Fitness">General Fitness</option>
                </select>
              </div>

              {/* Filter by Level */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                  Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Filter by Days / Week */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                  Split Length
                </label>
                <select
                  value={filterDays}
                  onChange={(e) => setFilterDays(e.target.value)}
                  className="w-full bg-surface-2 text-txt px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-gold-primary cursor-pointer"
                >
                  <option value="All">All Splits (3-6 Days)</option>
                  <option value="3">3 Days / Week</option>
                  <option value="4">4 Days / Week</option>
                  <option value="5">5 Days / Week</option>
                  <option value="6">6 Days / Week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGeneralPlans.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-2xl bg-surface border border-border space-y-2">
                <p className="text-sm font-semibold text-txt">No plans match these filters.</p>
                <p className="text-xs text-txt-muted">Try resetting one of your filter selections above.</p>
              </div>
            ) : (
              filteredGeneralPlans.map((plan) => {
                const isSelected = selectedGeneralPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedGeneralPlan(plan)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-gold-primary/10 border-gold-primary shadow-md'
                        : 'bg-surface border-border hover:border-gold-primary/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-primary/15 text-gold-primary border border-gold-primary/30">
                          {plan.goal}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-txt-muted">
                          <span className="font-semibold text-txt">{plan.level}</span>
                          <span>•</span>
                          <span>{plan.daysPerWeek}d/wk</span>
                        </div>
                      </div>

                      <h4 className="font-heading text-sm text-txt leading-snug">{plan.title}</h4>
                      <p className="text-xs text-txt-muted line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                      <span className="font-mono font-bold text-gold-primary">
                        {plan.calories} kcal/day
                      </span>
                      <span className="text-[11px] text-txt-muted font-medium">
                        {isSelected ? 'Currently Viewing ↓' : 'Click to view'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Full Plan Viewer for Selected General Plan */}
          {selectedGeneralPlan && (
            <div className="space-y-4 pt-4">
              {/* Controls */}
              <div className="no-print p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm text-txt truncate">
                    VIEWING: {selectedGeneralPlan.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleCopyGeneralPlan(selectedGeneralPlan)}
                    className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-gold-primary" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={handleDownloadGeneralPlanPdf}
                    disabled={isExportingGeneral !== null}
                    className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Download Direct PDF"
                  >
                    {isExportingGeneral === 'download' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
                    ) : (
                      <Download className="w-4 h-4 text-gold-primary" />
                    )}
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={handleShareGeneralPlanPdf}
                    disabled={isExportingGeneral !== null}
                    className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Share via WhatsApp or Email"
                  >
                    {isExportingGeneral === 'share' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
                    ) : (
                      <Share2 className="w-4 h-4 text-gold-primary" />
                    )}
                    <span>Share PDF</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-surface-2 border border-border hover:border-gold-primary/60 text-txt text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-gold-primary" />
                    <span>Print Template</span>
                  </button>

                  <button
                    onClick={() => setIsSellGeneralPlanModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
                    title="Sell this general fitness plan and generate official receipt"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Sell to Customer</span>
                  </button>
                </div>
              </div>

              {/* Printable General Plan Document */}
              <div
                id="printable-general-plan"
                className="p-6 md:p-8 rounded-2xl bg-surface border border-border space-y-8 print:p-0 print:border-none print:shadow-none"
              >
                <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gold-primary tracking-wider block mb-1">
                      {selectedGeneralPlan.goal.toUpperCase()} TEMPLATE • {selectedGeneralPlan.level.toUpperCase()} ({selectedGeneralPlan.daysPerWeek} DAYS/WEEK)
                    </span>
                    <h2 className="font-heading text-xl md:text-2xl text-txt">
                      {selectedGeneralPlan.title}
                    </h2>
                    <p className="text-xs text-txt-muted mt-1 max-w-xl">
                      {selectedGeneralPlan.description}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="font-heading text-2xl text-gold-primary block">
                      {selectedGeneralPlan.calories} kcal
                    </span>
                    <span className="text-[11px] text-txt-muted">{selectedGeneralPlan.duration}</span>
                  </div>
                </div>

                {/* Workout Routine */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Dumbbell className="w-4 h-4 text-gold-primary" />
                    <h3 className="font-heading text-sm text-txt">EXERCISE SPLIT</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedGeneralPlan.schedule.map((day, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-2 border border-border space-y-2.5 text-xs"
                      >
                        <div className="flex justify-between border-b border-border/60 pb-1.5 font-semibold">
                          <span className="text-txt">{day.day}</span>
                          <span className="text-gold-primary">{day.focus}</span>
                        </div>
                        <div className="space-y-1.5">
                          {day.exercises.map((ex, exIdx) => (
                            <div key={exIdx} className="flex justify-between text-txt-muted">
                              <span>{ex.name}</span>
                              <span className="font-mono text-txt">
                                {ex.sets} × {ex.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentic Pakistani Nutrition Framework */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Apple className="w-4 h-4 text-gold-primary" />
                    <h3 className="font-heading text-sm text-txt">PAKISTANI HALAL NUTRITION FRAMEWORK</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedGeneralPlan.dietSummary.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-2 border border-border space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gold-primary block">{d.meal}</span>
                          <div className="flex items-center gap-2">
                            {d.calories && (
                              <span className="font-mono text-[11px] text-txt-muted">
                                ~{d.calories} kcal • {d.proteinGrams}g pro
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSwapGeneralPlanMeal(idx)}
                              title="Swap with another authentic Pakistani meal alternative"
                              className="no-print px-2 py-0.5 rounded-md bg-surface border border-border hover:border-gold-primary/60 text-txt-muted hover:text-gold-primary flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 text-gold-primary" />
                              <span>Change</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-txt-muted leading-relaxed">{d.items}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXERCISE SWAP PICKER MODAL */}
      <ExerciseSwapPickerModal
        isOpen={swapModalState.isOpen}
        currentExerciseName={swapModalState.currentName}
        initialMuscleGroup={swapModalState.initialGroup}
        onSelect={handleExerciseSwapped}
        onClose={() =>
          setSwapModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* PLAN RECEIPT MODAL */}
      {isReceiptModalOpen && activeReceipt && (
        <PlanReceiptModal
          receipt={activeReceipt}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setActiveReceipt(null);
          }}
          showToast={showToast}
        />
      )}

      {/* SELL GENERAL PLAN MODAL */}
      {selectedGeneralPlan && (
        <SellGeneralPlanModal
          isOpen={isSellGeneralPlanModalOpen}
          plan={selectedGeneralPlan}
          members={members}
          onClose={() => setIsSellGeneralPlanModalOpen(false)}
          onReceiptGenerated={(receipt) => {
            setActiveReceipt(receipt);
            setIsReceiptModalOpen(true);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};
