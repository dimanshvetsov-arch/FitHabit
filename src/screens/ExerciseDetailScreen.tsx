import { ChevronRight, Dumbbell, Target } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { ImageCard } from "@/components/ImageCard";
import { exercises } from "@/data/mockData";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps } from "@/types";

export function ExerciseDetailScreen({ navigation, route }: RootStackScreenProps<"ExerciseDetail">) {
  const { theme } = useThemeMode();
  const { exerciseStats } = useWorkouts();
  const exercise = exercises.find((item) => item.id === route.params.exerciseId);

  if (!exercise) {
    return (
      <AppScreen>
        <Text style={[styles.title, { color: theme.colors.text }]}>Exercise not found</Text>
      </AppScreen>
    );
  }
  const stats = exerciseStats[exercise.name] ?? { completionCount: 0, totalReps: 0, totalSeconds: 0, totalMinutes: 0 };

  return (
    <AppScreen>
      <ImageCard title={exercise.name} subtitle={exercise.description} image={exercise.image} height={240} badge={exercise.category} />

      <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.orange}22` }]}>
            <Dumbbell color={theme.colors.orange} size={20} />
          </View>
          <View style={styles.infoText}>
            <Text style={[styles.label, { color: theme.colors.muted }]}>Completed</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{stats.completionCount} times</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.secondary}22` }]}>
            <Target color={theme.colors.secondary} size={20} />
          </View>
          <View style={styles.infoText}>
            <Text style={[styles.label, { color: theme.colors.muted }]}>Total</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{exercise.trackingType === "timer_only" ? `${stats.totalMinutes} min` : `${stats.totalReps} reps`}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}22` }]}>
            <Target color={theme.colors.primary} size={20} />
          </View>
          <View style={styles.infoText}>
            <Text style={[styles.label, { color: theme.colors.muted }]}>Difficulty</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{exercise.difficulty}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.green}22` }]}>
            <Dumbbell color={theme.colors.green} size={20} />
          </View>
          <View style={styles.infoText}>
            <Text style={[styles.label, { color: theme.colors.muted }]}>Muscles</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{exercise.muscles.join(", ")}</Text>
          </View>
        </View>
      </View>

      <View>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Variations</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Tap one variation to set reps, sets, rest time, and notes.</Text>
      </View>

      <View style={styles.variationList}>
        {exercise.variations.map((variation, index) => (
          <Pressable
            key={variation}
            onPress={() => navigation.navigate("WorkoutSetup", { exerciseId: exercise.id, exerciseName: exercise.name, variantName: variation })}
            style={({ pressed }) => [styles.variation, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, pressed && styles.pressed]}
          >
            <View style={[styles.number, { backgroundColor: `${exercise.accent}22` }]}>
              <Text style={[styles.numberText, { color: exercise.accent }]}>{index + 1}</Text>
            </View>
            <View style={styles.variationText}>
              <Text style={[styles.variationName, { color: theme.colors.text }]}>{variation}</Text>
              <Text style={[styles.variationMeta, { color: theme.colors.muted }]}>{index === 0 ? "Best place to start" : "Beginner-friendly progression"}</Text>
            </View>
            <ChevronRight color={theme.colors.muted} size={20} />
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 18
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  infoText: {
    flex: 1
  },
  label: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  value: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "800"
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  variationList: {
    gap: 12
  },
  variation: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  number: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  numberText: {
    fontSize: 14,
    fontWeight: "900"
  },
  variationText: {
    flex: 1
  },
  variationName: {
    fontSize: 16,
    fontWeight: "900"
  },
  variationMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700"
  }
});
