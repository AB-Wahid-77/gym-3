// ============================================================================
// IRONFORGE - Plan Pricing Engine (Pakistani Gym Standard)
// Computes automatic suggested pricing in PKR (Rs) based on protocol intensity,
// split days, visual frame diagnostics (Mode B), and nutrition budget tiers.
// Formula is centralized and editable here. Admin can always manually override.
// ============================================================================

import { FitnessGoal, BudgetLevel, GeneratedPlan } from '../types';

export interface PricingBreakdown {
  basePrice: number;
  daysAdjustment: number;
  photoAnalysisAdjustment: number;
  budgetAdjustment: number;
  totalComputed: number;
  explanation: string[];
}

export interface PlanPricingInput {
  goal: FitnessGoal | string;
  daysPerWeek?: number;
  isAiGenerated?: boolean;
  hasPhotoAnalysis?: boolean;
  budget?: BudgetLevel | string;
  isManual?: boolean;
}

/**
 * Calculates suggested plan price based on standard gym coaching parameters
 */
export function calculateAutomaticPlanPrice(input: PlanPricingInput): PricingBreakdown {
  const explanation: string[] = [];

  // 1. Base price by training objective
  let basePrice = 2500;
  const goalStr = (input.goal || '').toLowerCase();

  if (goalStr.includes('bulk')) {
    basePrice = 2800;
    explanation.push('Hypertrophy & progressive overload framework: Rs 2,800 base');
  } else if (goalStr.includes('cut')) {
    basePrice = 2800;
    explanation.push('Fat-loss deficit & lean muscle retention matrix: Rs 2,800 base');
  } else {
    basePrice = 2200;
    explanation.push('General conditioning & health maintenance: Rs 2,200 base');
  }

  // 2. Days per week split volume (+Rs 300 per day over 3 days)
  const days = Math.max(3, Math.min(7, input.daysPerWeek || 4));
  let daysAdjustment = 0;
  if (days > 3) {
    daysAdjustment = (days - 3) * 300;
    explanation.push(`${days}-Day split programming volume (+Rs ${daysAdjustment.toLocaleString()})`);
  } else {
    explanation.push('Standard 3-day foundation split (+Rs 0)');
  }

  // 3. Photo analysis diagnostic premium (Mode B Gemini vision analysis)
  let photoAnalysisAdjustment = 0;
  if (input.hasPhotoAnalysis) {
    photoAnalysisAdjustment = 800;
    explanation.push('AI visual posture & musculoskeletal diagnostic assessment (+Rs 800)');
  }

  // 4. Halal nutrition budget customization
  let budgetAdjustment = 0;
  const budgetStr = (input.budget || '').toLowerCase();
  if (budgetStr.includes('high')) {
    budgetAdjustment = 400;
    explanation.push('High-budget premium protein sourcing & meat rotation (+Rs 400)');
  } else if (budgetStr.includes('medium')) {
    budgetAdjustment = 200;
    explanation.push('Medium-budget balanced desi staples & dairy (+Rs 200)');
  }

  const totalComputed = basePrice + daysAdjustment + photoAnalysisAdjustment + budgetAdjustment;

  return {
    basePrice,
    daysAdjustment,
    photoAnalysisAdjustment,
    budgetAdjustment,
    totalComputed,
    explanation,
  };
}

/**
 * Convenience helper to calculate price directly from a GeneratedPlan
 */
export function getPlanSuggestedPrice(plan: Partial<GeneratedPlan>): number {
  const breakdown = calculateAutomaticPlanPrice({
    goal: plan.goal || 'General Fitness',
    daysPerWeek: plan.daysPerWeek || plan.schedule?.length || 4,
    hasPhotoAnalysis: Boolean(plan.visualObservations || plan.photoUrl),
    budget: plan.budget,
    isAiGenerated: plan.isAiGenerated,
    isManual: plan.isManual,
  });
  return breakdown.totalComputed;
}

/**
 * Calculates suggested automatic price for General Built-in Fitness Plans
 * Simpler flat rate based on goal, difficulty level, and split frequency.
 */
export function calculateGeneralPlanPrice(plan: {
  goal?: string;
  level?: string;
  daysPerWeek?: number;
}): PricingBreakdown {
  const explanation: string[] = [];
  let basePrice = 2000;
  const goalStr = (plan.goal || '').toLowerCase();

  if (goalStr.includes('bulk')) {
    basePrice = 2200;
    explanation.push('General Bulking Hypertrophy Protocol: Rs 2,200 base');
  } else if (goalStr.includes('cut')) {
    basePrice = 2200;
    explanation.push('General Cutting & Caloric Deficit Protocol: Rs 2,200 base');
  } else {
    basePrice = 1800;
    explanation.push('General Conditioning Foundation: Rs 1,800 base');
  }

  let levelAdjustment = 0;
  const level = plan.level || 'Beginner';
  if (level === 'Advanced') {
    levelAdjustment = 500;
    explanation.push('Advanced Periodization & High-Volume routines (+Rs 500)');
  } else if (level === 'Intermediate') {
    levelAdjustment = 300;
    explanation.push('Intermediate Progressive Overload routines (+Rs 300)');
  } else {
    explanation.push('Standard foundational program template (+Rs 0)');
  }

  const days = Math.max(3, Math.min(7, plan.daysPerWeek || 4));
  let daysAdjustment = 0;
  if (days > 3) {
    daysAdjustment = (days - 3) * 200;
    explanation.push(`${days}-Day split frequency (+Rs ${daysAdjustment.toLocaleString()})`);
  }

  const totalComputed = basePrice + levelAdjustment + daysAdjustment;

  return {
    basePrice,
    daysAdjustment,
    photoAnalysisAdjustment: 0,
    budgetAdjustment: levelAdjustment,
    totalComputed,
    explanation,
  };
}
