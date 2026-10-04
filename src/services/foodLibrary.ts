// ============================================================================
// IRONFORGE - Pakistani Halal Food Library
// Grouped by meal slot: Nashta (Breakfast), Lunch, Snack (Asar), Dinner (Raat)
// Includes macros, calories, goals, preference (Non-veg/Veg), and budget level.
// ============================================================================

import { LibraryFoodItem, MealTimeSlot, FitnessGoal, FoodPreference, BudgetLevel } from '../types';

export const PAKISTANI_FOOD_LIBRARY: LibraryFoodItem[] = [
  // ===================== NASHTA (BREAKFAST) =====================
  {
    id: 'food-nsh-1',
    name: 'Classic Anda & Whole Wheat Chapati',
    slot: 'Nashta',
    portion: '3 Boiled eggs (or fluffy omelette with 1 tsp oil), 1 whole wheat chapati, 1 cup chai (low sugar)',
    calories: 460,
    proteinGrams: 26,
    carbsGrams: 42,
    fatGrams: 18,
    goals: ['General Fitness', 'Bulking'],
    preference: 'Non-veg',
    budget: 'Low',
    description: 'Staple high-protein Pakistani breakfast with quality whole wheat carbs.',
  },
  {
    id: 'food-nsh-2',
    name: 'Egg Whites & Vegetable Omelette Shred',
    slot: 'Nashta',
    portion: '4 Egg whites + 1 whole egg omelette with green chillies & tomatoes, 1 thin bran roti, green tea',
    calories: 340,
    proteinGrams: 30,
    carbsGrams: 28,
    fatGrams: 8,
    goals: ['Cutting', 'General Fitness'],
    preference: 'Non-veg',
    budget: 'Medium',
    description: 'High satiety, lean protein with zero excess oil, ideal for cutting.',
  },
  {
    id: 'food-nsh-3',
    name: 'Desi Oats Daliya with Doodh & Almonds',
    slot: 'Nashta',
    portion: '1 Large bowl oats/daliya cooked in 250ml milk, 1 tsp honey, 10 soaked almonds & walnuts',
    calories: 490,
    proteinGrams: 20,
    carbsGrams: 68,
    fatGrams: 16,
    goals: ['General Fitness', 'Bulking'],
    preference: 'Vegetarian',
    budget: 'Medium',
    description: 'Sustained complex energy, rich in micronutrients and healthy fats.',
  },
  {
    id: 'food-nsh-4',
    name: 'High-Mass Double Paratha & Anda Shake',
    slot: 'Nashta',
    portion: '3 Fried eggs, 2 tawa parathas with light desi ghee, 1 glass whole milk with 2 bananas',
    calories: 780,
    proteinGrams: 35,
    carbsGrams: 90,
    fatGrams: 32,
    goals: ['Bulking'],
    preference: 'Non-veg',
    budget: 'High',
    description: 'Calorie-dense powerhouse for stubborn hardgainers building mass.',
  },
  {
    id: 'food-nsh-5',
    name: 'Besan Chilla & Low-Fat Dahi',
    slot: 'Nashta',
    portion: '2 Spiced gram flour (besan) chillas with onions & coriander, 1 bowl dahi, mint chutney',
    calories: 360,
    proteinGrams: 22,
    carbsGrams: 44,
    fatGrams: 9,
    goals: ['Cutting', 'General Fitness'],
    preference: 'Vegetarian',
    budget: 'Low',
    description: 'Vegetarian plant protein with low glycemic index.',
  },
  {
    id: 'food-nsh-6',
    name: 'Boiled Chana & Egg Whites Bowl',
    slot: 'Nashta',
    portion: '1 Bowl boiled black/white chana with lemon & chaat masala, 4 boiled egg whites, green tea',
    calories: 380,
    proteinGrams: 32,
    carbsGrams: 46,
    fatGrams: 5,
    goals: ['Cutting'],
    preference: 'Non-veg',
    budget: 'Low',
    description: 'Ultra-low fat, high-fiber desi morning fuel for fat shredding.',
  },

  // ===================== LUNCH (DOPAHAR) =====================
  {
    id: 'food-lnc-1',
    name: 'Lean Chicken Salan & Roti',
    slot: 'Lunch',
    portion: '200g Homemade chicken salan (breast/leg, controlled oil), 2 whole wheat rotis, 1 katori dahi raita, kachumber salad',
    calories: 580,
    proteinGrams: 46,
    carbsGrams: 56,
    fatGrams: 16,
    goals: ['General Fitness', 'Bulking', 'Cutting'],
    preference: 'Non-veg',
    budget: 'Medium',
    description: 'The golden standard Pakistani fitness lunch. Balanced and restorative.',
  },
  {
    id: 'food-lnc-2',
    name: 'Tandoori Tikka Boti & Boiled Basmati Rice',
    slot: 'Lunch',
    portion: '220g Grilled chicken tikka boti, 1.5 cups boiled basmati rice (chawal), fresh salad with lemon juice',
    calories: 530,
    proteinGrams: 52,
    carbsGrams: 62,
    fatGrams: 8,
    goals: ['Cutting', 'General Fitness'],
    preference: 'Non-veg',
    budget: 'Medium',
    description: 'Pure lean protein with clean carbohydrates for post-workout glycogen.',
  },
  {
    id: 'food-lnc-3',
    name: 'Daal Chana, Sabzi & 2 Rotis',
    slot: 'Lunch',
    portion: '1 Big katori daal chana (thick gravy), 1 bowl seasonal bhindi/tori, 2 whole wheat rotis, 1 katori fresh dahi',
    calories: 520,
    proteinGrams: 25,
    carbsGrams: 78,
    fatGrams: 12,
    goals: ['General Fitness', 'Cutting'],
    preference: 'Vegetarian',
    budget: 'Low',
    description: 'Economical high-fiber vegetarian meal with complete amino acid balance.',
  },
  {
    id: 'food-lnc-4',
    name: 'Beef Nihari/Qorma (Lean Cut) with 3 Rotis',
    slot: 'Lunch',
    portion: '220g Lean beef cooked in traditional spices, 3 whole wheat chapatis, ginger slivers & lemon, fresh salad',
    calories: 760,
    proteinGrams: 56,
    carbsGrams: 75,
    fatGrams: 26,
    goals: ['Bulking'],
    preference: 'Non-veg',
    budget: 'High',
    description: 'Iron and creatine-rich beef meal designed for maximal strength and muscle fullness.',
  },
  {
    id: 'food-lnc-5',
    name: 'Fish Karahi & Jeera Rice',
    slot: 'Lunch',
    portion: '200g Rahu or boneless fish salan, 1 cup jeera basmati rice, mint raita, cucumber salad',
    calories: 490,
    proteinGrams: 42,
    carbsGrams: 52,
    fatGrams: 13,
    goals: ['Cutting', 'General Fitness'],
    preference: 'Non-veg',
    budget: 'High',
    description: 'High in Omega-3 fatty acids, supports joint health and anti-inflammatory recovery.',
  },
  {
    id: 'food-lnc-6',
    name: 'Rajma / Lobia Salan with Steamed Rice',
    slot: 'Lunch',
    portion: '1 Big bowl red kidney beans (rajma) or white lobia, 1.5 cups steamed rice, dahi, green salad',
    calories: 540,
    proteinGrams: 26,
    carbsGrams: 88,
    fatGrams: 8,
    goals: ['Bulking', 'General Fitness'],
    preference: 'Vegetarian',
    budget: 'Low',
    description: 'High energy, complex carb load popular for endurance and athletic performance.',
  },

  // ===================== SNACK (ASAR / EVENING) =====================
  {
    id: 'food-snk-1',
    name: 'Boiled Chana Chaat with Lemon & Herbs',
    slot: 'Snack',
    portion: '1 Bowl boiled chickpeas with onions, green chillies, tomatoes, chaat masala & lemon juice',
    calories: 260,
    proteinGrams: 14,
    carbsGrams: 42,
    fatGrams: 4,
    goals: ['Cutting', 'General Fitness'],
    preference: 'Vegetarian',
    budget: 'Low',
    description: 'Light, crunchy, zero junk fat snack packed with sustained plant energy.',
  },
  {
    id: 'food-snk-2',
    name: 'Roasted Chana (Bhunay Chane) & Lassi',
    slot: 'Snack',
    portion: '1 Bowl roasted brown chana (50g), 1 glass cold namkeen lassi (diluted dahi with pinch of black salt)',
    calories: 270,
    proteinGrams: 18,
    carbsGrams: 36,
    fatGrams: 6,
    goals: ['Cutting', 'General Fitness'],
    preference: 'Vegetarian',
    budget: 'Low',
    description: 'The ultimate desi gym staple. Convenient, cheap, and immediately filling.',
  },
  {
    id: 'food-snk-3',
    name: 'Mass Gainer Banana & Peanut Butter Doodh Shake',
    slot: 'Snack',
    portion: '350ml Whole milk, 2 ripe bananas, 2 tbsp peanut butter, 1 tsp honey, 8 crushed almonds',
    calories: 580,
    proteinGrams: 22,
    carbsGrams: 75,
    fatGrams: 24,
    goals: ['Bulking'],
    preference: 'Vegetarian',
    budget: 'Medium',
    description: 'Instant liquid calories to make bulking effortless without stomach bloat.',
  },
  {
    id: 'food-snk-4',
    name: 'Boiled Eggs & Green Tea Boost',
    slot: 'Snack',
    portion: '3 Hard-boiled eggs (1 whole + 2 whites) with black pepper, 1 cup unsweetened green tea',
    calories: 160,
    proteinGrams: 18,
    carbsGrams: 2,
    fatGrams: 9,
    goals: ['Cutting'],
    preference: 'Non-veg',
    budget: 'Low',
    description: 'Zero carb protein infusion to suppress appetite during evening cut hours.',
  },
  {
    id: 'food-snk-5',
    name: 'Desi Sattu Drink & Peanuts',
    slot: 'Snack',
    portion: '1 Tall glass chilled barley/chana sattu drink with roasted peanuts (30g)',
    calories: 310,
    proteinGrams: 16,
    carbsGrams: 40,
    fatGrams: 10,
    goals: ['General Fitness', 'Bulking'],
    preference: 'Vegetarian',
    budget: 'Low',
    description: 'Traditional summer gut cooling beverage providing natural endurance.',
  },
  {
    id: 'food-snk-6',
    name: 'Grilled Shami Kabab on Whole Wheat Bread',
    slot: 'Snack',
    portion: '2 Homemade beef/chicken shami kababs (low oil), 2 slices whole wheat bread, mint raita',
    calories: 360,
    proteinGrams: 28,
    carbsGrams: 36,
    fatGrams: 11,
    goals: ['Bulking', 'General Fitness'],
    preference: 'Non-veg',
    budget: 'Medium',
    description: 'Delicious desi sandwich option with high bioavailable protein.',
  },

  // ===================== DINNER (RAAT) =====================
  {
    id: 'food-dnr-1',
    name: 'Chicken Breast & Seasonal Sabzi Dinner',
    slot: 'Dinner',
    portion: '200g Pan-seared or salan chicken breast, 1 bowl seasonal palak/tori/bhindi, 2 rotis, fresh salad',
    calories: 520,
    proteinGrams: 50,
    carbsGrams: 52,
    fatGrams: 12,
    goals: ['General Fitness', 'Bulking', 'Cutting'],
    preference: 'Non-veg',
    budget: 'Medium',
    description: 'Clean night-time repair meal supplying steady amino acids during sleep.',
  },
  {
    id: 'food-dnr-2',
    name: 'Steamed Fish & Green Vegetable Bowl',
    slot: 'Dinner',
    portion: '220g Steamed or lightly grilled fish fillet with zeera and lemon, 1 bowl boiled mixed veggies, 1 thin roti',
    calories: 410,
    proteinGrams: 46,
    carbsGrams: 32,
    fatGrams: 9,
    goals: ['Cutting'],
    preference: 'Non-veg',
    budget: 'High',
    description: 'Light on digestion, high in protein, helps wake up lean without water retention.',
  },
  {
    id: 'food-dnr-3',
    name: 'Daal Mash & Palak Paneer with Roti',
    slot: 'Dinner',
    portion: '1 Bowl thick daal mash, 1 small bowl homemade palak paneer, 2 whole wheat rotis, fresh cucumber salad',
    calories: 540,
    proteinGrams: 28,
    carbsGrams: 68,
    fatGrams: 18,
    goals: ['General Fitness', 'Bulking'],
    preference: 'Vegetarian',
    budget: 'Medium',
    description: 'Satisfying vegetarian dinner loaded with calcium, iron, and slow-release casein protein.',
  },
  {
    id: 'food-dnr-4',
    name: 'Mutton Chops / Salan with 3 Rotis & Night Milk',
    slot: 'Dinner',
    portion: '220g Mutton chops or curry, 3 whole wheat rotis, kachumber salad, 1 glass warm turmeric milk before bed',
    calories: 780,
    proteinGrams: 54,
    carbsGrams: 76,
    fatGrams: 28,
    goals: ['Bulking'],
    preference: 'Non-veg',
    budget: 'High',
    description: 'Deep sleep muscle recovery package with restorative golden milk.',
  },
  {
    id: 'food-dnr-5',
    name: 'Desi Chicken Yakhni Soup with Shredded Meat',
    slot: 'Dinner',
    portion: 'Large bowl homemade chicken yakhni (bone broth) with 150g shredded chicken, 1 boiled egg, 1 bran roti',
    calories: 380,
    proteinGrams: 44,
    carbsGrams: 24,
    fatGrams: 10,
    goals: ['Cutting', 'General Fitness'],
    preference: 'Non-veg',
    budget: 'Medium',
    description: 'Collagen-rich broth strengthening tendons and joints while trimming body fat.',
  },
  {
    id: 'food-dnr-6',
    name: 'Daal Moong & Sabzi with Brown / White Rice',
    slot: 'Dinner',
    portion: '1 Big bowl light daal moong with zeera tarka, 1 plate boiled rice, 1 bowl mixed sabzi, dahi',
    calories: 490,
    proteinGrams: 22,
    carbsGrams: 82,
    fatGrams: 8,
    goals: ['General Fitness', 'Cutting'],
    preference: 'Vegetarian',
    budget: 'Low',
    description: 'Easy on the digestive tract for sound, peaceful sleep.',
  },
];

// Helper: Find alternatives for swapping a single meal
export function getMealAlternatives(
  slot: MealTimeSlot,
  goal?: FitnessGoal | string,
  preference?: FoodPreference | string,
  budget?: BudgetLevel | string
): LibraryFoodItem[] {
  // 1. Strict filter
  const strict = PAKISTANI_FOOD_LIBRARY.filter((item) => {
    if (item.slot !== slot) return false;
    if (preference === 'Vegetarian' && item.preference === 'Non-veg') return false;
    if (goal && item.goals && item.goals.length > 0) {
      if (!item.goals.includes(goal as FitnessGoal)) return false;
    }
    if (budget && budget !== 'All' && item.budget !== 'All' && item.budget !== budget) {
      // Allow minor budget tolerance if needed, but prefer exact
      return true;
    }
    return true;
  });

  if (strict.length >= 3) return strict;

  // 2. Relaxed filter (match slot & preference only)
  const relaxed = PAKISTANI_FOOD_LIBRARY.filter((item) => {
    if (item.slot !== slot) return false;
    if (preference === 'Vegetarian' && item.preference === 'Non-veg') return false;
    return true;
  });

  if (relaxed.length >= 2) return relaxed;

  // 3. Fallback: all items in slot
  return PAKISTANI_FOOD_LIBRARY.filter((item) => item.slot === slot);
}

// Helper to normalize any meal label into standard MealTimeSlot
export function detectMealSlot(label: string): MealTimeSlot {
  const lower = label.toLowerCase();
  if (lower.includes('nashta') || lower.includes('breakfast') || lower.includes('morning')) return 'Nashta';
  if (lower.includes('lunch') || lower.includes('dopahar') || lower.includes('noon')) return 'Lunch';
  if (lower.includes('snack') || lower.includes('asar') || lower.includes('evening') || lower.includes('pre-workout')) return 'Snack';
  if (lower.includes('dinner') || lower.includes('raat') || lower.includes('night')) return 'Dinner';
  return 'Lunch';
}
