import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { useAuth } from "@/auth/AuthContext";
import { MainGoal, useGoals } from "@/goals/GoalsContext";
import { usePreferences, FitnessLevel } from "@/preferences/PreferencesContext";
import { useThemeMode } from "@/theme/ThemeProvider";

const mainGoals: MainGoal[] = ["Build muscle", "Lose weight", "Improve endurance", "Build discipline", "Stay healthy"];
const levels: FitnessLevel[] = ["Beginner", "Intermediate", "Advanced"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function GoalsSetupScreen() {
  const { theme } = useThemeMode();
  const { completeOnboarding } = useAuth();
  const { updateGoals } = useGoals();
  const { updatePreferences } = usePreferences();
  const [mainGoal, setMainGoal] = useState<MainGoal>("Build discipline");
  const [weeklyWorkoutGoal, setWeeklyWorkoutGoal] = useState(3);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("Beginner");
  const [preferredWorkoutDays, setPreferredWorkoutDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);

  const toggleDay = (day: string) => {
    setPreferredWorkoutDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  };

  const finish = async () => {
    await updateGoals({ mainGoal, weeklyWorkoutGoal, fitnessLevel, preferredWorkoutDays });
    await updatePreferences({ fitnessLevel, preferredWorkoutDays: preferredWorkoutDays.map((day) => day.slice(0, 3)), defaultSets: Math.max(2, Math.min(weeklyWorkoutGoal, 5)) });
    await completeOnboarding();
  };

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Your goals</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>FitHabit will use these to personalize progress and defaults.</Text>
      </View>
      <ChoiceGroup title="Main goal" options={mainGoals} selected={mainGoal} onSelect={(value) => setMainGoal(value as MainGoal)} />
      <ChoiceGroup title="Weekly workout goal" options={[2, 3, 4, 5, 6, 7].map((value) => `${value} workouts per week`)} selected={`${weeklyWorkoutGoal} workouts per week`} onSelect={(value) => setWeeklyWorkoutGoal(Number(value[0]))} />
      <ChoiceGroup title="Fitness level" options={levels} selected={fitnessLevel} onSelect={(value) => setFitnessLevel(value as FitnessLevel)} />
      <ChoiceGroup title="Preferred days" options={days} selected={preferredWorkoutDays} onSelect={toggleDay} multi />
      <AppButton title="Open FitHabit" onPress={finish} />
    </AppScreen>
  );
}

function ChoiceGroup({ title, options, selected, onSelect, multi }: { title: string; options: string[]; selected: string | string[]; onSelect: (value: string) => void; multi?: boolean }) {
  const { theme } = useThemeMode();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.choices}>
        {options.map((option) => {
          const active = multi ? (selected as string[]).includes(option) : selected === option;
          return (
            <Pressable key={option} onPress={() => onSelect(option)} style={[styles.choice, { backgroundColor: active ? theme.colors.primary : theme.colors.cardSoft }]}>
              <Text style={[styles.choiceText, { color: active ? "#fff" : theme.colors.muted }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "900", letterSpacing: 0 },
  subtitle: { marginTop: 6, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 24, padding: 16, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: "900" },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  choiceText: { fontSize: 13, fontWeight: "900" }
});
