import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Award, Dumbbell, Flame, Timer } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { MetricCard } from "@/components/MetricCard";
import { actionFeedback } from "@/services/feedback";
import { saveWorkout } from "@/storage/workoutStorage";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackParamList, RootStackScreenProps } from "@/types";
import { formatDuration } from "@/utils/format";

export function WorkoutSummaryScreen({ route }: RootStackScreenProps<"WorkoutSummary">) {
  const { theme } = useThemeMode();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { record } = route.params;

  useEffect(() => {
    void saveWorkout(record);
    void actionFeedback("success", `Workout saved. ${record.totalReps} total reps.`);
  }, [record]);

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={[styles.achievement, { backgroundColor: `${theme.colors.primary}22`, borderColor: theme.colors.primary }]}>
        <Award color={theme.colors.orange} size={52} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Workout complete</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>You earned the Consistency Builder badge.</Text>
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Total reps" value={`${record.totalReps}`} icon={Dumbbell} />
        <MetricCard label="Sets" value={`${record.totalSets}`} icon={Flame} color={theme.colors.orange} />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Duration" value={formatDuration(record.durationSeconds)} icon={Timer} color={theme.colors.green} />
        <MetricCard label="Calories" value={`${record.calories}`} icon={Award} color={theme.colors.secondary} />
      </View>

      <AppButton title="Back to Dashboard" onPress={() => navigation.navigate("MainTabs")} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    minHeight: "100%"
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
