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
import { useRoutine } from "@/routine/RoutineContext";
import { actionFeedback } from "@/services/feedback";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackParamList, RootStackScreenProps } from "@/types";
import { formatDuration } from "@/utils/format";

function dateKey(value: string | Date) {
  return (typeof value === "string" ? value : value.toISOString()).slice(0, 10);
}

function calculateDisplayStreak(workouts: { completedAt: string }[]) {
  const days = new Set(workouts.map((workout) => dateKey(workout.completedAt)));
  if (days.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);

  if (!days.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dateKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - day);
  return next;
}

export function WorkoutSummaryScreen({ route }: RootStackScreenProps<"WorkoutSummary">) {
  const { theme } = useThemeMode();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addWorkout, workouts, weeklyProgress, exerciseStats } = useWorkouts();
  const { markRoutineItemCompleted } = useRoutine();
  const { record } = route.params;
  const exerciseStat = exerciseStats[record.exerciseName];
  const timesCompleted = Math.max(exerciseStat?.completionCount ?? 0, 1);
  const displayWorkouts = workouts.some((workout) => workout.id === record.id) ? workouts : [record, ...workouts];
  const displayStreak = calculateDisplayStreak(displayWorkouts);
  const weekStart = startOfWeek(new Date());
  const displayWeeklyCompleted = new Set(displayWorkouts.filter((workout) => new Date(workout.completedAt) >= weekStart).map((workout) => workout.id)).size;
  const displayWeeklyPercentage = Math.min(100, Math.round((displayWeeklyCompleted / Math.max(1, weeklyProgress.goal)) * 100));
  const repsBySet = record.repsBySet ?? [];
  const completedRounds = record.setsCompleted ?? record.roundsCompleted ?? record.completedSets;
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    void addWorkout(record);
    if (record.routineDate && record.routineItemId) {
      void markRoutineItemCompleted(record.routineDate, record.routineItemId, true);
    }
    void actionFeedback("success");
  }, [addWorkout, markRoutineItemCompleted, record]);

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
        <MetricCard label={record.totalReps > 0 ? "Total reps" : "Duration"} value={record.totalReps > 0 ? `${record.totalReps}` : formatDuration(record.totalSeconds ?? record.durationSeconds)} icon={Dumbbell} />
        <MetricCard label={record.totalReps > 0 ? "Sets" : "Rounds"} value={`${completedRounds}`} icon={Flame} color={theme.colors.orange} />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Minutes" value={`${record.totalMinutes}`} icon={Timer} color={theme.colors.green} />
        <MetricCard label="Calories" value={`${record.calories}`} icon={Award} color={theme.colors.secondary} />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Streak" value={`${displayStreak}d`} icon={Flame} color={theme.colors.orange} />
        <MetricCard label="Weekly progress" value={`${displayWeeklyPercentage}%`} icon={Award} color={theme.colors.primary} />
      </View>
      <MetricCard label="Times completed" value={`${timesCompleted}`} icon={Dumbbell} color={theme.colors.green} />

      {repsBySet.length > 0 ? (
        <View style={[styles.breakdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>Reps by set</Text>
          {repsBySet.map((reps, index) => (
            <View key={`${record.id}-${index}`} style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.colors.muted }]}>Set {index + 1}</Text>
              <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>{reps} reps</Text>
            </View>
          ))}
        </View>
      ) : null}

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
  },
  breakdown: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 10
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "900"
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: "800"
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: "900"
  }
});
