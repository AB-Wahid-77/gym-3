// ============================================================================
// IRONFORGE - Expanded General Plans Library
// Covers combinations of:
// - Goals: Bulking, Cutting, General Fitness
// - Levels: Beginner, Intermediate, Advanced
// - Split Lengths: 3-day, 4-day, 5-day, 6-day
// - At least 2-3 plan variants per goal + level combination
// ============================================================================

import { GeneralPlan } from '../types';

export const EXPANDED_GENERAL_PLANS: GeneralPlan[] = [
  // =========================================================================
  // 1. BULKING - BEGINNER
  // =========================================================================
  {
    id: 'bulk-beg-3day',
    title: '3-Day Mass Foundations (Full Body)',
    goal: 'Bulking',
    level: 'Beginner',
    daysPerWeek: 3,
    duration: '8-Week Program',
    calories: 2750,
    description: 'Entry-level full body program concentrating on barbell and dumbbell compound basics with 48 hours recovery between sessions.',
    schedule: [
      {
        day: 'Day 1 (Mon) - Full Body Compound A',
        focus: 'Squat & Chest Press',
        exercises: [
          { name: 'Barbell Back Squat', sets: '3', reps: '8-10', rest: '90s' },
          { name: 'Barbell Flat Bench Press', sets: '3', reps: '8-10', rest: '90s' },
          { name: 'Seated Cable Row', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Dumbbell Overhead Press', sets: '3', reps: '10', rest: '60s' },
          { name: 'Plank Hold', sets: '3', reps: '45s', rest: '45s' },
        ],
      },
      {
        day: 'Day 2 (Wed) - Full Body Compound B',
        focus: 'Hinge & Pull Focus',
        exercises: [
          { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '8-10', rest: '90s' },
          { name: 'Lat Pulldowns (Wide)', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '10', rest: '60s' },
          { name: 'Leg Press', sets: '3', reps: '10-12', rest: '75s' },
          { name: 'Barbell Bicep Curls', sets: '3', reps: '12', rest: '45s' },
        ],
      },
      {
        day: 'Day 3 (Fri) - Full Body Compound C',
        focus: 'Hypertrophy & Accessory',
        exercises: [
          { name: 'Goblet Squats', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Push-Ups (Chest Focus)', sets: '3', reps: '12-15', rest: '45s' },
          { name: 'Single-Arm Dumbbell Row', sets: '3', reps: '10 / arm', rest: '60s' },
          { name: 'Dumbbell Lateral Raises', sets: '3', reps: '15', rest: '45s' },
          { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' },
        ],
      },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '3 Boiled eggs, 2 whole wheat rotis with 1 tsp butter, 1 glass whole milk with banana', calories: 620, proteinGrams: 32 },
      { meal: 'Lunch (Dopahar)', items: '200g Chicken salan, 2 chapatis, 1 katori daal chana, cucumber salad', calories: 680, proteinGrams: 48 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl boiled chana chaat with lemon & 1 handful roasted peanuts', calories: 340, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '180g Chicken or beef curry, 2 whole wheat rotis, 1 bowl seasonal sabzi, 1 katori dahi', calories: 650, proteinGrams: 44 },
    ],
  },
  {
    id: 'bulk-beg-4day',
    title: '4-Day Desi Hypertrophy Split (Upper / Lower)',
    goal: 'Bulking',
    level: 'Beginner',
    daysPerWeek: 4,
    duration: '10-Week Program',
    calories: 2900,
    description: 'Classic Upper/Lower frequency allowing muscle groups to be trained twice weekly with ample rest days.',
    schedule: [
      {
        day: 'Day 1 (Mon) - Upper Body Foundation',
        focus: 'Chest, Back & Shoulders',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '6-8', rest: '90s' },
          { name: 'Lat Pulldowns', sets: '4', reps: '10', rest: '60s' },
          { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '8-10', rest: '60s' },
          { name: 'Cable Face Pulls', sets: '3', reps: '15', rest: '45s' },
          { name: 'Barbell Bicep Curls', sets: '3', reps: '10', rest: '45s' },
        ],
      },
      {
        day: 'Day 2 (Tue) - Lower Body Foundation',
        focus: 'Quads, Hamstrings & Calves',
        exercises: [
          { name: 'Barbell Back Squats', sets: '4', reps: '6-8', rest: '120s' },
          { name: 'Romanian Deadlifts', sets: '3', reps: '8-10', rest: '90s' },
          { name: 'Leg Press', sets: '3', reps: '10-12', rest: '75s' },
          { name: 'Lying Leg Curls', sets: '3', reps: '12', rest: '60s' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15', rest: '45s' },
        ],
      },
      {
        day: 'Day 3 (Thu) - Upper Hypertrophy',
        focus: 'Incline Press & Horizontal Pull',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: '4', reps: '8-10', rest: '75s' },
          { name: 'Seated Cable Row', sets: '4', reps: '10', rest: '60s' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '12-15', rest: '45s' },
          { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' },
          { name: 'Hammer Curls', sets: '3', reps: '12', rest: '45s' },
        ],
      },
      {
        day: 'Day 4 (Fri) - Lower & Core Hypertrophy',
        focus: 'Unilateral Legs & Stability',
        exercises: [
          { name: 'Leg Press (Heavy)', sets: '4', reps: '8-10', rest: '90s' },
          { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '60s' },
          { name: 'Lying Leg Curls', sets: '4', reps: '12', rest: '60s' },
          { name: 'Hanging Knee Raises', sets: '3', reps: '12-15', rest: '45s' },
        ],
      },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Boiled eggs, 2 whole wheat rotis, 1 glass doodh with honey and almonds', calories: 680, proteinGrams: 36 },
      { meal: 'Lunch (Dopahar)', items: '220g Chicken Karahi (controlled oil), 3 whole wheat chapatis, dahi raita, salad', calories: 750, proteinGrams: 52 },
      { meal: 'Evening Snack (Asar)', items: 'High-calorie banana doodh shake with 2 tbsp peanut butter & 10 almonds', calories: 540, proteinGrams: 20 },
      { meal: 'Dinner (Raat)', items: '200g Lean beef salan, 2 whole wheat rotis, 1 bowl seasonal sabzi, fresh salad', calories: 720, proteinGrams: 48 },
    ],
  },
  {
    id: 'bulk-beg-5day',
    title: '5-Day Muscle Starter (Push / Pull / Legs / Upper / Lower)',
    goal: 'Bulking',
    level: 'Beginner',
    daysPerWeek: 5,
    duration: '10-Week Program',
    calories: 3000,
    description: 'Transition routine introducing the popular Push/Pull/Legs cadence with an added Upper/Lower weekend rhythm for rapid size gains.',
    schedule: [
      { day: 'Day 1 (Mon) - Push Focus', focus: 'Chest, Shoulders & Triceps', exercises: [{ name: 'Flat Dumbbell Press', sets: '3', reps: '8-10', rest: '75s' }, { name: 'Overhead Dumbbell Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Pull Focus', focus: 'Back & Biceps', exercises: [{ name: 'Lat Pulldowns', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '10', rest: '60s' }, { name: 'Dumbbell Bicep Curls', sets: '3', reps: '10-12', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Legs Focus', focus: 'Quads & Hamstrings', exercises: [{ name: 'Barbell Back Squat', sets: '3', reps: '8-10', rest: '90s' }, { name: 'Leg Press', sets: '3', reps: '10-12', rest: '75s' }, { name: 'Lying Leg Curls', sets: '3', reps: '12', rest: '60s' }] },
      { day: 'Day 4 (Fri) - Upper Density', focus: 'Chest & Lats Volume', exercises: [{ name: 'Incline Dumbbell Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Barbell Bent-Over Row', sets: '3', reps: '8-10', rest: '75s' }, { name: 'Lateral Raises', sets: '4', reps: '12-15', rest: '45s' }] },
      { day: 'Day 5 (Sat) - Lower & Core', focus: 'RDLs & Calves', exercises: [{ name: 'Romanian Deadlifts', sets: '3', reps: '8-10', rest: '75s' }, { name: 'Walking Lunges', sets: '3', reps: '10 / leg', rest: '60s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '12', rest: '45s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '3 Fried eggs, 2 parathas with light desi ghee, 1 glass doodh with 2 bananas', calories: 750, proteinGrams: 34 },
      { meal: 'Lunch (Dopahar)', items: '250g Chicken breast salan, 3 rotis, 1 katori daal mash, kachumber salad', calories: 800, proteinGrams: 55 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl roasted chana, 1 tall glass sweet/namkeen lassi, 10 almonds', calories: 420, proteinGrams: 20 },
      { meal: 'Dinner (Raat)', items: '220g Beef/mutton salan, 2 whole wheat rotis, 1 bowl sabzi, warm milk at night', calories: 780, proteinGrams: 50 },
    ],
  },

  // =========================================================================
  // 2. BULKING - INTERMEDIATE
  // =========================================================================
  {
    id: 'bulk-int-4day',
    title: '4-Day Desi Powerbuilding Split',
    goal: 'Bulking',
    level: 'Intermediate',
    daysPerWeek: 4,
    duration: '12-Week Program',
    calories: 3100,
    description: 'Blends heavy compound powerlifting benchmarks with high-volume bodybuilding accessory movements for massive density.',
    schedule: [
      {
        day: 'Day 1 (Mon) - Heavy Bench & Upper Pull',
        focus: 'Chest Strength & Upper Back',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '5', rest: '120s', notes: 'Heavy strength sets' },
          { name: 'Barbell Bent-Over Row', sets: '4', reps: '6-8', rest: '90s' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '8-10', rest: '75s' },
          { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' },
          { name: 'Skull Crushers', sets: '3', reps: '10', rest: '60s' },
        ],
      },
      {
        day: 'Day 2 (Tue) - Heavy Squat & Lower Chain',
        focus: 'Quad Overload & Hamstrings',
        exercises: [
          { name: 'Barbell Back Squats', sets: '4', reps: '5', rest: '150s' },
          { name: 'Romanian Deadlifts', sets: '4', reps: '8', rest: '90s' },
          { name: 'Leg Press (Heavy)', sets: '3', reps: '10', rest: '90s' },
          { name: 'Lying Leg Curls', sets: '4', reps: '12', rest: '60s' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '45s' },
        ],
      },
      {
        day: 'Day 3 (Thu) - Overhead Press & Upper Volume',
        focus: 'Delts, Lats & Arms',
        exercises: [
          { name: 'Standing Overhead Barbell Press (OHP)', sets: '4', reps: '6', rest: '120s' },
          { name: 'Weighted Pull-Ups or Lat Pulldowns', sets: '4', reps: '6-8', rest: '90s' },
          { name: 'Dips (Chest Focus)', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' },
          { name: 'Barbell Bicep Curls', sets: '4', reps: '10', rest: '45s' },
        ],
      },
      {
        day: 'Day 4 (Fri) - Heavy Deadlift & Posterior Chain',
        focus: 'Deadlift Power & Glute Ham',
        exercises: [
          { name: 'Conventional Deadlifts', sets: '4', reps: '4-5', rest: '180s' },
          { name: 'Bulgarian Split Squats', sets: '3', reps: '8 / leg', rest: '75s' },
          { name: 'Lying Leg Curls', sets: '3', reps: '12-15', rest: '60s' },
          { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' },
        ],
      },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Boiled eggs, 2 parathas with butter, 1 glass whole milk with 2 bananas and peanut butter', calories: 820, proteinGrams: 42 },
      { meal: 'Lunch (Dopahar)', items: '250g Chicken Karahi or salan, 3 whole wheat chapatis, 1 katori dahi raita, kachumber salad', calories: 850, proteinGrams: 58 },
      { meal: 'Evening Snack (Asar)', items: '1 Big bowl boiled chana chaat with chopped onion & lemon, 1 handful roasted peanuts, green tea', calories: 420, proteinGrams: 20 },
      { meal: 'Dinner (Raat)', items: '220g Beef or mutton salan, 3 whole wheat rotis, 1 bowl daal mash, warm milk before bed', calories: 880, proteinGrams: 55 },
    ],
  },
  {
    id: 'bulk-int-5day',
    title: '5-Day Hypertrophy Specialization (PPL-UL)',
    goal: 'Bulking',
    level: 'Intermediate',
    daysPerWeek: 5,
    duration: '12-Week Program',
    calories: 3200,
    description: 'High muscle protein synthesis through a dynamic 5-day cycle balancing Push/Pull/Legs with dedicated Upper/Lower sessions.',
    schedule: [
      { day: 'Day 1 (Mon) - Push Power', focus: 'Chest & Delts', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '6-8', rest: '90s' }, { name: 'Incline Dumbbell Press', sets: '3', reps: '8-10', rest: '75s' }, { name: 'Standing Overhead Press', sets: '3', reps: '8', rest: '75s' }, { name: 'Dumbbell Lateral Raises', sets: '4', reps: '12-15', rest: '45s' }, { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Pull Power', focus: 'Lats & Rhomboids', exercises: [{ name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '90s' }, { name: 'Lat Pulldowns', sets: '4', reps: '10', rest: '60s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }, { name: 'Incline Dumbbell Bicep Curl', sets: '3', reps: '10-12', rest: '45s' }, { name: 'Hammer Curls', sets: '3', reps: '10', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Legs Quad Focus', focus: 'Squats & Quads', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '6-8', rest: '120s' }, { name: 'Leg Press', sets: '4', reps: '10', rest: '90s' }, { name: 'Lying Leg Curls', sets: '3', reps: '12', rest: '60s' }, { name: 'Standing Calf Raises', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 4 (Fri) - Upper Hypertrophy', focus: 'Volume Chest & Back', exercises: [{ name: 'Incline Dumbbell Press', sets: '4', reps: '10', rest: '75s' }, { name: 'Seated Cable Row', sets: '4', reps: '10-12', rest: '60s' }, { name: 'Dips (Chest Focus)', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 5 (Sat) - Lower Posterior', focus: 'Deadlifts & Glute Ham', exercises: [{ name: 'Romanian Deadlifts', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '60s' }, { name: 'Lying Leg Curls', sets: '4', reps: '12', rest: '60s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Boiled eggs, 2 whole wheat rotis with butter, 1 glass milk with 2 bananas and peanut butter', calories: 840, proteinGrams: 42 },
      { meal: 'Lunch (Dopahar)', items: '260g Chicken breast salan, 3 rotis, 1 katori daal chana, salad', calories: 880, proteinGrams: 62 },
      { meal: 'Evening Snack (Asar)', items: 'High-calorie banana doodh shake with 2 tbsp peanut butter & 10 almonds', calories: 550, proteinGrams: 20 },
      { meal: 'Dinner (Raat)', items: '220g Beef salan, 3 rotis, seasonal sabzi, 1 katori dahi', calories: 850, proteinGrams: 55 },
    ],
  },
  {
    id: 'bulk-int-6day',
    title: '6-Day High-Frequency Arnold Split',
    goal: 'Bulking',
    level: 'Intermediate',
    daysPerWeek: 6,
    duration: '12-Week Program',
    calories: 3300,
    description: 'Classic bodybuilding structure pairing antagonist muscle groups: Chest/Back on Mon/Thu, Shoulders/Arms on Tue/Fri, Legs on Wed/Sat.',
    schedule: [
      { day: 'Day 1 & 4 (Mon/Thu) - Chest & Back', focus: 'Antagonist Supersets', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '8', rest: '75s' }, { name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '75s' }, { name: 'Incline Dumbbell Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Lat Pulldowns', sets: '3', reps: '10', rest: '60s' }, { name: 'Cable Crossover Flyes', sets: '3', reps: '12-15', rest: '45s' }] },
      { day: 'Day 2 & 5 (Tue/Fri) - Shoulders & Arms', focus: 'Delts & Arm Density', exercises: [{ name: 'Seated Dumbbell Shoulder Press', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' }, { name: 'Barbell Bicep Curls', sets: '4', reps: '10', rest: '45s' }, { name: 'Tricep Rope Pushdowns', sets: '4', reps: '12', rest: '45s' }, { name: 'Cable Face Pulls', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 3 & 6 (Wed/Sat) - Legs & Abs', focus: 'Quads & Hamstrings', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Romanian Deadlifts', sets: '4', reps: '10', rest: '75s' }, { name: 'Leg Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Lying Leg Curls', sets: '3', reps: '12', rest: '45s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Eggs (fried or boiled), 2 whole wheat rotis, 1 glass whole milk with 2 bananas and peanut butter', calories: 860, proteinGrams: 44 },
      { meal: 'Lunch (Dopahar)', items: '260g Chicken Karahi, 3 rotis, 1 katori dahi raita, fresh kachumber salad', calories: 900, proteinGrams: 64 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl chana chaat, 1 glass milk shake with 8 almonds', calories: 520, proteinGrams: 22 },
      { meal: 'Dinner (Raat)', items: '220g Beef/mutton curry, 3 whole wheat rotis, 1 bowl sabzi, warm milk before bed', calories: 920, proteinGrams: 58 },
    ],
  },

  // =========================================================================
  // 3. BULKING - ADVANCED
  // =========================================================================
  {
    id: 'bulk-adv-5day',
    title: '5-Day Classic Bro-Split Heavy Mass',
    goal: 'Bulking',
    level: 'Advanced',
    daysPerWeek: 5,
    duration: '12-Week Program',
    calories: 3400,
    description: 'Maximum single-session volume per muscle group (Chest, Back, Shoulders, Legs, Arms) enabling extreme intensity and complete exhaustion.',
    schedule: [
      { day: 'Day 1 (Mon) - Chest Devastation', focus: 'Flat, Incline & Dip Volume', exercises: [{ name: 'Barbell Flat Bench Press', sets: '5', reps: '5-6', rest: '120s' }, { name: 'Incline Dumbbell Press', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Dips (Chest Focus)', sets: '4', reps: '10-12', rest: '60s' }, { name: 'Cable Crossover Flyes', sets: '4', reps: '15', rest: '45s' }, { name: 'Push-Ups to Failure', sets: '2', reps: 'Max', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Back Width & Thickness', focus: 'Deadlift & Rows', exercises: [{ name: 'Conventional Deadlifts', sets: '4', reps: '5', rest: '180s' }, { name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '90s' }, { name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Single-Arm Dumbbell Row', sets: '3', reps: '10', rest: '60s' }, { name: 'Lat Pulldowns', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Boulder Shoulders & Traps', focus: 'Overhead & Lateral Heads', exercises: [{ name: 'Standing Overhead Barbell Press', sets: '4', reps: '6-8', rest: '120s' }, { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '8-10', rest: '75s' }, { name: 'Dumbbell Lateral Raises', sets: '5', reps: '15', rest: '45s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 4 (Fri) - Leg Annihilation', focus: 'Squats, RDLs & Calves', exercises: [{ name: 'Barbell Back Squats', sets: '5', reps: '6-8', rest: '150s' }, { name: 'Romanian Deadlifts', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Leg Press (Heavy)', sets: '4', reps: '10-12', rest: '90s' }, { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '75s' }, { name: 'Standing Calf Raises', sets: '5', reps: '20', rest: '45s' }] },
      { day: 'Day 5 (Sat) - Arms Armageddon', focus: 'Biceps & Triceps Supersets', exercises: [{ name: 'Barbell Bicep Curls', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Skull Crushers', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Incline Dumbbell Bicep Curl', sets: '4', reps: '10-12', rest: '45s' }, { name: 'Tricep Rope Pushdowns', sets: '4', reps: '12-15', rest: '45s' }, { name: 'Hammer Curls', sets: '3', reps: '12', rest: '45s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '5 Boiled eggs, 2 whole wheat rotis with desi butter, 1 glass whole milk with 2 bananas and peanut butter', calories: 920, proteinGrams: 48 },
      { meal: 'Lunch (Dopahar)', items: '280g Chicken Karahi, 3 whole wheat chapatis, 1 katori dahi raita, kachumber salad', calories: 960, proteinGrams: 68 },
      { meal: 'Evening Snack (Asar)', items: 'High-calorie banana doodh shake with 2 tbsp peanut butter & 12 almonds', calories: 580, proteinGrams: 22 },
      { meal: 'Dinner (Raat)', items: '250g Beef/mutton salan, 3 whole wheat rotis, 1 bowl seasonal sabzi, warm milk before bed', calories: 940, proteinGrams: 62 },
    ],
  },
  {
    id: 'bulk-adv-6day',
    title: '6-Day PPL Hypertrophy Specialization (Push A/B, Pull A/B, Legs A/B)',
    goal: 'Bulking',
    level: 'Advanced',
    daysPerWeek: 6,
    duration: '12-Week Program',
    calories: 3500,
    description: 'Elite competitive split utilizing A/B variations to hit every angle of the chest, back, shoulders, and legs with zero recovery bottleneck.',
    schedule: [
      { day: 'Day 1 (Mon) - Push A', focus: 'Barbell Bench & Incline Focus', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '6', rest: '90s' }, { name: 'Incline Dumbbell Press', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' }, { name: 'Tricep Rope Pushdowns', sets: '4', reps: '12', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Pull A', focus: 'Deadlifts & Width', exercises: [{ name: 'Conventional Deadlifts', sets: '4', reps: '5', rest: '150s' }, { name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Seated Cable Row', sets: '3', reps: '10', rest: '60s' }, { name: 'Barbell Bicep Curls', sets: '4', reps: '10', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Legs A', focus: 'Squat Heavy', exercises: [{ name: 'Barbell Back Squats', sets: '5', reps: '6-8', rest: '120s' }, { name: 'Leg Press', sets: '4', reps: '10', rest: '90s' }, { name: 'Lying Leg Curls', sets: '4', reps: '12', rest: '60s' }, { name: 'Standing Calf Raises', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 4 (Thu) - Push B', focus: 'Overhead & Pec Density', exercises: [{ name: 'Standing Overhead Barbell Press', sets: '4', reps: '6', rest: '90s' }, { name: 'Dips (Chest Focus)', sets: '4', reps: '10-12', rest: '60s' }, { name: 'Cable Crossover Flyes', sets: '4', reps: '12-15', rest: '45s' }, { name: 'Skull Crushers', sets: '4', reps: '10', rest: '60s' }] },
      { day: 'Day 5 (Fri) - Pull B', focus: 'Rowing Thickness', exercises: [{ name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '90s' }, { name: 'Lat Pulldowns', sets: '4', reps: '10', rest: '60s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }, { name: 'Incline Dumbbell Bicep Curl', sets: '4', reps: '10', rest: '45s' }] },
      { day: 'Day 6 (Sat) - Legs B', focus: 'RDLs & Hamstrings', exercises: [{ name: 'Romanian Deadlifts', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '60s' }, { name: 'Lying Leg Curls', sets: '4', reps: '15', rest: '45s' }, { name: 'Hanging Leg Raises', sets: '4', reps: '15', rest: '45s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '5 Boiled eggs, 2 parathas with butter, 1 glass milk with 2 bananas and peanut butter', calories: 950, proteinGrams: 50 },
      { meal: 'Lunch (Dopahar)', items: '280g Chicken Karahi, 3 rotis, 1 katori daal mash, kachumber salad', calories: 980, proteinGrams: 70 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl chana chaat with peanuts, 1 tall glass doodh shake', calories: 600, proteinGrams: 24 },
      { meal: 'Dinner (Raat)', items: '250g Beef/mutton salan, 3 rotis, seasonal sabzi, warm milk before bed', calories: 970, proteinGrams: 64 },
    ],
  },

  // =========================================================================
  // 4. CUTTING - BEGINNER
  // =========================================================================
  {
    id: 'cut-beg-3day',
    title: '3-Day Full Body Fat Shredder',
    goal: 'Cutting',
    level: 'Beginner',
    daysPerWeek: 3,
    duration: '8-Week Program',
    calories: 1900,
    description: 'Accessible full-body deficit protocol prioritizing muscle retention, brisk rest periods, and simple whole foods.',
    schedule: [
      { day: 'Day 1 (Mon) - Full Body Circuit A', focus: 'Squats & Upper Push', exercises: [{ name: 'Barbell Back Squat', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Barbell Flat Bench Press', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '45s' }, { name: 'Incline Treadmill Power Walk', sets: '1', reps: '15 mins', rest: '0s' }] },
      { day: 'Day 2 (Wed) - Full Body Circuit B', focus: 'RDLs & Upper Pull', exercises: [{ name: 'Romanian Deadlifts', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Lat Pulldowns', sets: '3', reps: '12', rest: '45s' }, { name: 'Overhead Dumbbell Press', sets: '3', reps: '10-12', rest: '45s' }, { name: 'Stationary Air Bike Intervals', sets: '6', reps: '20s on / 40s off', rest: '40s' }] },
      { day: 'Day 3 (Fri) - Full Body Circuit C', focus: 'Leg Press & Core', exercises: [{ name: 'Leg Press', sets: '3', reps: '12-15', rest: '60s' }, { name: 'Push-Ups (Chest Focus)', sets: '3', reps: '12-15', rest: '45s' }, { name: 'Plank Hold', sets: '3', reps: '45s', rest: '45s' }, { name: 'Incline Treadmill Power Walk', sets: '1', reps: '15 mins', rest: '0s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Egg whites + 1 whole egg anda omelette with green chillies & tomatoes (minimal oil), 1 whole wheat chapati, green tea', calories: 340, proteinGrams: 30 },
      { meal: 'Lunch (Dopahar)', items: '180g Boiled or lightly grilled chicken breast with zeera & black pepper, 1 katori daal masoor, 1 thin chapati, large cucumber salad', calories: 480, proteinGrams: 46 },
      { meal: 'Evening Snack (Asar)', items: '1 Cup roasted chana (bhunay chane), 1 glass unsweetened namkeen lassi', calories: 240, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '180g Steamed fish or grilled chicken breast, 1 bowl seasonal sabzi with minimal oil, 1 small chapati, fresh salad', calories: 440, proteinGrams: 42 },
    ],
  },
  {
    id: 'cut-beg-4day',
    title: '4-Day Upper / Lower Cardio & Conditioning',
    goal: 'Cutting',
    level: 'Beginner',
    daysPerWeek: 4,
    duration: '8-Week Program',
    calories: 2000,
    description: 'Combines upper and lower resistance exercises with steady-state incline walking to accelerate caloric burn without fatigue.',
    schedule: [
      { day: 'Day 1 (Mon) - Upper Resistance', focus: 'Chest, Back & Cardio', exercises: [{ name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Lat Pulldowns', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '10', rest: '45s' }, { name: 'Incline Treadmill Power Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
      { day: 'Day 2 (Tue) - Lower Resistance', focus: 'Quads, Calves & Core', exercises: [{ name: 'Barbell Back Squat', sets: '3', reps: '10', rest: '75s' }, { name: 'Romanian Deadlifts', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Lying Leg Curls', sets: '3', reps: '15', rest: '45s' }, { name: 'Hanging Knee Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 3 (Thu) - Upper Hypertrophy', focus: 'Cable Work & Arms', exercises: [{ name: 'Barbell Flat Bench Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '45s' }, { name: 'Lateral Raises', sets: '4', reps: '15', rest: '45s' }, { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 4 (Fri) - Lower Conditioning', focus: 'Leg Press & Intervals', exercises: [{ name: 'Leg Press', sets: '4', reps: '12', rest: '60s' }, { name: 'Walking Lunges', sets: '3', reps: '12 / leg', rest: '60s' }, { name: 'Stationary Air Bike Intervals', sets: '8', reps: '20s on / 40s off', rest: '40s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Egg whites + 1 whole egg anda omelette with tomatoes, 1 whole wheat chapati, green tea', calories: 360, proteinGrams: 32 },
      { meal: 'Lunch (Dopahar)', items: '200g Chicken breast salan (light gravy), 1.5 cups boiled basmati rice, kachumber salad with lemon', calories: 520, proteinGrams: 48 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl boiled chana chaat with lemon juice and chaat masala', calories: 240, proteinGrams: 14 },
      { meal: 'Dinner (Raat)', items: '180g Grilled chicken breast, 1 bowl seasonal palak/sabzi, 1 small chapati, fresh green salad', calories: 460, proteinGrams: 44 },
    ],
  },
  {
    id: 'cut-beg-5day',
    title: '5-Day Fast-Paced Circuit & Resistance Split',
    goal: 'Cutting',
    level: 'Beginner',
    daysPerWeek: 5,
    duration: '8-Week Program',
    calories: 2050,
    description: 'Dynamic 5-day cycle using supersets and moderate resistance to maintain workout tempo and optimize fat loss.',
    schedule: [
      { day: 'Day 1 (Mon) - Push Focus', focus: 'Chest & Delts', exercises: [{ name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', rest: '45s' }, { name: 'Overhead Dumbbell Press', sets: '3', reps: '12', rest: '45s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '15 mins', rest: '0s' }] },
      { day: 'Day 2 (Tue) - Pull Focus', focus: 'Back & Core', exercises: [{ name: 'Lat Pulldowns', sets: '4', reps: '10-12', rest: '45s' }, { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '45s' }, { name: 'Plank Hold', sets: '3', reps: '45s', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Legs Quad Focus', focus: 'Squats & Calves', exercises: [{ name: 'Leg Press', sets: '4', reps: '12', rest: '60s' }, { name: 'Lying Leg Curls', sets: '3', reps: '15', rest: '45s' }, { name: 'Standing Calf Raises', sets: '4', reps: '20', rest: '30s' }] },
      { day: 'Day 4 (Fri) - Upper Body Circuit', focus: 'Arms & Shoulders', exercises: [{ name: 'Dips (Chest Focus)', sets: '3', reps: '10', rest: '45s' }, { name: 'Lateral Raises', sets: '4', reps: '15', rest: '30s' }, { name: 'Hammer Curls', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 5 (Sat) - Posterior Chain & Cardio', focus: 'RDLs & Sprints', exercises: [{ name: 'Romanian Deadlifts', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Walking Lunges', sets: '3', reps: '12 / leg', rest: '45s' }, { name: 'Stationary Air Bike', sets: '8', reps: '20s on / 40s off', rest: '40s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Boiled egg whites, 1 whole egg, 1 bran roti, 1 cup green tea', calories: 350, proteinGrams: 32 },
      { meal: 'Lunch (Dopahar)', items: '200g Boiled chicken breast with zeera, 1 cup boiled rice, 1 katori daal masoor, salad', calories: 530, proteinGrams: 50 },
      { meal: 'Evening Snack (Asar)', items: '1 Cup roasted chana, 1 glass namkeen lassi', calories: 250, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '180g Fish fillet or chicken salan, 1 bowl seasonal sabzi, 1 small chapati', calories: 470, proteinGrams: 42 },
    ],
  },

  // =========================================================================
  // 5. CUTTING - INTERMEDIATE
  // =========================================================================
  {
    id: 'cut-int-4day',
    title: '4-Day High-Intensity Upper / Lower Cut',
    goal: 'Cutting',
    level: 'Intermediate',
    daysPerWeek: 4,
    duration: '8-Week Program',
    calories: 2100,
    description: 'Heavy compound baseline with secondary pump and conditioning supersets to protect hard-earned muscle tissue during a caloric cut.',
    schedule: [
      {
        day: 'Day 1 (Mon) - Upper Strength & Incline Cardio',
        focus: 'Chest & Back Density',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '6-8', rest: '75s' },
          { name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '75s' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '10', rest: '60s' },
          { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' },
          { name: 'Incline Treadmill Power Walk', sets: '1', reps: '20 mins', rest: '0s' },
        ],
      },
      {
        day: 'Day 2 (Tue) - Lower Strength & Core',
        focus: 'Quads & Hamstrings',
        exercises: [
          { name: 'Barbell Back Squats', sets: '4', reps: '6-8', rest: '90s' },
          { name: 'Romanian Deadlifts', sets: '4', reps: '8-10', rest: '75s' },
          { name: 'Leg Press', sets: '3', reps: '12', rest: '60s' },
          { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' },
        ],
      },
      {
        day: 'Day 3 (Thu) - Upper Hypertrophy & Arms',
        focus: 'Shoulders, Lats & Arms',
        exercises: [
          { name: 'Standing Overhead Barbell Press', sets: '3', reps: '8', rest: '75s' },
          { name: 'Lat Pulldowns', sets: '4', reps: '10-12', rest: '60s' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' },
          { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' },
          { name: 'Hammer Curls', sets: '3', reps: '12', rest: '45s' },
        ],
      },
      {
        day: 'Day 4 (Fri) - Lower Conditioning & Intervals',
        focus: 'Posterior & High Output',
        exercises: [
          { name: 'Conventional Deadlifts', sets: '3', reps: '5', rest: '120s' },
          { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '60s' },
          { name: 'Lying Leg Curls', sets: '3', reps: '12-15', rest: '45s' },
          { name: 'Stationary Air Bike Intervals', sets: '8', reps: '30s on / 30s off', rest: '30s' },
        ],
      },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Egg whites + 1 whole egg omelette with green chillies, 1 whole wheat chapati, green tea', calories: 370, proteinGrams: 34 },
      { meal: 'Lunch (Dopahar)', items: '220g Chicken tikka boti, 1 cup boiled rice, 1 katori daal masoor, large cucumber salad', calories: 550, proteinGrams: 54 },
      { meal: 'Evening Snack (Asar)', items: '1 Cup roasted chana, 1 glass namkeen lassi or green tea', calories: 250, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '200g Steamed fish or chicken breast, 1 bowl seasonal sabzi, 1 small chapati, salad', calories: 480, proteinGrams: 46 },
    ],
  },
  {
    id: 'cut-int-5day',
    title: '5-Day Push / Pull / Legs + Incline Treadmill Walk',
    goal: 'Cutting',
    level: 'Intermediate',
    daysPerWeek: 5,
    duration: '8-Week Program',
    calories: 2150,
    description: 'The definitive physique refinement split: high weekly frequency with daily post-lifting low-intensity steady-state cardio.',
    schedule: [
      { day: 'Day 1 (Mon) - Push Focus & Walk', focus: 'Chest & Shoulders', exercises: [{ name: 'Incline Dumbbell Press', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Lateral Raises', sets: '4', reps: '15', rest: '45s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
      { day: 'Day 2 (Tue) - Pull Focus & Abs', focus: 'Back & Biceps', exercises: [{ name: 'Weighted Pull-Ups or Lat Pulldowns', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '10-12', rest: '60s' }, { name: 'Hammer Curls', sets: '3', reps: '12', rest: '45s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Legs Quad Focus', focus: 'Squats & Calves', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Leg Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '45s' }] },
      { day: 'Day 4 (Fri) - Push & Upper Pull', focus: 'Bench & Rows', exercises: [{ name: 'Barbell Flat Bench Press', sets: '3', reps: '8-10', rest: '60s' }, { name: 'Barbell Bent-Over Row', sets: '3', reps: '8-10', rest: '60s' }, { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
      { day: 'Day 5 (Sat) - Legs Posterior & Sprints', focus: 'RDLs & Conditioning', exercises: [{ name: 'Romanian Deadlifts', sets: '4', reps: '10', rest: '75s' }, { name: 'Lying Leg Curls', sets: '3', reps: '12-15', rest: '45s' }, { name: 'Stationary Air Bike', sets: '8', reps: '20s on / 40s off', rest: '40s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Egg whites + 1 whole egg omelette, 1 thin bran roti, green tea', calories: 360, proteinGrams: 32 },
      { meal: 'Lunch (Dopahar)', items: '220g Grilled chicken breast, 1.5 cups boiled basmati rice, kachumber salad', calories: 540, proteinGrams: 52 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl boiled chana chaat with lemon juice', calories: 250, proteinGrams: 14 },
      { meal: 'Dinner (Raat)', items: '200g Steamed fish or chicken breast, 1 bowl seasonal sabzi, 1 small chapati', calories: 480, proteinGrams: 46 },
    ],
  },
  {
    id: 'cut-int-6day',
    title: '6-Day Athletic Shred & Core Split',
    goal: 'Cutting',
    level: 'Intermediate',
    daysPerWeek: 6,
    duration: '8-Week Program',
    calories: 2200,
    description: 'High workload training regimen built for fighters and serious gym members maintaining sharp reflex, core rigidity, and low body fat.',
    schedule: [
      { day: 'Day 1 & 4 (Mon/Thu) - Push & Core', focus: 'Chest, Delts & Abs', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Incline Dumbbell Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 2 & 5 (Tue/Fri) - Pull & Biceps', focus: 'Back Width & Thickness', exercises: [{ name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Barbell Bent-Over Row', sets: '3', reps: '10', rest: '60s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }, { name: 'Barbell Bicep Curls', sets: '3', reps: '10', rest: '45s' }] },
      { day: 'Day 3 & 6 (Wed/Sat) - Legs & Conditioning', focus: 'Lower Power & Sprints', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Romanian Deadlifts', sets: '3', reps: '10', rest: '60s' }, { name: 'Walking Lunges', sets: '3', reps: '12 / leg', rest: '60s' }, { name: 'Stationary Air Bike', sets: '8', reps: '20s sprint / 40s rest', rest: '40s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Egg whites + 1 whole egg omelette, 1 whole wheat chapati, green tea', calories: 370, proteinGrams: 34 },
      { meal: 'Lunch (Dopahar)', items: '240g Chicken breast salan, 1 cup boiled rice, 1 katori daal, salad', calories: 560, proteinGrams: 56 },
      { meal: 'Evening Snack (Asar)', items: '1 Cup roasted chana, 1 glass namkeen lassi', calories: 250, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '200g Steamed fish or lean beef salan, 1 bowl seasonal sabzi, 1 small chapati', calories: 500, proteinGrams: 48 },
    ],
  },

  // =========================================================================
  // 6. CUTTING - ADVANCED
  // =========================================================================
  {
    id: 'cut-adv-5day',
    title: '5-Day Bodybuilding Contest Prep Density Split',
    goal: 'Cutting',
    level: 'Advanced',
    daysPerWeek: 5,
    duration: '8-Week Program',
    calories: 1950,
    description: 'Strict muscle isolation protocol designed to preserve muscular roundness while achieving deeply defined striations.',
    schedule: [
      { day: 'Day 1 (Mon) - Chest & Abs Peak Definition', focus: 'Incline Press & Cables', exercises: [{ name: 'Incline Dumbbell Press', sets: '4', reps: '10-12', rest: '60s' }, { name: 'Dips (Chest Focus)', sets: '4', reps: '12', rest: '45s' }, { name: 'Cable Crossover Flyes', sets: '4', reps: '15-20', rest: '30s' }, { name: 'Hanging Leg Raises', sets: '4', reps: '15', rest: '45s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '25 mins', rest: '0s' }] },
      { day: 'Day 2 (Tue) - Back Depth & Width', focus: 'Deadlifts & Pulldowns', exercises: [{ name: 'Conventional Deadlifts', sets: '4', reps: '5', rest: '120s' }, { name: 'Weighted Pull-Ups', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Seated Cable Row', sets: '4', reps: '12', rest: '45s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15-20', rest: '30s' }] },
      { day: 'Day 3 (Wed) - Deltoid Striation Protocol', focus: 'Lateral & Rear Delts', exercises: [{ name: 'Standing Overhead Barbell Press', sets: '4', reps: '8', rest: '75s' }, { name: 'Dumbbell Lateral Raises (Drop Sets)', sets: '5', reps: '15', rest: '30s' }, { name: 'Reverse Pec Deck / Rear Delt Flye', sets: '4', reps: '15', rest: '30s' }] },
      { day: 'Day 4 (Fri) - Quad & Hamstring Separation', focus: 'Squats & Unilateral Leg Work', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Romanian Deadlifts', sets: '4', reps: '10-12', rest: '60s' }, { name: 'Bulgarian Split Squats', sets: '3', reps: '12 / leg', rest: '60s' }, { name: 'Lying Leg Curls', sets: '4', reps: '15', rest: '45s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '25 mins', rest: '0s' }] },
      { day: 'Day 5 (Sat) - Arms & Calves Vascularity', focus: 'Biceps & Triceps Supersets', exercises: [{ name: 'Barbell Bicep Curls', sets: '4', reps: '10-12', rest: '45s' }, { name: 'Skull Crushers', sets: '4', reps: '10-12', rest: '45s' }, { name: 'Hammer Curls', sets: '3', reps: '12', rest: '30s' }, { name: 'Tricep Rope Pushdowns', sets: '4', reps: '15', rest: '30s' }, { name: 'Standing Calf Raises', sets: '5', reps: '20', rest: '30s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '5 Egg whites + 1 whole egg omelette with green chillies & tomatoes, 1 thin bran roti, black coffee/green tea', calories: 350, proteinGrams: 36 },
      { meal: 'Lunch (Dopahar)', items: '220g Boiled or lightly grilled chicken breast with black pepper, 1 cup boiled rice, large cucumber salad', calories: 510, proteinGrams: 54 },
      { meal: 'Evening Snack (Asar)', items: '3 Boiled egg whites, 1 cup unsweetened green tea', calories: 120, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '220g Steamed fish fillet, 1 bowl steamed vegetables (palak/bhindi), 1 small bran roti', calories: 460, proteinGrams: 48 },
    ],
  },
  {
    id: 'cut-adv-6day',
    title: '6-Day PPL High Volume Vascularity Split',
    goal: 'Cutting',
    level: 'Advanced',
    daysPerWeek: 6,
    duration: '8-Week Program',
    calories: 2000,
    description: 'High frequency, low rest interval workout maximizing the metabolic afterburn effect and vascular conditioning.',
    schedule: [
      { day: 'Day 1 (Mon) - Push A', focus: 'Chest & Shoulders', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '8', rest: '60s' }, { name: 'Incline Dumbbell Press', sets: '4', reps: '10', rest: '60s' }, { name: 'Lateral Raises', sets: '4', reps: '15', rest: '30s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
      { day: 'Day 2 (Tue) - Pull A', focus: 'Back & Biceps', exercises: [{ name: 'Conventional Deadlifts', sets: '3', reps: '5', rest: '120s' }, { name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '45s' }, { name: 'Hammer Curls', sets: '3', reps: '12', rest: '30s' }] },
      { day: 'Day 3 (Wed) - Legs A', focus: 'Squats & Calves', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Leg Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Standing Calf Raises', sets: '4', reps: '20', rest: '30s' }] },
      { day: 'Day 4 (Thu) - Push B', focus: 'Overhead & Triceps', exercises: [{ name: 'Standing Overhead Barbell Press', sets: '4', reps: '8', rest: '60s' }, { name: 'Dips (Chest Focus)', sets: '4', reps: '12', rest: '45s' }, { name: 'Tricep Rope Pushdowns', sets: '4', reps: '15', rest: '30s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
      { day: 'Day 5 (Fri) - Pull B', focus: 'Rowing Thickness', exercises: [{ name: 'Barbell Bent-Over Row', sets: '4', reps: '10', rest: '60s' }, { name: 'Lat Pulldowns', sets: '4', reps: '12', rest: '45s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '30s' }, { name: 'Barbell Bicep Curls', sets: '3', reps: '10', rest: '30s' }] },
      { day: 'Day 6 (Sat) - Legs B', focus: 'RDLs & Hamstrings', exercises: [{ name: 'Romanian Deadlifts', sets: '4', reps: '10', rest: '60s' }, { name: 'Bulgarian Split Squats', sets: '3', reps: '12 / leg', rest: '45s' }, { name: 'Lying Leg Curls', sets: '4', reps: '15', rest: '30s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Boiled egg whites + 1 whole egg, 1 whole wheat chapati, green tea', calories: 350, proteinGrams: 32 },
      { meal: 'Lunch (Dopahar)', items: '220g Chicken breast salan, 1 cup boiled rice, 1 katori daal masoor, salad', calories: 520, proteinGrams: 52 },
      { meal: 'Evening Snack (Asar)', items: '1 Cup roasted chana, 1 glass namkeen lassi', calories: 240, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '200g Steamed fish or lean beef salan, 1 bowl seasonal sabzi, 1 small chapati', calories: 480, proteinGrams: 46 },
    ],
  },

  // =========================================================================
  // 7. GENERAL FITNESS - BEGINNER
  // =========================================================================
  {
    id: 'gen-beg-3day',
    title: '3-Day Functional Full Body & Mobility',
    goal: 'General Fitness',
    level: 'Beginner',
    daysPerWeek: 3,
    duration: 'Ongoing Baseline',
    calories: 2250,
    description: 'Balanced compound resistance training, hip and shoulder mobility, and light cardiovascular aerobic conditioning.',
    schedule: [
      { day: 'Day 1 (Mon) - Full Body Foundations', focus: 'Squats & Horizontal Push', exercises: [{ name: 'Barbell Back Squats', sets: '3', reps: '10', rest: '60s' }, { name: 'Barbell Flat Bench Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '10-12', rest: '45s' }, { name: 'Plank Hold', sets: '3', reps: '45s', rest: '45s' }] },
      { day: 'Day 2 (Wed) - Functional Hinge & Delts', focus: 'RDLs & Overhead Press', exercises: [{ name: 'Romanian Deadlifts', sets: '3', reps: '10', rest: '60s' }, { name: 'Overhead Dumbbell Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Lat Pulldowns', sets: '3', reps: '12', rest: '45s' }, { name: 'Dumbbell Lateral Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 3 (Fri) - Mobility & Aerobics', focus: 'Leg Press & Cardio', exercises: [{ name: 'Leg Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Push-Ups (Chest Focus)', sets: '3', reps: '12-15', rest: '45s' }, { name: 'Cable Face Pulls', sets: '3', reps: '15', rest: '45s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '2 Boiled eggs, 1 whole wheat chapati, 1 glass fresh milk (doodh), 1 apple', calories: 460, proteinGrams: 24 },
      { meal: 'Lunch (Dopahar)', items: '200g Homemade chicken salan, 2 rotis, 1 katori daal chana, kachumber salad', calories: 580, proteinGrams: 45 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl chana chaat with lemon juice and 1 cup green tea', calories: 260, proteinGrams: 14 },
      { meal: 'Dinner (Raat)', items: '180g Chicken or lean beef salan, 2 whole wheat rotis, 1 bowl seasonal sabzi, 1 katori dahi', calories: 550, proteinGrams: 42 },
    ],
  },
  {
    id: 'gen-beg-4day',
    title: '4-Day Health, Posture & Stamina Split',
    goal: 'General Fitness',
    level: 'Beginner',
    daysPerWeek: 4,
    duration: 'Ongoing Baseline',
    calories: 2300,
    description: 'Counteracts sedentary desk posture by fortifying the posterior chain, opening the chest, and improving daily energy.',
    schedule: [
      { day: 'Day 1 (Mon) - Upper Posture', focus: 'Chest & Back Alignment', exercises: [{ name: 'Barbell Flat Bench Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Lat Pulldowns', sets: '3', reps: '12', rest: '60s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }, { name: 'Push-Ups', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Lower Health', focus: 'Squats & Glutes', exercises: [{ name: 'Barbell Back Squats', sets: '3', reps: '10', rest: '75s' }, { name: 'Romanian Deadlifts', sets: '3', reps: '10', rest: '60s' }, { name: 'Walking Lunges', sets: '3', reps: '10 / leg', rest: '60s' }, { name: 'Standing Calf Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 3 (Thu) - Upper Conditioning', focus: 'Shoulders & Rows', exercises: [{ name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '60s' }, { name: 'Dumbbell Lateral Raises', sets: '3', reps: '15', rest: '45s' }, { name: 'Plank Hold', sets: '3', reps: '45s', rest: '45s' }] },
      { day: 'Day 4 (Fri) - Lower & Cardio', focus: 'Leg Press & Aerobics', exercises: [{ name: 'Leg Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Lying Leg Curls', sets: '3', reps: '12', rest: '45s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '2 Boiled eggs, 1 whole wheat chapati, 1 glass fresh milk, 1 seasonal fruit', calories: 480, proteinGrams: 25 },
      { meal: 'Lunch (Dopahar)', items: '200g Chicken salan, 2 rotis, 1 katori daal, fresh salad', calories: 590, proteinGrams: 46 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl boiled chana chaat with lemon juice, green tea', calories: 260, proteinGrams: 14 },
      { meal: 'Dinner (Raat)', items: '180g Chicken or fish salan, 2 rotis, 1 bowl seasonal sabzi, 1 katori dahi', calories: 560, proteinGrams: 43 },
    ],
  },

  // =========================================================================
  // 8. GENERAL FITNESS - INTERMEDIATE
  // =========================================================================
  {
    id: 'gen-int-4day',
    title: '4-Day Athletic Conditioning & Core Strength',
    goal: 'General Fitness',
    level: 'Intermediate',
    daysPerWeek: 4,
    duration: 'Ongoing Baseline',
    calories: 2400,
    description: 'Integrates multi-joint barbell lifts with agility and core rotations for robust overall athletic performance.',
    schedule: [
      { day: 'Day 1 (Mon) - Upper Athletic', focus: 'Press & Pull Power', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '8', rest: '75s' }, { name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '75s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }, { name: 'Barbell Bicep Curls', sets: '3', reps: '10', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Lower Athletic', focus: 'Squat & Posterior', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8', rest: '90s' }, { name: 'Romanian Deadlifts', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '60s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 3 (Thu) - Upper Hypertrophy', focus: 'Delts & Lats', exercises: [{ name: 'Standing Overhead Barbell Press', sets: '4', reps: '8', rest: '75s' }, { name: 'Lat Pulldowns', sets: '4', reps: '10-12', rest: '60s' }, { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' }, { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 4 (Fri) - Conditioning & Speed', focus: 'Deadlifts & Intervals', exercises: [{ name: 'Conventional Deadlifts', sets: '3', reps: '5', rest: '120s' }, { name: 'Leg Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Stationary Air Bike', sets: '8', reps: '20s on / 40s off', rest: '40s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '3 Boiled eggs, 1 whole wheat chapati, 1 glass milk with 1 banana', calories: 520, proteinGrams: 28 },
      { meal: 'Lunch (Dopahar)', items: '220g Chicken Karahi (controlled oil), 2 whole wheat rotis, 1 katori daal chana, kachumber salad', calories: 640, proteinGrams: 50 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl chana chaat, 1 handful roasted peanuts, green tea', calories: 300, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '200g Lean beef or chicken salan, 2 whole wheat rotis, 1 bowl seasonal sabzi, 1 katori dahi', calories: 600, proteinGrams: 46 },
    ],
  },
  {
    id: 'gen-int-5day',
    title: '5-Day Hybrid Strength & Cardio Endurance',
    goal: 'General Fitness',
    level: 'Intermediate',
    daysPerWeek: 5,
    duration: 'Ongoing Baseline',
    calories: 2450,
    description: 'Blends hypertrophy-focused gym days with cardiovascular resilience, keeping you strong, lean, and athletic year-round.',
    schedule: [
      { day: 'Day 1 (Mon) - Push Focus', focus: 'Chest & Shoulders', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '8', rest: '75s' }, { name: 'Incline Dumbbell Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Lateral Raises', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Pull Focus', focus: 'Back & Core', exercises: [{ name: 'Lat Pulldowns', sets: '4', reps: '10', rest: '60s' }, { name: 'Seated Cable Row', sets: '4', reps: '10', rest: '60s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Lower Body', focus: 'Squats & Calves', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Leg Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Standing Calf Raises', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 4 (Fri) - Upper Body Volume', focus: 'Arms & Shoulders', exercises: [{ name: 'Standing Overhead Press', sets: '3', reps: '8', rest: '60s' }, { name: 'Barbell Bicep Curls', sets: '3', reps: '10', rest: '45s' }, { name: 'Tricep Pushdowns', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 5 (Sat) - Posterior Chain & Cardio', focus: 'RDLs & Aerobics', exercises: [{ name: 'Romanian Deadlifts', sets: '3', reps: '10', rest: '75s' }, { name: 'Walking Lunges', sets: '3', reps: '10 / leg', rest: '60s' }, { name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '3 Boiled eggs, 1 chapati, 1 glass doodh, 1 apple', calories: 530, proteinGrams: 28 },
      { meal: 'Lunch (Dopahar)', items: '220g Chicken salan, 2 chapatis, 1 katori daal, salad', calories: 650, proteinGrams: 50 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl chana chaat with lemon juice', calories: 280, proteinGrams: 14 },
      { meal: 'Dinner (Raat)', items: '200g Fish or chicken curry, 2 rotis, seasonal sabzi, 1 katori dahi', calories: 620, proteinGrams: 48 },
    ],
  },

  // =========================================================================
  // 9. GENERAL FITNESS - ADVANCED
  // =========================================================================
  {
    id: 'gen-adv-5day',
    title: '5-Day Tactical Longevity & Work Capacity',
    goal: 'General Fitness',
    level: 'Advanced',
    daysPerWeek: 5,
    duration: 'Ongoing Baseline',
    calories: 2500,
    description: 'High-tier comprehensive regimen combining heavy compound barbell loading with heart rate zone 2 and 5 aerobic pacing.',
    schedule: [
      { day: 'Day 1 (Mon) - Maximum Strength & Core', focus: 'Bench & Squat Priming', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '6', rest: '90s' }, { name: 'Barbell Back Squats', sets: '4', reps: '6', rest: '120s' }, { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Upper Pull & Stability', focus: 'Deadlifts & Rows', exercises: [{ name: 'Conventional Deadlifts', sets: '4', reps: '5', rest: '150s' }, { name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '90s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Aerobic Engine Pacing', focus: 'Cardio Intervals', exercises: [{ name: 'Incline Treadmill Walk', sets: '1', reps: '20 mins', rest: '0s' }, { name: 'Stationary Air Bike', sets: '10', reps: '20s sprint / 40s rest', rest: '40s' }] },
      { day: 'Day 4 (Fri) - Vertical Push / Pull', focus: 'OHP & Pull-Ups', exercises: [{ name: 'Standing Overhead Barbell Press', sets: '4', reps: '6', rest: '90s' }, { name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '8-10', rest: '75s' }, { name: 'Dips (Chest Focus)', sets: '3', reps: '10-12', rest: '60s' }] },
      { day: 'Day 5 (Sat) - Unilateral Leg & Core Armor', focus: 'Split Squats & Carries', exercises: [{ name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '75s' }, { name: 'Romanian Deadlifts', sets: '3', reps: '10', rest: '75s' }, { name: 'Ab Wheel Rollout', sets: '3', reps: '12', rest: '60s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Boiled eggs, 1 whole wheat chapati, 1 glass milk with honey and almonds', calories: 550, proteinGrams: 32 },
      { meal: 'Lunch (Dopahar)', items: '240g Chicken breast salan, 2 whole wheat rotis, 1 katori daal chana, kachumber salad', calories: 680, proteinGrams: 55 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl chana chaat with roasted peanuts, green tea', calories: 320, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '220g Lean beef or mutton salan, 2 whole wheat rotis, 1 bowl seasonal sabzi, 1 katori dahi', calories: 660, proteinGrams: 50 },
    ],
  },
  {
    id: 'gen-adv-6day',
    title: '6-Day High-Pace Functional Hypertrophy',
    goal: 'General Fitness',
    level: 'Advanced',
    daysPerWeek: 6,
    duration: 'Ongoing Baseline',
    calories: 2600,
    description: 'Peak conditioning regimen alternating Push/Pull/Legs with high volume metabolic work capacity circuits.',
    schedule: [
      { day: 'Day 1 (Mon) - Push Power', focus: 'Chest & Delts', exercises: [{ name: 'Barbell Flat Bench Press', sets: '4', reps: '8', rest: '75s' }, { name: 'Incline Dumbbell Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 2 (Tue) - Pull Power', focus: 'Back & Biceps', exercises: [{ name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '8-10', rest: '60s' }, { name: 'Barbell Bent-Over Row', sets: '4', reps: '8', rest: '60s' }, { name: 'Barbell Bicep Curls', sets: '3', reps: '10', rest: '45s' }] },
      { day: 'Day 3 (Wed) - Legs Power', focus: 'Squats & Calves', exercises: [{ name: 'Barbell Back Squats', sets: '4', reps: '8', rest: '90s' }, { name: 'Leg Press', sets: '3', reps: '10', rest: '60s' }, { name: 'Standing Calf Raises', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 4 (Thu) - Push Density', focus: 'Overhead & Triceps', exercises: [{ name: 'Standing Overhead Barbell Press', sets: '4', reps: '8', rest: '60s' }, { name: 'Dips (Chest Focus)', sets: '3', reps: '10', rest: '60s' }, { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', rest: '45s' }] },
      { day: 'Day 5 (Fri) - Pull Density', focus: 'Rows & Face Pulls', exercises: [{ name: 'Seated Cable Row', sets: '4', reps: '10', rest: '60s' }, { name: 'Lat Pulldowns', sets: '4', reps: '10', rest: '60s' }, { name: 'Cable Face Pulls', sets: '4', reps: '15', rest: '45s' }] },
      { day: 'Day 6 (Sat) - Legs Posterior & Intervals', focus: 'RDLs & Bike Sprints', exercises: [{ name: 'Romanian Deadlifts', sets: '4', reps: '10', rest: '60s' }, { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '60s' }, { name: 'Stationary Air Bike', sets: '8', reps: '20s sprint / 40s rest', rest: '40s' }] },
    ],
    dietSummary: [
      { meal: 'Breakfast (Nashta)', items: '4 Boiled eggs, 1 whole wheat chapati, 1 glass doodh with honey, 1 banana', calories: 580, proteinGrams: 34 },
      { meal: 'Lunch (Dopahar)', items: '250g Chicken breast salan, 2 whole wheat rotis, 1 katori daal, salad', calories: 700, proteinGrams: 58 },
      { meal: 'Evening Snack (Asar)', items: '1 Bowl chana chaat with peanuts, green tea', calories: 320, proteinGrams: 16 },
      { meal: 'Dinner (Raat)', items: '220g Beef/mutton or fish salan, 2 rotis, seasonal sabzi, 1 katori dahi', calories: 680, proteinGrams: 52 },
    ],
  },
];
