import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useGoals } from "@/goals/GoalsContext";
import { clearWorkoutData, loadWorkouts, saveWorkout } from "@/storage/workoutStorage";
import { WorkoutRecord } from "@/types";

type WorkoutStats = {
  totalWorkouts: number;
  totalReps: number;
  totalCalories: number;
  totalHours: number;
  totalMinutesTrained: number;
  streak: number;
};

type WeeklyProgress = {
  completed: number;
  goal: number;
  percentage: number;
  chart: number[];
};

export type ExerciseStat = {
  completionCount: number;
  totalReps: number;
  totalSeconds: number;
  totalMinutes: number;
  lastCompletedAt?: string;
};

type WorkoutProgressContextValue = {
  completedWorkouts: WorkoutRecord[];
  workouts: WorkoutRecord[];
  workoutHistory: WorkoutRecord[];
  calendarCompletedDays: string[];
  completedWorkoutDates: string[];
  currentStreak: number;
  lastWorkoutDate?: string;
  totalMinutesTrained: number;
  weeklyProgress: WeeklyProgress;
  exerciseStats: Record<string, ExerciseStat>;
  stats: WorkoutStats;
  loading: boolean;
  refresh: () => Promise<void>;
  addWorkout: (record: WorkoutRecord) => Promise<void>;
  completeWorkout: (record: WorkoutRecord) => Promise<void>;
  resetWorkouts: () => Promise<void>;
};

const Context = createContext<WorkoutProgressContextValue | null>(null);

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - day);
  return next;
}

function uniqueWorkoutDays(workouts: WorkoutRecord[]) {
  return Array.from(new Set(workouts.map((workout) => workout.completedAt.slice(0, 10)))).sort();
}

function calculateStreak(workouts: WorkoutRecord[]) {
  const days = new Set(uniqueWorkoutDays(workouts));
  if (days.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);

  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateWeeklyProgress(workouts: WorkoutRecord[], weeklyGoal: number): WeeklyProgress {
  const weekStart = startOfWeek(new Date());
  const chart = Array.from({ length: 7 }, () => 0);
  const completedIds = new Set<string>();

  workouts.forEach((workout) => {
    const date = new Date(workout.completedAt);
    if (date >= weekStart) {
      const dayIndex = (date.getDay() + 6) % 7;
      chart[dayIndex] += 1;
      completedIds.add(workout.id);
    }
  });

  const completed = completedIds.size;
  return {
    completed,
    goal: weeklyGoal,
    percentage: Math.min(100, Math.round((completed / weeklyGoal) * 100)),
    chart: chart.map((value) => Math.min(100, Math.round((value / Math.max(1, weeklyGoal)) * 100)))
  };
}

function normalizeWorkout(workout: WorkoutRecord): WorkoutRecord {
  const durationSeconds = workout.durationSeconds ?? Math.max(1, (workout.totalMinutes ?? 1) * 60);
  return {
    ...workout,
    trackingType: workout.trackingType ?? "reps_sets",
    totalMinutes: workout.totalMinutes ?? Math.max(1, Math.ceil(durationSeconds / 60)),
    completedSets: workout.completedSets ?? workout.totalSets ?? 1,
    totalSets: workout.totalSets ?? workout.completedSets ?? 1,
    targetReps: workout.targetReps ?? workout.totalReps ?? 0,
    targetSets: workout.targetSets ?? workout.totalSets ?? 1,
    durationSeconds,
    calories: workout.calories ?? 24
  };
}

export function WorkoutProgressProvider({ children }: PropsWithChildren) {
  const { goals } = useGoals();
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setCompletedWorkouts((await loadWorkouts()).map(normalizeWorkout));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addWorkout = useCallback(async (record: WorkoutRecord) => {
    const next = (await saveWorkout(normalizeWorkout(record))).map(normalizeWorkout);
    setCompletedWorkouts(next);
  }, []);

  const resetWorkouts = useCallback(async () => {
    await clearWorkoutData();
    setCompletedWorkouts([]);
  }, []);

  const weeklyGoal = goals?.weeklyWorkoutGoal ?? 5;
  const weeklyProgress = useMemo(() => calculateWeeklyProgress(completedWorkouts, weeklyGoal), [completedWorkouts, weeklyGoal]);
  const calendarCompletedDays = useMemo(() => uniqueWorkoutDays(completedWorkouts), [completedWorkouts]);
  const lastWorkoutDate = calendarCompletedDays.at(-1);
  const currentStreak = useMemo(() => calculateStreak(completedWorkouts), [completedWorkouts]);
  const totalMinutesTrained = useMemo(() => completedWorkouts.reduce((sum, workout) => sum + workout.totalMinutes, 0), [completedWorkouts]);
  const exerciseStats = useMemo(() => {
    return completedWorkouts.reduce<Record<string, ExerciseStat>>((acc, workout) => {
      const key = workout.exerciseName;
      const current = acc[key] ?? { completionCount: 0, totalReps: 0, totalSeconds: 0, totalMinutes: 0 };
      acc[key] = {
        completionCount: current.completionCount + 1,
        totalReps: current.totalReps + workout.totalReps,
        totalSeconds: current.totalSeconds + workout.durationSeconds,
        totalMinutes: current.totalMinutes + workout.totalMinutes,
        lastCompletedAt: !current.lastCompletedAt || workout.completedAt > current.lastCompletedAt ? workout.completedAt : current.lastCompletedAt
      };
      return acc;
    }, {});
  }, [completedWorkouts]);

  const stats = useMemo<WorkoutStats>(() => {
    const totalReps = completedWorkouts.reduce((sum, workout) => sum + workout.totalReps, 0);
    const totalCalories = completedWorkouts.reduce((sum, workout) => sum + workout.calories, 0);
    return {
      totalWorkouts: completedWorkouts.length,
      totalReps,
      totalCalories,
      totalHours: Math.round((totalMinutesTrained / 60) * 10) / 10,
      totalMinutesTrained,
      streak: currentStreak
    };
  }, [completedWorkouts, currentStreak, totalMinutesTrained]);

  const value = useMemo(
    () => ({
      completedWorkouts,
      workouts: completedWorkouts,
      workoutHistory: completedWorkouts,
      calendarCompletedDays,
      completedWorkoutDates: calendarCompletedDays,
      currentStreak,
      lastWorkoutDate,
      totalMinutesTrained,
      weeklyProgress,
      exerciseStats,
      stats,
      loading,
      refresh,
      addWorkout,
      completeWorkout: addWorkout,
      resetWorkouts
    }),
    [addWorkout, calendarCompletedDays, completedWorkouts, currentStreak, exerciseStats, lastWorkoutDate, loading, refresh, resetWorkouts, stats, totalMinutesTrained, weeklyProgress]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorkoutProgress() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useWorkoutProgress must be used inside WorkoutProgressProvider");
  }
  return value;
}
