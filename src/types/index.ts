// ============================================================================
// IRONFORGE - Core Data Types
// ============================================================================

export type FeeStatus = 'Paid' | 'Due soon' | 'Overdue';

export type FitnessGoal = 'Bulking' | 'Cutting' | 'General Fitness';

export type MemberProgram = 'Regular member' | 'Cutting' | 'Bulking';

export type Gender = 'Male' | 'Female' | 'Other';

export type FoodPreference = 'Non-veg' | 'Vegetarian';

export type BudgetLevel = 'Low' | 'Medium' | 'High';

export type ActivityLevel =
  | 'Sedentary (desk job, little exercise)'
  | 'Lightly Active (1-3 days/week)'
  | 'Moderately Active (3-5 days/week)'
  | 'Very Active (6-7 days/week)'
  | 'Extremely Active (hard physical labor/athlete)';

export interface Member {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  goal: FitnessGoal;
  program: MemberProgram; // 'Regular member' | 'Cutting' | 'Bulking'
  joinDate: string; // YYYY-MM-DD
  monthlyFee: number;
  notes: string;
  feeStatus: FeeStatus;
  nextDueDate: string; // YYYY-MM-DD
  lastPaymentDate?: string; // YYYY-MM-DD
  activityLevel?: string;
  injuries?: string;
  savedPlans?: GeneratedPlan[];
  planReceipts?: PlanReceipt[];
}

export interface PlanReceipt {
  id: string;
  receiptNumber: string;
  planId: string;
  planTitle: string;
  memberId?: string;
  memberName: string;
  memberPhone?: string;
  date: string;
  amount: number;
  priceType: 'Manual' | 'Automatic';
  coverageDescription: string;
  gymName: string;
  gymAddress: string;
  gymPhone: string;
  status: 'Paid';
}

export interface FeePayment {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  memberPhone?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: FeeStatus;
  paymentMethod?: 'Cash' | 'Card' | 'Online Transfer';
  notes?: string;
}

export interface ExerciseItem {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: ExerciseItem[];
  notes?: string;
}

export interface SampleMeal {
  time: string;
  name: string;
  items: string;
  calories?: number;
  proteinGrams?: number;
}

export interface PlanNutrition {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sampleMeals: SampleMeal[];
}

export interface GeneratedPlan {
  id: string;
  title?: string;
  memberId?: string;
  memberName: string;
  goal: string;
  generatedDate: string;
  bmr?: number;
  tdee?: number;
  targetCalories?: number;
  daysPerWeek?: number;
  splitName?: string;
  injuries?: string;
  foodPreference?: string;
  budget?: string;
  isAiGenerated?: boolean;
  isManual?: boolean;
  visualObservations?: string;
  schedule: WorkoutDay[];
  nutrition: PlanNutrition;
  tips: string[];
  notes?: string;
  photoUrl?: string;
  price?: number;
  priceType?: 'Manual' | 'Automatic';
  receipt?: PlanReceipt;
  receiptId?: string;
}

export interface GeneralPlanMeal {
  meal: string;
  items: string;
  calories?: number;
  proteinGrams?: number;
}

export interface GeneralPlan {
  id: string;
  title: string;
  goal: FitnessGoal;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  daysPerWeek?: number;
  duration: string;
  calories: number;
  description: string;
  schedule: WorkoutDay[];
  dietSummary: GeneralPlanMeal[];
  nutrition?: {
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    tips: string[];
  };
}

// Exercise & Food Libraries for Manual Plan Builder & Meal Swapping
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets: string;
  defaultReps: string;
  defaultRest: string;
  notes?: string;
}

export type MealTimeSlot = 'Nashta' | 'Lunch' | 'Snack' | 'Dinner';

export interface LibraryFoodItem {
  id: string;
  name: string;
  slot: MealTimeSlot;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  goals: FitnessGoal[];
  preference: FoodPreference | 'Both';
  budget: BudgetLevel | 'All';
  description?: string;
}
