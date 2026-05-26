import { BarChart3, Flame, Target } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { ImageCard } from "@/components/ImageCard";
import { MetricCard } from "@/components/MetricCard";
import { images } from "@/data/images";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useThemeMode } from "@/theme/ThemeProvider";

function Chart({ values, labels }: { values: number[]; labels: string[] }) {
  const { theme } = useThemeMode();
  return (
    <View style={[styles.chart, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {values.map((value, index) => (
        <View key={`${labels[index]}-${index}`} style={styles.barWrap}>
          <View style={styles.barTrack}>
            <View style={[styles.bar, { height: `${value}%`, backgroundColor: value > 0 ? theme.colors.primary : theme.colors.cardSoft }]} />
          </View>
          <Text style={[styles.barLabel, { color: theme.colors.muted }]}>{labels[index]}</Text>
        </View>
      ))}
    </View>
  );
}

export function ProgressScreen() {
  const { theme } = useThemeMode();
  const { stats, workouts } = useWorkouts();
  const isNew = workouts.length === 0;
  const weekly = isNew ? [0, 0, 0, 0, 0, 0, 0] : [34, 62, 48, 82, 56, 92, 74];
  const monthly = isNew ? [0, 0, 0, 0] : [66, 54, 80, 91];

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Progress</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{isNew ? "Nothing tracked yet. Finish a workout to start your charts." : "Track the habit, not just the heroic days."}</Text>
      </View>
      <ImageCard title="Muscle focus" subtitle={isNew ? "Your first workout will define the first focus area" : "Upper body volume is trending up this week"} image={images.progress} height={206} badge="Analytics" />
      <View style={styles.metrics}>
        <MetricCard label="Streak" value={`${stats.streak}d`} icon={Flame} color={theme.colors.orange} />
        <MetricCard label="Total reps" value={`${stats.totalReps}`} icon={Target} color={theme.colors.green} />
      </View>
      <Text style={[styles.section, { color: theme.colors.text }]}>Weekly chart</Text>
      <Chart values={weekly} labels={["M", "T", "W", "T", "F", "S", "S"]} />
      <Text style={[styles.section, { color: theme.colors.text }]}>Monthly chart</Text>
      <Chart values={monthly} labels={["W1", "W2", "W3", "W4"]} />
      <View style={[styles.insight, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <BarChart3 color={theme.colors.primary} size={24} />
        <Text style={[styles.insightText, { color: theme.colors.text }]}>
          {isNew ? "Complete a few workouts and FitHabit will surface your best training patterns here." : "Best training window: morning sessions have 28% higher completion in your history."}
        </Text>
      </View>
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
  metrics: {
    flexDirection: "row",
    gap: 12
  },
  section: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0
  },
  chart: {
    height: 190,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  barWrap: {
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  barTrack: {
    height: 126,
    width: 20,
    borderRadius: 99,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)"
  },
  bar: {
    width: "100%",
    borderRadius: 99
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "900"
  },
  insight: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "center"
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  }
});
