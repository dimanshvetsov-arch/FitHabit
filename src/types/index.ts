import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type ExerciseCategory = "Push" | "Pull" | "Legs" | "Core" | "Full Body" | "Cardio" | "Gym";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  image: string;
  description: string;
  accent: string;
  difficulty: Difficulty;
  muscles: string[];
  variations: string[];
};

export type WorkoutSetup = {
  exerciseId: string;
  exerciseName: string;
  reps: number;
  sets: number;
  restSeconds: number;
  notes: string;
};

export type WorkoutRecord = {
  id: string;
  exerciseName: string;
  completedAt: string;
  totalReps: number;
  totalSets: number;
  durationSeconds: number;
  calories: number;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ExerciseSelection: undefined;
  ExerciseDetail: { exerciseId: string };
  WorkoutSetup: { exerciseId: string; exerciseName: string; variantName?: string };
  ActiveWorkout: { setup: WorkoutSetup; initialSet?: number; initialCompletedReps?: number; initialElapsedSeconds?: number };
  RestTimer: { setup: WorkoutSetup; completedSets: number; completedReps: number; elapsedSeconds: number };
  WorkoutSummary: { record: WorkoutRecord };
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
