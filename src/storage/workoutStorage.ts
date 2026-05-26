import AsyncStorage from "@react-native-async-storage/async-storage";
import { exercises } from "@/data/mockData";
import { legacyStorageKeys, storageKeys } from "@/storage/keys";
import { WorkoutRecord } from "@/types";

export const WORKOUTS_KEY = storageKeys.workoutHistory;
const REMINDERS_KEY = "fithabit:daily-reminders";
const mainExerciseNames = new Set(exercises.map((exercise) => exercise.name));

function isMainExerciseWorkout(workout: WorkoutRecord) {
  return mainExerciseNames.has(workout.exerciseName);
}

export async function loadWorkouts(): Promise<WorkoutRecord[]> {
  const stored = await AsyncStorage.getItem(WORKOUTS_KEY);
  const legacy = stored ? null : await AsyncStorage.getItem(legacyStorageKeys.workoutHistory);
  const source = stored ?? legacy;
  if (!source) {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify([]));
    return [];
  }
  const storedWorkouts = JSON.parse(source) as WorkoutRecord[];
  const workouts = storedWorkouts.filter(isMainExerciseWorkout);
  if (!stored || workouts.length !== storedWorkouts.length) {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  }
  return workouts;
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
  await AsyncStorage.multiRemove([WORKOUTS_KEY, storageKeys.progress, storageKeys.exerciseStats, legacyStorageKeys.workoutHistory, legacyStorageKeys.oldWorkoutHistory]);
}
