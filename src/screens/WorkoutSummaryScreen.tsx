import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Award, Dumbbell, Flame, Timer } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { MetricCard } from "@/components/MetricCard";
import { useWorkouts } from "@/hooks/useWorkouts";
import { actionFeedback } from "@/services/feedback";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackParamList, RootStackScreenProps } from "@/types";
import { formatDuration } from "@/utils/format";

export function WorkoutSummaryScreen({ route }: RootStackScreenProps<"WorkoutSummary">) {
  const { theme } = useThemeMode();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addWorkout, currentStreak, weeklyProgress, exerciseStats } = useWorkouts();
  const { record } = route.params;
  const exerciseStat = exerciseStats[record.exerciseName];
  const timesCompleted = Math.max(exerciseStat?.completionCount ?? 0, 1);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    void addWorkout(record);
    void actionFeedback("success");
  }, [addWorkout, record]);

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.backWrap}>
        <HeaderBackButton onPress={() => navigation.goBack()} />
      </View>
      <View style={[styles.achievement, { backgroundColor: `${theme.colors.primary}22`, borderColor: theme.colors.primary }]}>
        <Award color={theme.colors.orange} size={52} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Workout complete</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>You earned the Consistency Builder badge.</Text>
      </View>

      <View style={styles.metrics}>
        <MetricCard label={record.totalReps > 0 ? "Total reps" : "Duration"} value={record.totalReps > 0 ? `${record.totalReps}` : formatDuration(record.durationSeconds)} icon={Dumbbell} />
        <MetricCard label="Sets" value={`${record.completedSets}`} icon={Flame} color={theme.colors.orange} />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Minutes" value={`${record.totalMinutes}`} icon={Timer} color={theme.colors.green} />
        <MetricCard label="Calories" value={`${record.calories}`} icon={Award} color={theme.colors.secondary} />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Streak" value={`${currentStreak}d`} icon={Flame} color={theme.colors.orange} />
        <MetricCard label="Weekly progress" value={`${weeklyProgress.percentage}%`} icon={Award} color={theme.colors.primary} />
      </View>
      <MetricCard label="Times completed" value={`${timesCompleted}`} icon={Dumbbell} color={theme.colors.green} />

      <AppButton title="Back to Dashboard" onPress={() => navigation.navigate("MainTabs")} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    minHeight: "100%"
  },
  backWrap: {
    position: "absolute",
    top: 18,
    left: 20
  },
  achievement: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 26,
    alignItems: "center",
    gap: 12
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  },
  metrics: {
    flexDirection: "row",
    gap: 12
  }
});
