// ============================================================================
// IRONFORGE - Plan Editor Structural Helpers
// Utilities for detecting exercise muscle groups, swapping exercises,
// adjusting days-per-week split counts, and generating sensible routine days.
// ============================================================================

import { WorkoutDay, ExerciseItem, MuscleGroup, SampleMeal, FitnessGoal } from '../types';
import { EXERCISE_LIBRARY } from './exerciseLibrary';
import { PAKISTANI_FOOD_LIBRARY } from './foodLibrary';

// Known exercise catalog for fast, exact classification
const KNOWN_EXERCISES: Record<string, MuscleGroup> = {
  // Arms
  'bicep curl': 'Arms',
  'bicep curls': 'Arms',
  'biceps curl': 'Arms',
  'biceps curls': 'Arms',
  'barbell bicep curl': 'Arms',
  'barbell bicep curls': 'Arms',
  'dumbbell bicep curl': 'Arms',
  'dumbbell bicep curls': 'Arms',
  'incline bicep curl': 'Arms',
  'incline dumbbell bicep curl': 'Arms',
  'hammer curl': 'Arms',
  'hammer curls': 'Arms',
  'preacher curl': 'Arms',
  'preacher curls': 'Arms',
  'concentration curl': 'Arms',
  'concentration curls': 'Arms',
  'cable curl': 'Arms',
  'cable curls': 'Arms',
  'ez bar curl': 'Arms',
  'ez-bar curl': 'Arms',
  'barbell curl': 'Arms',
  'dumbbell curl': 'Arms',
  'spider curl': 'Arms',
  'reverse curl': 'Arms',
  'tricep extension': 'Arms',
  'tricep extensions': 'Arms',
  'triceps extension': 'Arms',
  'triceps extensions': 'Arms',
  'overhead tricep extension': 'Arms',
  'lying tricep extension': 'Arms',
  'cable tricep extension': 'Arms',
  'dumbbell tricep extension': 'Arms',
  'skull crusher': 'Arms',
  'skull crushers': 'Arms',
  'tricep rope pushdown': 'Arms',
  'tricep rope pushdowns': 'Arms',
  'tricep pushdown': 'Arms',
  'tricep pushdowns': 'Arms',
  'close-grip bench press': 'Arms',
  'close grip bench press': 'Arms',
  'close-grip bench': 'Arms',
  'close grip bench': 'Arms',
  'tricep dip': 'Arms',
  'tricep dips': 'Arms',

  // Legs
  'leg curl': 'Legs',
  'leg curls': 'Legs',
  'lying leg curl': 'Legs',
  'lying leg curls': 'Legs',
  'seated leg curl': 'Legs',
  'seated leg curls': 'Legs',
  'hamstring curl': 'Legs',
  'hamstring curls': 'Legs',
  'lying hamstring curl': 'Legs',
  'lying hamstring curls': 'Legs',
  'seated hamstring curl': 'Legs',
  'seated hamstring curls': 'Legs',
  'leg extension': 'Legs',
  'leg extensions': 'Legs',
  'seated leg extension': 'Legs',
  'seated leg extensions': 'Legs',
  'quad extension': 'Legs',
  'quad extensions': 'Legs',
  'calf raise': 'Legs',
  'calf raises': 'Legs',
  'standing calf raise': 'Legs',
  'standing calf raises': 'Legs',
  'seated calf raise': 'Legs',
  'seated calf raises': 'Legs',
  'barbell back squat': 'Legs',
  'barbell squat': 'Legs',
  'barbell squats': 'Legs',
  'squat': 'Legs',
  'squats': 'Legs',
  'front squat': 'Legs',
  'front squats': 'Legs',
  'hack squat': 'Legs',
  'hack squats': 'Legs',
  'goblet squat': 'Legs',
  'bulgarian split squat': 'Legs',
  'split squat': 'Legs',
  'leg press': 'Legs',
  'leg press (heavy)': 'Legs',
  'romanian deadlift': 'Legs',
  'romanian deadlifts': 'Legs',
  'romanian deadlift (rdl)': 'Legs',
  'rdl': 'Legs',
  'lunges': 'Legs',
  'lunge': 'Legs',
  'walking lunges': 'Legs',
  'dumbbell walking lunges': 'Legs',

  // Chest
  'bench press': 'Chest',
  'barbell flat bench press': 'Chest',
  'flat bench press': 'Chest',
  'incline dumbbell press': 'Chest',
  'incline bench press': 'Chest',
  'incline press': 'Chest',
  'decline bench press': 'Chest',
  'decline barbell press': 'Chest',
  'decline press': 'Chest',
  'chest press': 'Chest',
  'dumbbell chest press': 'Chest',
  'cable crossover flyes': 'Chest',
  'cable crossover': 'Chest',
  'chest fly': 'Chest',
  'chest flyes': 'Chest',
  'dumbbell fly': 'Chest',
  'dumbbell flyes': 'Chest',
  'pec deck': 'Chest',
  'push-up': 'Chest',
  'push-ups': 'Chest',
  'push up': 'Chest',
  'push ups': 'Chest',
  'dips (chest focus)': 'Chest',

  // Shoulders
  'shoulder press': 'Shoulders',
  'seated dumbbell shoulder press': 'Shoulders',
  'standing overhead barbell press': 'Shoulders',
  'standing overhead barbell press (ohp)': 'Shoulders',
  'overhead press': 'Shoulders',
  'military press': 'Shoulders',
  'arnold press': 'Shoulders',
  'ohp': 'Shoulders',
  'lateral raise': 'Shoulders',
  'lateral raises': 'Shoulders',
  'dumbbell lateral raise': 'Shoulders',
  'dumbbell lateral raises': 'Shoulders',
  'side lateral raise': 'Shoulders',
  'front raise': 'Shoulders',
  'cable face pulls': 'Shoulders',
  'face pull': 'Shoulders',
  'face pulls': 'Shoulders',
  'rear delt fly': 'Shoulders',
  'rear delt flyes': 'Shoulders',
  'rear delts': 'Shoulders',
  'barbell shrugs': 'Shoulders',
  'dumbbell shrugs': 'Shoulders',
  'upright row': 'Shoulders',

  // Back
  'lat pulldown': 'Back',
  'lat pulldowns': 'Back',
  'pulldown': 'Back',
  'pulldowns': 'Back',
  'conventional deadlift': 'Back',
  'deadlift': 'Back',
  'barbell bent-over row': 'Back',
  'bent-over row': 'Back',
  'bent over row': 'Back',
  'seated cable row': 'Back',
  'cable row': 'Back',
  'single-arm dumbbell row': 'Back',
  'dumbbell row': 'Back',
  'pull-ups': 'Back',
  'pull-up': 'Back',
  'pull ups': 'Back',
  'pull up': 'Back',
  'chin-ups': 'Back',
  'chin-up': 'Back',
  'chin ups': 'Back',
  'chin up': 'Back',
  't-bar row': 'Back',

  // Core
  'hanging leg raise': 'Core',
  'hanging leg raises': 'Core',
  'leg raise': 'Core',
  'leg raises': 'Core',
  'hanging knee raise': 'Core',
  'hanging knee raises': 'Core',
  'knee raise': 'Core',
  'knee raises': 'Core',
  'plank': 'Core',
  'planks': 'Core',
  'plank hold': 'Core',
  'ab wheel': 'Core',
  'ab wheel rollout': 'Core',
  'cable woodchoppers': 'Core',
  'woodchopper': 'Core',
  'woodchoppers': 'Core',
  'crunches': 'Core',
  'crunch': 'Core',
  'sit-up': 'Core',
  'sit-ups': 'Core',

  // Cardio
  'treadmill': 'Cardio',
  'incline treadmill': 'Cardio',
  'incline treadmill power walk': 'Cardio',
  'air bike': 'Cardio',
  'stationary air bike': 'Cardio',
  'rowing machine': 'Cardio',
  'jump rope': 'Cardio',
  'jump rope high cadence': 'Cardio',
};

/**
 * Detects the muscle group of an exercise name using known catalog, library,
 * or prioritized multi-word and keyword heuristics.
 *
 * Specific muscle-group matches take strict priority over generic words (e.g. "curl", "extension", "press").
 */
export function detectMuscleGroup(exerciseName: string, dayFocus?: string): MuscleGroup {
  const raw = (exerciseName || '').trim();
  const cleanName = raw.toLowerCase();
  const cleanFocus = (dayFocus || '').toLowerCase().trim();

  // 1. Exact catalog lookup
  const simpleNormalized = cleanName.replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (KNOWN_EXERCISES[simpleNormalized]) {
    return KNOWN_EXERCISES[simpleNormalized];
  }

  // 2. Direct match in EXERCISE_LIBRARY
  for (const ex of EXERCISE_LIBRARY) {
    const exClean = ex.name.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (simpleNormalized === exClean || cleanName.includes(ex.name.toLowerCase()) || ex.name.toLowerCase().includes(cleanName)) {
      return ex.muscleGroup;
    }
  }

  // 3. Priority Multi-Word Matches (disambiguates generic "curl", "extension", "press", "raise")

  // Core leg/knee raises (MUST be checked before Legs!)
  if (/(hanging\s*)?(leg|knee)\s*raises?/.test(cleanName)) {
    return 'Core';
  }

  // Leg curls and extensions (e.g. "Leg Curl", "Hamstring Curl", "Leg Extension", "Quad Extension")
  if (/(leg|hamstring|quad)\s*(curls?|extensions?)/.test(cleanName)) {
    return 'Legs';
  }

  // Arm curls and extensions (e.g. "Bicep Curl", "Hammer Curl", "Tricep Extension", "Preacher Curl")
  if (/(bicep|tricep|hammer|preacher|concentration|skull\s*crusher|forearm).*(curls?|extensions?|pushdowns?)/.test(cleanName)) {
    return 'Arms';
  }

  // Tricep specific movements
  if (/(tricep|pushdowns?|skull\s*crusher|close-?grip\s*bench)/.test(cleanName)) {
    return 'Arms';
  }

  // Bicep specific movements
  if (/(bicep|hammer\s*curls?)/.test(cleanName)) {
    return 'Arms';
  }

  // Shoulder presses and raises (e.g. "Shoulder Press", "Overhead Press", "Lateral Raise", "Face Pull")
  if (/(shoulder\s*press|overhead\s*press|\bohp\b|military\s*press|arnold\s*press|lateral\s*raises?|front\s*raises?|rear\s*delts?|face\s*pulls?|upright\s*row)/.test(cleanName)) {
    return 'Shoulders';
  }

  // Chest presses and flyes (e.g. "Bench Press", "Chest Press", "Incline Press", "Pec Deck", "Push-up")
  if (/(bench\s*press|chest\s*press|incline\s*press|decline\s*press|chest\s*fly|cable\s*crossover|pec\s*(deck|fly)|push-?ups?)/.test(cleanName)) {
    return 'Chest';
  }

  // Legs compound & isolation (e.g. "Calf Raise", "Squat", "Leg Press", "Lunge", "Romanian Deadlift")
  if (/(squats?|leg\s*press|lunges?|calf\s*raises?|calves|\brdl\b|romanian\s*deadlift|hack\s*squat)/.test(cleanName)) {
    return 'Legs';
  }

  // Back pulldowns, rows, deadlifts (e.g. "Lat Pulldown", "Bent-over Row", "Pull-up", "Chin-up")
  if (/(lat\s*pulldowns?|pulldowns?|bent-?over\s*rows?|cable\s*rows?|dumbbell\s*rows?|barbell\s*rows?|pull-?ups?|chin-?ups?|deadlifts?)/.test(cleanName)) {
    return 'Back';
  }

  // Core specific
  if (/(planks?|ab\s*wheel|woodchoppers?|crunches?|sit-?ups?|abdominal|obliques?)/.test(cleanName)) {
    return 'Core';
  }

  // Cardio specific
  if (/(treadmill|air\s*bike|stationary\s*bike|cycling?|rowing\s*machine|jump\s*rope|hiit|sprints?|cardio)/.test(cleanName)) {
    return 'Cardio';
  }

  // 4. Standalone generic words fallback:
  // "curl" without "leg/hamstring" defaults to Arms (e.g. "Barbell Curl", "Cable Curl")
  if (/\bcurls?\b/.test(cleanName)) {
    return 'Arms';
  }

  // "extension" without "leg" defaults to Arms (e.g. "Overhead Extension", "Cable Extension")
  if (/\bextensions?\b/.test(cleanName)) {
    return 'Arms';
  }

  // "bench" or "pec" defaults to Chest
  if (/\b(bench|pec|pecs)\b/.test(cleanName)) {
    return 'Chest';
  }

  // "squat" or "calf" or "hamstring" or "glute" defaults to Legs
  if (/\b(squats?|calf|calves|hamstring|glute|glutes|quad|quads)\b/.test(cleanName)) {
    return 'Legs';
  }

  // "delt" or "deltoid" or "shrug" defaults to Shoulders
  if (/\b(delt|delts|deltoid|shrugs?)\b/.test(cleanName)) {
    return 'Shoulders';
  }

  // "lat" or "lats" or "row" defaults to Back
  if (/\b(lat|lats|rows?)\b/.test(cleanName)) {
    return 'Back';
  }

  // 5. Fallback based on dayFocus if available
  if (/chest|push/.test(cleanFocus)) return 'Chest';
  if (/back|pull/.test(cleanFocus)) return 'Back';
  if (/leg|lower/.test(cleanFocus)) return 'Legs';
  if (/shoulder|delt/.test(cleanFocus)) return 'Shoulders';
  if (/arm|bicep|tricep/.test(cleanFocus)) return 'Arms';
  if (/core|ab/.test(cleanFocus)) return 'Core';
  if (/cardio/.test(cleanFocus)) return 'Cardio';

  return 'Chest';
}

/**
 * Returns library exercises filtered by a specific muscle group
 */
export function getExercisesForMuscleGroup(muscleGroup: MuscleGroup) {
  return EXERCISE_LIBRARY.filter((ex) => ex.muscleGroup === muscleGroup);
}

/**
 * Sensible default days added when expanding days-per-week
 */
export function createSensibleDay(dayNumber: number, goal?: string): WorkoutDay {
  switch (dayNumber) {
    case 1:
      return {
        day: 'Day 1 (Mon)',
        focus: 'Chest & Triceps Hypertrophy',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '8-10', rest: '90s' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Cable Chest Flyes', sets: '3', reps: '12-15', rest: '45s' },
          { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12-15', rest: '45s' },
        ],
      };
    case 2:
      return {
        day: 'Day 2 (Tue)',
        focus: 'Back & Biceps Hypertrophy',
        exercises: [
          { name: 'Lat Pulldowns (Wide Grip)', sets: '4', reps: '10-12', rest: '60s' },
          { name: 'Seated Cable Row', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Single-Arm Dumbbell Row', sets: '3', reps: '10 / arm', rest: '60s' },
          { name: 'Barbell Bicep Curls', sets: '3', reps: '12', rest: '45s' },
        ],
      };
    case 3:
      return {
        day: 'Day 3 (Wed)',
        focus: 'Legs & Calves Power',
        exercises: [
          { name: 'Barbell Back Squats', sets: '4', reps: '8-10', rest: '90s' },
          { name: 'Leg Press', sets: '3', reps: '10-12', rest: '75s' },
          { name: 'Lying Hamstring Curls', sets: '3', reps: '12-15', rest: '60s' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '45s' },
        ],
      };
    case 4:
      return {
        day: 'Day 4 (Thu)',
        focus: 'Shoulders & Traps Focus',
        exercises: [
          { name: 'Standing Overhead Barbell Press', sets: '4', reps: '8-10', rest: '75s' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '15', rest: '45s' },
          { name: 'Cable Face Pulls', sets: '3', reps: '15', rest: '45s' },
          { name: 'Barbell Shrugs', sets: '3', reps: '12-15', rest: '45s' },
        ],
      };
    case 5:
      return {
        day: 'Day 5 (Fri)',
        focus: 'Arms & Core Sculpting',
        exercises: [
          { name: 'Incline Dumbbell Bicep Curls', sets: '3', reps: '12', rest: '45s' },
          { name: 'Overhead Dumbbell Tricep Extension', sets: '3', reps: '12', rest: '45s' },
          { name: 'Hammer Curls', sets: '3', reps: '12', rest: '45s' },
          { name: 'Dips (Triceps/Chest)', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s' },
        ],
      };
    case 6:
      return {
        day: 'Day 6 (Sat)',
        focus: 'Full Body Conditioning & Core',
        exercises: [
          { name: 'Romanian Deadlifts (RDL)', sets: '3', reps: '10-12', rest: '75s' },
          { name: 'Goblet Squats', sets: '3', reps: '12', rest: '60s' },
          { name: 'Push-Ups (Chest Focus)', sets: '3', reps: '15', rest: '45s' },
          { name: 'Plank Hold', sets: '3', reps: '60s', rest: '45s' },
          { name: 'Treadmill Incline Walk / Sprints', sets: '1', reps: '20 min', rest: '0s' },
        ],
      };
    default:
      return {
        day: `Day ${dayNumber}`,
        focus: 'Accessory & Mobility Protocol',
        exercises: [
          { name: 'Goblet Squats', sets: '3', reps: '12', rest: '60s' },
          { name: 'Push-Ups (Chest Focus)', sets: '3', reps: '15', rest: '45s' },
          { name: 'Plank Hold', sets: '3', reps: '60s', rest: '45s' },
        ],
      };
  }
}

/**
 * Adjusts schedule array to match a new days-per-week count
 */
export function adjustScheduleToDays(
  currentSchedule: WorkoutDay[],
  targetDays: number,
  goal?: string
): WorkoutDay[] {
  const result = [...currentSchedule];

  if (targetDays < result.length) {
    // If reducing, drop the last days
    return result.slice(0, targetDays);
  }

  // If increasing, add sensible extra days
  while (result.length < targetDays) {
    const nextDayNum = result.length + 1;
    result.push(createSensibleDay(nextDayNum, goal));
  }

  return result;
}
