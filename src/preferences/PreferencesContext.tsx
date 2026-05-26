import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type FitnessLevel = "Beginner" | "Intermediate" | "Advanced";
export type AccentColor = "Purple" | "Blue" | "Green" | "Orange" | "Red";
export type ThemePreference = "dark" | "light";
export type WeightUnit = "kg" | "lbs";
export type DistanceUnit = "km" | "miles";
export type TimeFormat = "12-hour" | "24-hour";

export type Preferences = {
  userName: string;
  profilePhoto: string;
  fitnessLevel: FitnessLevel;
  defaultReps: number;
  defaultSets: number;
  defaultRestSeconds: number;
  defaultPlankSeconds: number;
  reminderTime: string;
  preferredWorkoutDays: string[];
  themeMode: ThemePreference;
  accentColor: AccentColor;
  hapticFeedback: boolean;
  soundEffects: boolean;
  motivationalMessages: boolean;
  dailyWorkoutReminder: boolean;
  streakReminder: boolean;
  restTimerSound: boolean;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  timeFormat: TimeFormat;
};

export const PREFERENCES_KEY = "fithabit:preferences:v1";

export const defaultPreferences: Preferences = {
  userName: "New account",
  profilePhoto: "",
  fitnessLevel: "Beginner",
  defaultReps: 12,
  defaultSets: 4,
  defaultRestSeconds: 60,
  defaultPlankSeconds: 45,
  reminderTime: "18:00",
  preferredWorkoutDays: ["Mon", "Wed", "Fri"],
  themeMode: "dark",
  accentColor: "Purple",
  hapticFeedback: true,
  soundEffects: true,
  motivationalMessages: true,
  dailyWorkoutReminder: false,
  streakReminder: true,
  restTimerSound: true,
  weightUnit: "kg",
  distanceUnit: "km",
  timeFormat: "24-hour"
};

type PreferencesContextValue = {
  preferences: Preferences;
  loaded: boolean;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => Promise<void>;
  updatePreferences: (patch: Partial<Preferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
};

const Context = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(PREFERENCES_KEY).then((stored) => {
      if (stored) {
        setPreferences({ ...defaultPreferences, ...(JSON.parse(stored) as Partial<Preferences>) });
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (next: Preferences) => {
    setPreferences(next);
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  }, []);

  const updatePreference = useCallback(
    async <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      await persist({ ...preferences, [key]: value });
    },
    [persist, preferences]
  );

  const updatePreferences = useCallback(
    async (patch: Partial<Preferences>) => {
      await persist({ ...preferences, ...patch });
    },
    [persist, preferences]
  );

  const resetPreferences = useCallback(async () => {
    await persist(defaultPreferences);
  }, [persist]);

  const value = useMemo(
    () => ({ preferences, loaded, updatePreference, updatePreferences, resetPreferences }),
    [loaded, preferences, resetPreferences, updatePreference, updatePreferences]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePreferences() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("usePreferences must be used inside PreferencesProvider");
  }
  return value;
}
