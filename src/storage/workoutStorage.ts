import AsyncStorage from "@react-native-async-storage/async-storage";
import { exercises } from "@/data/mockData";
import { WorkoutRecord } from "@/types";

const WORKOUTS_KEY = "fithabit:workouts:v2";
const REMINDERS_KEY = "fithabit:daily-reminders";
const mainExerciseNames = new Set(exercises.map((exercise) => exercise.name));

function isMainExerciseWorkout(workout: WorkoutRecord) {
  return mainExerciseNames.has(workout.exerciseName);
}

export async function loadWorkouts(): Promise<WorkoutRecord[]> {
  const stored = await AsyncStorage.getItem(WORKOUTS_KEY);
  if (!stored) {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify([]));
    return [];
  }
  const storedWorkouts = JSON.parse(stored) as WorkoutRecord[];
  const workouts = storedWorkouts.filter(isMainExerciseWorkout);
  if (workouts.length !== storedWorkouts.length) {
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
  await AsyncStorage.multiRemove([WORKOUTS_KEY, "fithabit:workouts"]);
}
