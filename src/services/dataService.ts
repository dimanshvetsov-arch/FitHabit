import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserAccount } from "@/auth/AuthContext";
import type { UserGoals } from "@/goals/GoalsContext";
import type { Preferences } from "@/preferences/PreferencesContext";
import type { ExerciseStat } from "@/progress/WorkoutProgressContext";
import { clearWorkoutData } from "@/storage/workoutStorage";
import type { WorkoutRecord } from "@/types";

type ProgressExport = {
  completedWorkoutDates: string[];
  currentStreak: number;
  lastWorkoutDate?: string;
  totalMinutesTrained: number;
  weeklyProgress: unknown;
  exerciseStats: Record<string, ExerciseStat>;
  stats: unknown;
};

type ExportAllDataInput = {
  account: UserAccount | null;
  goals: UserGoals | null;
  settings: Preferences;
  workoutHistory: WorkoutRecord[];
  progress: ProgressExport;
};

export function exportAllData(data: ExportAllDataInput) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      account: data.account,
      goals: data.goals,
      settings: data.settings,
      workoutHistory: data.workoutHistory,
      streak: data.progress.currentStreak,
      exerciseStats: data.progress.exerciseStats,
      progress: data.progress
    },
    null,
    2
  );
}

export async function clearWorkoutHistory() {
  await clearWorkoutData();
}

export async function resetEntireApp() {
  await AsyncStorage.clear();
}
