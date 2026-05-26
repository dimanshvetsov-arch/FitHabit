import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CheckCircle2, Medal } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackParamList } from "@/types";
import { shortDate } from "@/utils/format";

const days = Array.from({ length: 30 }, (_, index) => index + 1);

export function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useThemeMode();
  const { workouts } = useWorkouts();
  const completedDays = useMemo(() => new Set(workouts.map((workout) => new Date(workout.completedAt).getDate())), [workouts]);

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Calendar</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Completed days get locked in as visible proof.</Text>
      </View>

      <View style={[styles.calendar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {days.map((day) => {
          const complete = completedDays.has(day);
          return (
            <Pressable key={day} onPress={() => navigation.navigate("CalendarDayDetail", { date: `Day ${day}` })} style={[styles.day, { backgroundColor: complete ? theme.colors.primary : theme.colors.cardSoft }]}>
              <Text style={[styles.dayText, { color: complete ? "#fff" : theme.colors.muted }]}>{day}</Text>
              {complete ? <CheckCircle2 color="#fff" size={12} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Workout history</Text>
      {workouts.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Medal color={theme.colors.muted} size={24} />
          <Text style={[styles.historyName, { color: theme.colors.text }]}>No completed days yet</Text>
          <Text style={[styles.historyMeta, { color: theme.colors.muted }]}>Finished workouts will appear here.</Text>
        </View>
      ) : workouts.map((workout) => (
        <Pressable key={workout.id} onPress={() => navigation.navigate("CalendarDayDetail", { date: shortDate(workout.completedAt) })} style={[styles.history, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.badge, { backgroundColor: `${theme.colors.green}22` }]}>
            <Medal color={theme.colors.green} size={20} />
          </View>
          <View style={styles.historyText}>
            <Text style={[styles.historyName, { color: theme.colors.text }]}>{workout.exerciseName}</Text>
            <Text style={[styles.historyMeta, { color: theme.colors.muted }]}>{shortDate(workout.completedAt)} - {workout.totalSets} sets - {workout.totalReps} reps</Text>
          </View>
          <Text style={[styles.completed, { color: theme.colors.green }]}>Done</Text>
        </Pressable>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600"
  },
  calendar: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  day: {
    width: "12.4%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  dayText: {
    fontSize: 13,
    fontWeight: "900"
  },
  section: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0
  },
  history: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  empty: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    gap: 8
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  historyText: {
    flex: 1
  },
  historyName: {
    fontSize: 16,
    fontWeight: "900"
  },
  historyMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700"
  },
  completed: {
    fontSize: 12,
    fontWeight: "900"
  }
});
