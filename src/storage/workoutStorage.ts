import AsyncStorage from "@react-native-async-storage/async-storage";
import { WorkoutRecord } from "@/types";

const WORKOUTS_KEY = "fithabit:workouts:v2";
const REMINDERS_KEY = "fithabit:daily-reminders";

export async function loadWorkouts(): Promise<WorkoutRecord[]> {
  const stored = await AsyncStorage.getItem(WORKOUTS_KEY);
  if (!stored) {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(stored) as WorkoutRecord[];
}

export async function saveWorkout(record: WorkoutRecord) {
  const workouts = await loadWorkouts();
  const next = [record, ...workouts];
  await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(next));
  return next;
}

export async function setDailyReminders(enabled: boolean) {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(enabled));
}

export async function getDailyReminders() {
  const stored = await AsyncStorage.getItem(REMINDERS_KEY);
  return stored ? (JSON.parse(stored) as boolean) : false;
}

export async function clearWorkoutData() {
  await AsyncStorage.multiRemove([WORKOUTS_KEY, "fithabit:workouts", REMINDERS_KEY]);
}
