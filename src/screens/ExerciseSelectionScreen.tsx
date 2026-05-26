import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { ImageCard } from "@/components/ImageCard";
import { exercises } from "@/data/mockData";
import { useThemeMode } from "@/theme/ThemeProvider";
import { ExerciseCategory, RootStackParamList } from "@/types";

const categories: Array<ExerciseCategory | "All"> = ["All", "Push", "Pull", "Legs", "Core", "Full Body", "Cardio", "Gym"];

export function ExerciseSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useThemeMode();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "All">("All");

  const filtered = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesCategory = category === "All" || exercise.category === category;
      const searchable = `${exercise.name} ${exercise.category} ${exercise.muscles.join(" ")}`.toLowerCase();
      const matchesQuery = searchable.includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Choose your movement</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Simple, popular exercises first. Pick one to see beginner-friendly variations.</Text>
      </View>

      <View style={[styles.search, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Search color={theme.colors.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by exercise or muscle"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { color: theme.colors.text }]}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categories.map((item) => {
          const active = item === category;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.category, { backgroundColor: active ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Text style={[styles.categoryText, { color: active ? "#fff" : theme.colors.muted }]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {filtered.map((exercise) => (
          <ImageCard
            key={exercise.id}
            title={exercise.name}
            subtitle={`${exercise.muscles.join(", ")} - ${exercise.variations.length} variations`}
            image={exercise.image}
            height={184}
            badge={exercise.category}
            onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
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
    gap: 10,
    paddingRight: 20
  },
  category: {
    height: 42,
    minWidth: 78,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "900"
  },
  grid: {
    gap: 14
  }
});
