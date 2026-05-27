import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TrackingType } from "@/types";

export type RoutineDayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type RoutineItem = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  variationName: string;
  trackingType: TrackingType;
  targetReps?: number;
  targetSets?: number;
  restTime?: number;
  durationSeconds?: number;
  rounds?: number;
  distance?: number;
  goalTimeSeconds?: number;
  repsGoal?: number;
};

export type WeeklyRoutine = Record<RoutineDayKey, RoutineItem[]>;
export type RoutineCompletions = Record<string, Record<string, boolean>>;

type RoutineContextValue = {
  weeklyRoutine: WeeklyRoutine;
  routineCompletions: RoutineCompletions;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  addRoutineItem: (day: RoutineDayKey, item: Omit<RoutineItem, "id">) => Promise<void>;
  updateRoutineItem: (day: RoutineDayKey, item: RoutineItem) => Promise<void>;
  deleteRoutineItem: (day: RoutineDayKey, itemId: string) => Promise<void>;
  reorderRoutineItems: (day: RoutineDayKey, fromIndex: number, toIndex: number) => Promise<void>;
  duplicateDayRoutine: (fromDay: RoutineDayKey, toDay: RoutineDayKey) => Promise<void>;
  clearDayRoutine: (day: RoutineDayKey) => Promise<void>;
  markRoutineItemCompleted: (date: string, itemId: string, completed: boolean) => Promise<void>;
  getRoutineForDate: (date: string) => RoutineItem[];
  getCompletionForDate: (date: string) => Record<string, boolean>;
};

const ROUTINE_KEY = "@weeklyRoutine";
const COMPLETIONS_KEY = "@routineCompletions";

export const routineDays: { key: RoutineDayKey; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" }
];

const emptyRoutine: WeeklyRoutine = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
};

const Context = createContext<RoutineContextValue | null>(null);

export function dateKey(date: Date | string) {
  return (typeof date === "string" ? date : date.toISOString()).slice(0, 10);
}

export function dayKeyFromDate(date: Date | string): RoutineDayKey {
  const next = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  const index = (next.getDay() + 6) % 7;
  return routineDays[index].key;
}

function todayKey() {
  return dateKey(new Date());
}

export function RoutineProvider({ children }: PropsWithChildren) {
  const [weeklyRoutine, setWeeklyRoutine] = useState<WeeklyRoutine>(emptyRoutine);
  const [routineCompletions, setRoutineCompletions] = useState<RoutineCompletions>({});
  const [selectedDate, setSelectedDate] = useState(todayKey());

  useEffect(() => {
    void Promise.all([AsyncStorage.getItem(ROUTINE_KEY), AsyncStorage.getItem(COMPLETIONS_KEY)]).then(([routine, completions]) => {
      if (routine) setWeeklyRoutine({ ...emptyRoutine, ...(JSON.parse(routine) as Partial<WeeklyRoutine>) });
      if (completions) setRoutineCompletions(JSON.parse(completions) as RoutineCompletions);
    });
  }, []);

  const persistRoutine = useCallback(async (next: WeeklyRoutine) => {
    setWeeklyRoutine(next);
    await AsyncStorage.setItem(ROUTINE_KEY, JSON.stringify(next));
  }, []);

  const persistCompletions = useCallback(async (next: RoutineCompletions) => {
    setRoutineCompletions(next);
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(next));
  }, []);

  const addRoutineItem = useCallback(
    async (day: RoutineDayKey, item: Omit<RoutineItem, "id">) => {
      await persistRoutine({ ...weeklyRoutine, [day]: [...weeklyRoutine[day], { ...item, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` }] });
    },
    [persistRoutine, weeklyRoutine]
  );

  const updateRoutineItem = useCallback(
    async (day: RoutineDayKey, item: RoutineItem) => {
      await persistRoutine({ ...weeklyRoutine, [day]: weeklyRoutine[day].map((current) => current.id === item.id ? item : current) });
    },
    [persistRoutine, weeklyRoutine]
  );

  const deleteRoutineItem = useCallback(
    async (day: RoutineDayKey, itemId: string) => {
      await persistRoutine({ ...weeklyRoutine, [day]: weeklyRoutine[day].filter((item) => item.id !== itemId) });
    },
    [persistRoutine, weeklyRoutine]
  );

  const reorderRoutineItems = useCallback(
    async (day: RoutineDayKey, fromIndex: number, toIndex: number) => {
      const items = [...weeklyRoutine[day]];
      if (toIndex < 0 || toIndex >= items.length) return;
      const [item] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, item);
      await persistRoutine({ ...weeklyRoutine, [day]: items });
    },
    [persistRoutine, weeklyRoutine]
  );

  const duplicateDayRoutine = useCallback(
    async (fromDay: RoutineDayKey, toDay: RoutineDayKey) => {
      await persistRoutine({ ...weeklyRoutine, [toDay]: weeklyRoutine[fromDay].map((item) => ({ ...item, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` })) });
    },
    [persistRoutine, weeklyRoutine]
  );

  const clearDayRoutine = useCallback(async (day: RoutineDayKey) => {
    await persistRoutine({ ...weeklyRoutine, [day]: [] });
  }, [persistRoutine, weeklyRoutine]);

  const markRoutineItemCompleted = useCallback(
    async (date: string, itemId: string, completed: boolean) => {
      const key = dateKey(date);
      await persistCompletions({ ...routineCompletions, [key]: { ...(routineCompletions[key] ?? {}), [itemId]: completed } });
    },
    [persistCompletions, routineCompletions]
  );

  const getRoutineForDate = useCallback((date: string) => weeklyRoutine[dayKeyFromDate(date)], [weeklyRoutine]);
  const getCompletionForDate = useCallback((date: string) => routineCompletions[dateKey(date)] ?? {}, [routineCompletions]);

  const value = useMemo(
    () => ({
      weeklyRoutine,
      routineCompletions,
      selectedDate,
      setSelectedDate,
      addRoutineItem,
      updateRoutineItem,
      deleteRoutineItem,
      reorderRoutineItems,
      duplicateDayRoutine,
      clearDayRoutine,
      markRoutineItemCompleted,
      getRoutineForDate,
      getCompletionForDate
    }),
    [addRoutineItem, clearDayRoutine, deleteRoutineItem, duplicateDayRoutine, getCompletionForDate, getRoutineForDate, markRoutineItemCompleted, reorderRoutineItems, routineCompletions, selectedDate, updateRoutineItem, weeklyRoutine]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRoutine() {
  const value = useContext(Context);
  if (!value) throw new Error("useRoutine must be used inside RoutineProvider");
  return value;
}
