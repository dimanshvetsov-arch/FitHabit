import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Flame, Play, Timer } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { ImageCard } from "@/components/ImageCard";
import { MetricCard } from "@/components/MetricCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useAuth } from "@/auth/AuthContext";
import { images } from "@/data/images";
import { motivationalMessages } from "@/data/mockData";
import { useGoals } from "@/goals/GoalsContext";
import { useWorkouts } from "@/hooks/useWorkouts";
import { usePreferences } from "@/preferences/PreferencesContext";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackParamList } from "@/types";
import { formatDuration, shortDate } from "@/utils/format";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useThemeMode();
  const { user } = useAuth();
  const { goals } = useGoals();
  const { preferences } = usePreferences();
  const { workouts, stats, weeklyProgress } = useWorkouts();
  const isNew = workouts.length === 0;
  const message = preferences.motivationalMessages
    ? isNew
      ? "Start your first session and build from zero."
      : motivationalMessages[new Date().getDay() % motivationalMessages.length]
    : undefined;

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: theme.colors.muted }]}>Welcome back{user?.username ? `, ${user.username}` : ""}</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{isNew ? "Let's begin" : "Ready to train?"}</Text>
        </View>
        <View style={[styles.level, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.levelText, { color: theme.colors.text }]}>{goals?.fitnessLevel ?? "New"}</Text>
        </View>
      </View>

      <ImageCard title="FitHabit" subtitle={message} image={images.homeHero} height={236} badge={isNew ? "Fresh start" : "Today's plan"} />
      <AppButton title="Start Workout" icon={Play} onPress={() => navigation.navigate("ExerciseSelection")} />

      <View style={[styles.progressPanel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.progressText}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Weekly progress</Text>
          <Text style={[styles.body, { color: theme.colors.muted }]}>
            {isNew ? "No workouts yet. Your first completed session starts the chart." : `${weeklyProgress.completed}/${weeklyProgress.goal} workouts this week`}
          </Text>
        </View>
        <ProgressRing progress={weeklyProgress.percentage / 100} label="week" />
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Workout streak" value={`${stats.streak}d`} icon={Flame} color={theme.colors.orange} />
        <MetricCard label="Minutes trained" value={`${stats.totalMinutesTrained}`} icon={Timer} color={theme.colors.green} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent workouts</Text>
      <View style={styles.recentList}>
        {isNew ? (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.recentName, { color: theme.colors.text }]}>No workouts yet</Text>
            <Text style={[styles.body, { color: theme.colors.muted }]}>Complete your first workout to see it here.</Text>
          </View>
        ) : (
          workouts.slice(0, 3).map((workout) => (
            <View key={workout.id} style={[styles.recentItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View>
                <Text style={[styles.recentName, { color: theme.colors.text }]}>{workout.exerciseName}</Text>
                <Text style={[styles.body, { color: theme.colors.muted }]}>{shortDate(workout.completedAt)} - {workout.totalMinutes} min</Text>
              </View>
              <Text style={[styles.reps, { color: theme.colors.primary }]}>{workout.totalReps}</Text>
            </View>
          ))
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  kicker: {
    fontSize: 14,
    fontWeight: "700"
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0
  },
  level: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1
  },
  levelText: {
    fontWeight: "900"
  },
  progressPanel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  progressText: {
    flex: 1,
    paddingRight: 14,
    gap: 8
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0
  },
  body: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19
  },
  metrics: {
    flexDirection: "row",
    gap: 12
  },
  recentList: {
    gap: 10
  },
  recentItem: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  emptyState: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 6
  },
  recentName: {
    fontSize: 16,
    fontWeight: "800"
  },
  reps: {
    fontSize: 22,
    fontWeight: "900"
  }
});
