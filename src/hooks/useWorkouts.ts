import { useWorkoutProgress } from "@/progress/WorkoutProgressContext";

export function useWorkouts() {
  return useWorkoutProgress();
}
