// ============================================================================
// IRONFORGE - Exercise Library
// Grouped by muscle groups: Chest, Back, Legs, Shoulders, Arms, Core, Cardio
// ============================================================================

import { LibraryExercise } from '../types';

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // CHEST
  { id: 'ex-ch-1', name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', defaultSets: '4', defaultReps: '6-8', defaultRest: '90s', notes: 'Control descent, drive feet into floor' },
  { id: 'ex-ch-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', defaultSets: '4', defaultReps: '8-10', defaultRest: '75s', notes: 'Target upper clavicular head' },
  { id: 'ex-ch-3', name: 'Dips (Chest Focus)', muscleGroup: 'Chest', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'Slight forward torso lean' },
  { id: 'ex-ch-4', name: 'Cable Crossover Flyes', muscleGroup: 'Chest', defaultSets: '3', defaultReps: '12-15', defaultRest: '45s', notes: 'Peak contraction squeeze' },
  { id: 'ex-ch-5', name: 'Push-Ups (Tempo or Deficit)', muscleGroup: 'Chest', defaultSets: '3', defaultReps: '15-20', defaultRest: '45s', notes: 'Full depth and lock' },
  { id: 'ex-ch-6', name: 'Decline Barbell/Dumbbell Press', muscleGroup: 'Chest', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'Lower pec emphasis' },

  // BACK
  { id: 'ex-bk-1', name: 'Conventional Deadlift', muscleGroup: 'Back', defaultSets: '4', defaultReps: '5', defaultRest: '120s', notes: 'Brace core, neutral spine' },
  { id: 'ex-bk-2', name: 'Pull-Ups / Chin-Ups', muscleGroup: 'Back', defaultSets: '4', defaultReps: '6-10', defaultRest: '90s', notes: 'Full hang to chin over bar' },
  { id: 'ex-bk-3', name: 'Barbell Bent-Over Row', muscleGroup: 'Back', defaultSets: '4', defaultReps: '8-10', defaultRest: '75s', notes: 'Pull to belly button' },
  { id: 'ex-bk-4', name: 'Lat Pulldown (Wide/Close)', muscleGroup: 'Back', defaultSets: '4', defaultReps: '10-12', defaultRest: '60s', notes: 'Drive elbows down' },
  { id: 'ex-bk-5', name: 'Seated Cable Row', muscleGroup: 'Back', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'Squeeze rhomboids' },
  { id: 'ex-bk-6', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'Full stretch at bottom' },

  // LEGS
  { id: 'ex-lg-1', name: 'Barbell Back Squat', muscleGroup: 'Legs', defaultSets: '4', defaultReps: '6-8', defaultRest: '120s', notes: 'Hit parallel or below' },
  { id: 'ex-lg-2', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', defaultSets: '4', defaultReps: '8-10', defaultRest: '90s', notes: 'Hinge hips, hamstring stretch' },
  { id: 'ex-lg-3', name: 'Leg Press (Heavy)', muscleGroup: 'Legs', defaultSets: '4', defaultReps: '10-12', defaultRest: '90s', notes: 'Feet shoulder width' },
  { id: 'ex-lg-4', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', defaultSets: '3', defaultReps: '10 / leg', defaultRest: '75s', notes: 'Unilateral quad and glute focus' },
  { id: 'ex-lg-5', name: 'Lying Leg Curls', muscleGroup: 'Legs', defaultSets: '4', defaultReps: '12-15', defaultRest: '60s', notes: 'Control the eccentric' },
  { id: 'ex-lg-6', name: 'Standing/Seated Calf Raises', muscleGroup: 'Legs', defaultSets: '4', defaultReps: '15-20', defaultRest: '45s', notes: '2 second pause at top' },

  // SHOULDERS
  { id: 'ex-sh-1', name: 'Standing Overhead Barbell Press (OHP)', muscleGroup: 'Shoulders', defaultSets: '4', defaultReps: '6-8', defaultRest: '90s', notes: 'Glutes tight, press over crown' },
  { id: 'ex-sh-2', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', defaultSets: '4', defaultReps: '8-10', defaultRest: '75s', notes: 'Full range of motion' },
  { id: 'ex-sh-3', name: 'Dumbbell Lateral Raises', muscleGroup: 'Shoulders', defaultSets: '4', defaultReps: '12-15', defaultRest: '45s', notes: 'Lead with elbows' },
  { id: 'ex-sh-4', name: 'Cable Face Pulls', muscleGroup: 'Shoulders', defaultSets: '4', defaultReps: '15-20', defaultRest: '45s', notes: 'External rotation for rear delts' },
  { id: 'ex-sh-5', name: 'Reverse Pec Deck / Rear Delt Flye', muscleGroup: 'Shoulders', defaultSets: '3', defaultReps: '12-15', defaultRest: '45s', notes: 'Keep arms slightly soft' },

  // ARMS
  { id: 'ex-ar-1', name: 'Barbell or EZ-Bar Bicep Curl', muscleGroup: 'Arms', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'No hip swinging' },
  { id: 'ex-ar-2', name: 'Incline Dumbbell Bicep Curl', muscleGroup: 'Arms', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'Deep stretch on long head' },
  { id: 'ex-ar-3', name: 'Hammer Curls (Dumbbell/Rope)', muscleGroup: 'Arms', defaultSets: '3', defaultReps: '10-12', defaultRest: '45s', notes: 'Brachialis & forearm thickness' },
  { id: 'ex-ar-4', name: 'Tricep Rope Pushdowns', muscleGroup: 'Arms', defaultSets: '4', defaultReps: '12-15', defaultRest: '45s', notes: 'Flare rope out at bottom' },
  { id: 'ex-ar-5', name: 'Skull Crushers (Lying Tricep Ext)', muscleGroup: 'Arms', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'Lower bar to crown/forehead' },
  { id: 'ex-ar-6', name: 'Close-Grip Bench Press', muscleGroup: 'Arms', defaultSets: '3', defaultReps: '8-10', defaultRest: '75s', notes: 'Elbows tucked, tricep drive' },

  // CORE
  { id: 'ex-cr-1', name: 'Hanging Leg / Knee Raises', muscleGroup: 'Core', defaultSets: '3', defaultReps: '12-15', defaultRest: '45s', notes: 'Posterior pelvic tilt' },
  { id: 'ex-cr-2', name: 'Cable Woodchoppers', muscleGroup: 'Core', defaultSets: '3', defaultReps: '12 / side', defaultRest: '45s', notes: 'Rotational core power' },
  { id: 'ex-cr-3', name: 'Ab Wheel Rollout', muscleGroup: 'Core', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s', notes: 'Anti-extension stability' },
  { id: 'ex-cr-4', name: 'Plank with Shoulder Taps', muscleGroup: 'Core', defaultSets: '3', defaultReps: '45-60s', defaultRest: '45s', notes: 'Keep hips dead steady' },

  // CARDIO
  { id: 'ex-cd-1', name: 'Incline Treadmill Power Walk', muscleGroup: 'Cardio', defaultSets: '1', defaultReps: '20-25 mins', defaultRest: '0s', notes: '12% incline, 4.5-5.2 km/h' },
  { id: 'ex-cd-2', name: 'Stationary Air Bike Intervals', muscleGroup: 'Cardio', defaultSets: '8', defaultReps: '20s Sprint / 40s Rest', defaultRest: '40s', notes: 'Max output effort' },
  { id: 'ex-cd-3', name: 'Rowing Machine Conditioning', muscleGroup: 'Cardio', defaultSets: '4', defaultReps: '500 meters', defaultRest: '60s', notes: 'Full leg drive and pull' },
  { id: 'ex-cd-4', name: 'Jump Rope High Cadence', muscleGroup: 'Cardio', defaultSets: '5', defaultReps: '2 mins continuous', defaultRest: '45s', notes: 'Stay light on balls of feet' },
];
