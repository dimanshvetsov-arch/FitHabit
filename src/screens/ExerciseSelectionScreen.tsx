import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { ImageCard } from "@/components/ImageCard";
import { images } from "@/data/images";
import { exercises } from "@/data/mockData";
import { useThemeMode } from "@/theme/ThemeProvider";
import { ExerciseCategory, RootStackScreenProps } from "@/types";

const categories: ExerciseCategory[] = ["Push", "Pull", "Legs", "Core"];

export function ExerciseSelectionScreen({ navigation }: RootStackScreenProps<"ExerciseSelection">) {
  const { theme } = useThemeMode();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>("Push");

  const filtered = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesCategory = exercise.category === category;
      const matchesQuery = exercise.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Choose your movement</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Pick a focus, then lock in the version you want to build.</Text>
      </View>

      <View style={[styles.search, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Search color={theme.colors.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { color: theme.colors.text }]}
        />
      </View>

      <View style={styles.categories}>
        {categories.map((item) => {
          const active = item === category;
          return (
            <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, { backgroundColor: active ? theme.colors.primary : theme.colors.card }]}>
              <Text style={[styles.categoryText, { color: active ? "#fff" : theme.colors.muted }]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        {filtered.map((exercise) => (
          <ImageCard
            key={exercise.id}
            title={exercise.name}
            subtitle={exercise.description}
            image={exercise.image}
            fallbackImage={exercise.id === "push-ups" ? images.pushUp : undefined}
            height={180}
            badge={exercise.category}
            onPress={() =>
              exercise.id === "push-ups"
                ? navigation.navigate("PushUpType", { exerciseId: exercise.id, exerciseName: exercise.name })
                : navigation.navigate("WorkoutSetup", { exerciseId: exercise.id, exerciseName: exercise.name })
            }
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  search: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700"
  },
  categories: {
    flexDirection: "row",
    gap: 10
  },
  category: {
    flex: 1,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "900"
  },
  grid: {
    gap: 14
  }
});
