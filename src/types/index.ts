import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type ExerciseCategory = "Push" | "Pull" | "Legs" | "Core" | "Full Body" | "Cardio" | "Gym";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type TrackingType = "reps_sets" | "timer_only" | "distance_time" | "reps_timer";
export type WorkoutTrackingType = TrackingType | "timed_reps";

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  image: string;
  description: string;
  accent: string;
  difficulty: Difficulty;
  trackingType: TrackingType;
  muscles: string[];
  variations: string[];
};

export type WorkoutSetup = {
  exerciseId: string;
  exerciseName: string;
  variationName?: string;
  trackingType: TrackingType;
  reps: number;
  sets: number;
  restSeconds: number;
  notes: string;
  durationSeconds?: number;
  rounds?: number;
  distance?: number;
  goalTimeSeconds?: number;
  repsGoal?: number;
  routineDate?: string;
  routineItemId?: string;
  repsBySet?: number[];
};

export type WorkoutRecord = {
  id: string;
  userId?: string;
  exerciseName: string;
  variationName?: string;
  trackingType: WorkoutTrackingType;
  completedAt: string;
  setDurationSeconds?: number;
  restTimeSeconds?: number;
  setsCompleted?: number;
  roundsCompleted?: number;
  repsBySet?: number[];
  totalSeconds?: number;
  totalMinutes: number;
  totalReps: number;
  completedSets: number;
  totalSets: number;
  targetReps: number;
  targetSets: number;
  durationSeconds: number;
  calories: number;
  routineDate?: string;
  routineItemId?: string;
};

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  CreateAccount: undefined;
  GoalsSetup: undefined;
  MainTabs: undefined;
  ExerciseSelection: undefined;
  ExerciseDetail: { exerciseId: string };
  WorkoutSetup: {
    exerciseId: string;
    exerciseName: string;
    variantName?: string;
    routineDate?: string;
    routineItemId?: string;
    targetReps?: number;
    targetSets?: number;
    restSeconds?: number;
    durationSeconds?: number;
    rounds?: number;
    distance?: number;
    goalTimeSeconds?: number;
    repsGoal?: number;
  };
  ActiveWorkout: { setup: WorkoutSetup; initialSet?: number; initialCompletedReps?: number; initialElapsedSeconds?: number; repsBySet?: number[] };
  RestTimer: { setup: WorkoutSetup; completedSets: number; completedReps: number; elapsedSeconds: number; repsBySet?: number[] };
  WorkoutSummary: { record: WorkoutRecord };
  CalendarDayDetail: { date: string };
  ProfileEdit: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Exercises: undefined;
  Progress: undefined;
  Calendar: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
