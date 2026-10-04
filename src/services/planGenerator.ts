// ============================================================================
// IRONFORGE - Plan Generator Service (Pakistani Nutrition & Training Protocol)
// Provides Mifflin-St Jeor metabolic calculations and authentic Pakistani halal
// meal frameworks (roti, daal, chana chaat, anda/eggs, chicken/beef salan, dahi, doodh).
// Serves as client/server fallback and local nutrition engine.
// ============================================================================

import {
  GeneratedPlan,
  GeneralPlan,
  FitnessGoal,
  Gender,
  WorkoutDay,
} from '../types';
import { generateUUID } from '../utils/uuid';

export interface PlanInputParams {
  memberId?: string;
  memberName: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  goal: FitnessGoal;
  activityLevel?: string;
  injuries?: string;
  daysPerWeek?: number;
  foodPreference?: 'Non-veg' | 'Vegetarian';
  budget?: 'Low' | 'Medium' | 'High';
  visualObservations?: string;
  isAiGenerated?: boolean;
}

/**
 * Maps activity level to standard Mifflin-St Jeor TDEE activity multiplier:
 * - Sedentary -> 1.2
 * - Lightly Active -> 1.375
 * - Moderately Active -> 1.55
 * - Very Active -> 1.725
 * - Extremely Active -> 1.9
 */
export function getActivityMultiplier(activityLevel?: string, daysPerWeek?: number): number {
  if (activityLevel) {
    const act = activityLevel.toLowerCase().trim();
    if (act.includes('sedentary')) return 1.2;
    if (act.includes('lightly') || act.includes('light')) return 1.375;
    if (act.includes('moderately') || act.includes('moderate')) return 1.55;
    if (act.includes('very active') || act.includes('very')) return 1.725;
    if (act.includes('extremely') || act.includes('extreme')) return 1.9;
  }

  // Fallback to days-per-week if activityLevel is unspecified
  if (daysPerWeek !== undefined && daysPerWeek > 0) {
    if (daysPerWeek <= 2) return 1.375;
    if (daysPerWeek <= 5) return 1.55;
    return 1.725;
  }

  return 1.55;
}

// Generate personalized workout and nutrition plan (Pakistani context)
export function generatePersonalizedPlan(params: PlanInputParams): GeneratedPlan {
  const {
    memberId,
    memberName,
    age,
    gender,
    height,
    weight,
    goal,
    activityLevel,
    injuries,
    daysPerWeek = 4,
    foodPreference = 'Non-veg',
    budget = 'Medium',
    visualObservations,
    isAiGenerated = false,
  } = params;

  // 1. Calculate Basal Metabolic Rate (Mifflin-St Jeor equation)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'Male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity multiplier dynamically mapped from selected activity level
  const activityMultiplier = getActivityMultiplier(activityLevel, daysPerWeek);
  const tdee = Math.round(bmr * activityMultiplier);

  let targetCalories = tdee;
  let proteinRatio = 2.0; // g/kg

  if (goal === 'Bulking') {
    targetCalories = Math.round(tdee + 400);
    proteinRatio = 2.0;
  } else if (goal === 'Cutting') {
    targetCalories = Math.round(tdee - 450);
    proteinRatio = 2.2;
  } else {
    targetCalories = Math.round(tdee);
    proteinRatio = 1.8;
  }

  const proteinGrams = Math.round(weight * proteinRatio);
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  const carbCalories = targetCalories - (proteinGrams * 4 + fatGrams * 9);
  const carbsGrams = Math.max(80, Math.round(carbCalories / 4));

  // 2. Generate customized schedule
  const schedule: WorkoutDay[] = [];
  const injuryNote = injuries && injuries.trim() ? ` (Tailored for: ${injuries})` : '';

  if (daysPerWeek <= 3) {
    schedule.push(
      {
        day: 'Day 1 (Mon)',
        focus: `Full Body Power & Compound Strength${injuryNote}`,
        exercises: [
          { name: 'Barbell Squats or Hack Squat', sets: '4', reps: '8-10', rest: '90s', notes: 'Brace core, chest up' },
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '8-10', rest: '90s', notes: 'Control eccentric tempo' },
          { name: 'Lat Pulldowns or Pull-ups', sets: '4', reps: '10-12', rest: '60s', notes: 'Squeeze lats at bottom' },
          { name: 'Standing Overhead Dumbbell Press', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Romanian Deadlifts', sets: '3', reps: '10-12', rest: '75s', notes: 'Hinge hips, soft knees' },
        ],
      },
      {
        day: 'Day 2 (Wed)',
        focus: `Upper Hypertrophy & Arms${injuryNote}`,
        exercises: [
          { name: 'Incline Dumbbell Press', sets: '4', reps: '10-12', rest: '75s' },
          { name: 'Seated Cable Row', sets: '4', reps: '10-12', rest: '60s' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' },
          { name: 'Barbell or Dumbbell Bicep Curls', sets: '3', reps: '12', rest: '45s' },
          { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Day 3 (Fri)',
        focus: `Lower Body & Core Stability${injuryNote}`,
        exercises: [
          { name: 'Leg Press', sets: '4', reps: '10-12', rest: '90s' },
          { name: 'Lying or Seated Leg Curls', sets: '4', reps: '12-15', rest: '60s' },
          { name: 'Dumbbell Walking Lunges', sets: '3', reps: '12 / leg', rest: '60s' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '45s' },
          { name: 'Hanging Leg Raises / Plank Hold', sets: '3', reps: '45-60s', rest: '45s' },
        ],
      }
    );
  } else {
    // 4-6 days split
    schedule.push(
      {
        day: 'Day 1 (Mon)',
        focus: `Upper Body Power${injuryNote}`,
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '6-8', rest: '90s' },
          { name: 'Overhead Barbell Press', sets: '3', reps: '8-10', rest: '75s' },
          { name: 'Bent-Over Barbell Row', sets: '4', reps: '8-10', rest: '75s' },
          { name: 'Incline Dumbbell Flyes', sets: '3', reps: '12', rest: '60s' },
          { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Day 2 (Tue)',
        focus: `Lower Body Power${injuryNote}`,
        exercises: [
          { name: 'Barbell Back Squats', sets: '4', reps: '6-8', rest: '120s' },
          { name: 'Romanian Deadlifts', sets: '4', reps: '8-10', rest: '90s' },
          { name: 'Leg Press', sets: '3', reps: '10-12', rest: '75s' },
          { name: 'Lying Hamstring Curls', sets: '3', reps: '12', rest: '60s' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '45s' },
        ],
      },
      {
        day: 'Day 3 (Thu)',
        focus: `Upper Body Hypertrophy${injuryNote}`,
        exercises: [
          { name: 'Incline Dumbbell Press', sets: '4', reps: '10-12', rest: '75s' },
          { name: 'Lat Pulldowns', sets: '4', reps: '10-12', rest: '60s' },
          { name: 'Seated Cable Rows', sets: '3', reps: '12', rest: '60s' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '12-15', rest: '45s' },
          { name: 'Incline Dumbbell Bicep Curls', sets: '3', reps: '12', rest: '45s' },
        ],
      },
      {
        day: 'Day 4 (Fri)',
        focus: `Lower Body & Core Hypertrophy${injuryNote}`,
        exercises: [
          { name: 'Front Squats or Hack Squat', sets: '3', reps: '8-10', rest: '90s' },
          { name: 'Dumbbell Walking Lunges', sets: '3', reps: '12 / leg', rest: '60s' },
          { name: 'Seated Leg Extensions', sets: '3', reps: '15', rest: '60s' },
          { name: 'Seated Hamstring Curls', sets: '3', reps: '15', rest: '60s' },
          { name: 'Cable Woodchoppers & Planks', sets: '3', reps: '15 / side', rest: '45s' },
        ],
      }
    );
  }

  // 3. Authentic Pakistani Halal Meal Protocols with everyday units
  let sampleMeals = [];

  const isVeg = foodPreference === 'Vegetarian';

  if (goal === 'Bulking') {
    sampleMeals = [
      {
        time: 'Breakfast (Nashta)',
        name: 'High-Protein Desi Nashta',
        items: isVeg
          ? '3 Boiled eggs (or paneer bhurji), 2 whole wheat rotis with 1 tsp desi ghee, 1 glass full cream milk (doodh) with 2 bananas.'
          : '4 Eggs (2 whole + 2 whites omelette or boiled), 2 whole wheat parathas or rotis, 1 glass full cream doodh with 2 bananas & 1 tbsp peanut butter.',
        calories: Math.round(targetCalories * 0.3),
        proteinGrams: Math.round(proteinGrams * 0.3),
      },
      {
        time: 'Lunch (Dopahar)',
        name: 'Hearty Salan & Rice/Roti Feast',
        items: isVeg
          ? '1 Large bowl Daal Mash or Daal Chana, 1 bowl dahi (plain yogurt), 3 whole wheat chapatis, 1 plate fresh kachumber salad (cucumber, onion, tomato).'
          : '220g Chicken Karahi or Salan (light oil), 3 whole wheat chapatis or 1 large plate boiled rice (chawal), 1 katori dahi raita, fresh green salad.',
        calories: Math.round(targetCalories * 0.35),
        proteinGrams: Math.round(proteinGrams * 0.35),
      },
      {
        time: 'Evening Snack (Asar)',
        name: 'Pre-Workout Chana & Dry Fruit Fuel',
        items: '1 Bowl boiled Chana Chaat (black or white chana with onion, tomato, lemon), 1 handful roasted peanuts or almonds, 1 cup green tea.',
        calories: Math.round(targetCalories * 0.15),
        proteinGrams: Math.round(proteinGrams * 0.15),
      },
      {
        time: 'Dinner (Raat)',
        name: 'Restorative Protein Dinner',
        items: isVeg
          ? '1 Bowl Paneer or Lobia (black-eyed peas) salan, 2 whole wheat rotis, 1 bowl mixed seasonal sabzi (tinda, palak, or bhindi), 1 glass doodh before bed.'
          : budget === 'High'
          ? '200g Mutton or Beef salan (or grilled fish), 2 whole wheat rotis, 1 bowl daal masoor, 1 glass doodh before sleep.'
          : '200g Chicken salan or boiled chicken breast, 2 whole wheat rotis, 1 bowl daal, 1 glass warm milk.',
        calories: Math.round(targetCalories * 0.2),
        proteinGrams: Math.round(proteinGrams * 0.2),
      },
    ];
  } else if (goal === 'Cutting') {
    sampleMeals = [
      {
        time: 'Breakfast (Nashta)',
        name: 'Lean Protein Nashta',
        items: '4 Egg whites + 1 whole egg anda omelette with green chillies, onions & tomatoes (prepared with minimal oil), 1 whole wheat chapati, 1 cup unsweetened black chai or green tea.',
        calories: Math.round(targetCalories * 0.25),
        proteinGrams: Math.round(proteinGrams * 0.3),
      },
      {
        time: 'Lunch (Dopahar)',
        name: 'Clean Daal & Lean Chicken',
        items: isVeg
          ? '1 Deep katori Daal Masoor or Daal Moong, 1 whole wheat chapati, 1 big bowl kachumber salad with lemon juice, 1 katori low-fat dahi.'
          : '180g Boiled or lightly grilled chicken breast with desi spices (zeera, kali mirch), 1 katori daal masoor, 1 thin whole wheat chapati, large cucumber & tomato salad.',
        calories: Math.round(targetCalories * 0.35),
        proteinGrams: Math.round(proteinGrams * 0.35),
      },
      {
        time: 'Evening Snack (Asar)',
        name: 'Light Snack & Hydration',
        items: '1 Cup roasted chana (bhunay huay chane) without salt, 1 glass unsweetened namkeen lassi (skimmed curd) or green tea.',
        calories: Math.round(targetCalories * 0.15),
        proteinGrams: Math.round(proteinGrams * 0.15),
      },
      {
        time: 'Dinner (Raat)',
        name: 'Low-Calorie Lean Dinner',
        items: isVeg
          ? '1 Bowl seasonal sabzi (palak/gobhi/lauki with 1 tsp oil), 1 thin chapati, 1 katori low-fat dahi, lemon salad.'
          : '180g Steamed fish or grilled chicken breast, 1 plate seasonal sabzi (palak, tori or bhindi with minimal oil), 1 small whole wheat chapati, fresh green salad.',
        calories: Math.round(targetCalories * 0.25),
        proteinGrams: Math.round(proteinGrams * 0.2),
      },
    ];
  } else {
    // General Fitness
    sampleMeals = [
      {
        time: 'Breakfast (Nashta)',
        name: 'Balanced Desi Nashta',
        items: '2 Boiled eggs or fluffy omelette, 1 whole wheat chapati with small dab of butter, 1 glass fresh milk (doodh) or chai, 1 apple or seasonal fruit.',
        calories: Math.round(targetCalories * 0.28),
        proteinGrams: Math.round(proteinGrams * 0.28),
      },
      {
        time: 'Lunch (Dopahar)',
        name: 'Balanced Home-Cooked Salan',
        items: isVeg
          ? '1 Plate boiled rice or 2 rotis, 1 bowl daal chana, mixed sabzi, 1 katori dahi, fresh salad.'
          : '1 Plate boiled rice (chawal) or 2 rotis, homemade chicken salan (1 leg/breast piece), 1 katori daal, fresh cucumber & onion salad.',
        calories: Math.round(targetCalories * 0.35),
        proteinGrams: Math.round(proteinGrams * 0.35),
      },
      {
        time: 'Evening Snack (Asar)',
        name: 'Energy Booster',
        items: '1 Bowl chana chaat with lemon juice or 1 handful walnuts/almonds, 1 cup green tea.',
        calories: Math.round(targetCalories * 0.15),
        proteinGrams: Math.round(proteinGrams * 0.15),
      },
      {
        time: 'Dinner (Raat)',
        name: 'Wholesome Family Dinner',
        items: isVeg
          ? '2 Whole wheat rotis, 1 bowl daal mash, 1 bowl bhindi or mixed sabzi, 1 katori dahi.'
          : '2 Whole wheat rotis, 1 bowl chicken or lean beef salan, 1 bowl seasonal sabzi, fresh green salad.',
        calories: Math.round(targetCalories * 0.22),
        proteinGrams: Math.round(proteinGrams * 0.22),
      },
    ];
  }

  // 4. Practical Tips
  const tips = [
    'Hydration: Drink at least 3.5 to 4.5 liters of clean water daily, especially during warm Pakistani gym sessions.',
    'Cooking Oils: Instruct home cooks to reduce excess cooking oil/ghee in salan (limit to 1-2 tsp per serving for cutting, moderate for bulking).',
    'Progressive Overload: Strive to add 1 rep or small weight increments to compound lifts every 10-14 days.',
    'Rest & Recovery: Maintain 7 to 8 hours of consistent night sleep. Muscles rebuild outside the gym.',
  ];

  if (injuries && injuries.trim()) {
    tips.push(`Safety Notice: Respect comfort threshold for ${injuries}. Never push through joint or tendon pain.`);
  }

  const splitName =
    daysPerWeek <= 3
      ? '3-Day Full Body Power & Conditioning'
      : `${daysPerWeek}-Day Upper / Lower Strength Protocol`;

  return {
    id: generateUUID(),
    title: `${goal} Protocol - ${memberName}`,
    memberId,
    memberName,
    goal,
    generatedDate: new Date().toISOString().split('T')[0],
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    daysPerWeek,
    splitName,
    injuries: injuries || 'None reported',
    foodPreference,
    budget,
    isAiGenerated,
    visualObservations: visualObservations || undefined,
    schedule,
    nutrition: {
      dailyCalories: targetCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      sampleMeals,
    },
    tips,
    notes: `Pakistani localized nutrition & fitness protocol for ${memberName}. Prioritize high protein from halal sources, proper portioning, and structured training progression.`,
  };
}

// Re-export Exercise and Pakistani Food Libraries
export { EXERCISE_LIBRARY } from './exerciseLibrary';
export { PAKISTANI_FOOD_LIBRARY, getMealAlternatives, detectMealSlot } from './foodLibrary';

// Built-in General Plans for one-click viewing & printing with Pakistani diets
export { EXPANDED_GENERAL_PLANS as GENERAL_PLANS } from './generalPlansData';

