import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FitnessLevel } from "@/preferences/PreferencesContext";
import { legacyStorageKeys, storageKeys } from "@/storage/keys";

export type MainGoal = "Build muscle" | "Lose weight" | "Improve endurance" | "Build discipline" | "Stay healthy";

export type UserGoals = {
  mainGoal: MainGoal;
  weeklyWorkoutGoal: number;
  fitnessLevel: FitnessLevel;
  preferredWorkoutDays: string[];
};

type GoalsContextValue = {
  goals: UserGoals | null;
  loading: boolean;
  updateGoals: (goals: UserGoals) => Promise<void>;
  clearGoals: () => Promise<void>;
};

export const GOALS_KEY = storageKeys.goals;

const Context = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: PropsWithChildren) {
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([AsyncStorage.getItem(GOALS_KEY), AsyncStorage.getItem(legacyStorageKeys.goals)]).then(async ([stored, legacy]) => {
      const source = stored ?? legacy;
      if (source) {
        const next = JSON.parse(source) as UserGoals;
        setGoals(next);
        if (!stored) await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(next));
      }
      setLoading(false);
    });
  }, []);

  const updateGoals = useCallback(async (next: UserGoals) => {
    setGoals(next);
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(next));
  }, []);

  const clearGoals = useCallback(async () => {
    setGoals(null);
    await AsyncStorage.removeItem(GOALS_KEY);
  }, []);

  const value = useMemo(() => ({ goals, loading, updateGoals, clearGoals }), [clearGoals, goals, loading, updateGoals]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useGoals() {
  const value = useContext(Context);
  if (!value) throw new Error("useGoals must be used inside GoalsProvider");
  return value;
}
