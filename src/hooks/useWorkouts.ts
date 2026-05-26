import { useCallback, useEffect, useMemo, useState } from "react";
import { clearWorkoutData, loadWorkouts, saveWorkout } from "@/storage/workoutStorage";
import { WorkoutRecord } from "@/types";

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const records = await loadWorkouts();
    setWorkouts(records);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addWorkout = useCallback(async (record: WorkoutRecord) => {
    const next = await saveWorkout(record);
    setWorkouts(next);
  }, []);

  const resetWorkouts = useCallback(async () => {
    await clearWorkoutData();
    setWorkouts([]);
  }, []);

  const stats = useMemo(() => {
    const totalReps = workouts.reduce((sum, workout) => sum + workout.totalReps, 0);
    const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
    const totalSeconds = workouts.reduce((sum, workout) => sum + workout.durationSeconds, 0);
    const days = new Set(workouts.map((workout) => workout.completedAt.slice(0, 10)));

    return {
      totalWorkouts: workouts.length,
      totalReps,
      totalCalories,
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
      streak: Math.min(days.size, 12)
    };
  }, [workouts]);

  return { workouts, stats, loading, refresh, addWorkout, resetWorkouts };
}
