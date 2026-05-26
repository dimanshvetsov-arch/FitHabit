import { ChevronRight } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { pushUpTypes } from "@/data/mockData";
import { AppScreen } from "@/components/AppScreen";
import { ImageCard } from "@/components/ImageCard";
import { images } from "@/data/images";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps } from "@/types";

export function PushUpTypeScreen({ navigation, route }: RootStackScreenProps<"PushUpType">) {
  const { theme } = useThemeMode();

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Choose push-up type</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Every variation changes the stimulus. Pick the one that fits today.</Text>
      </View>

      <ImageCard title="Push-up builder" subtitle="Choose the exact version for today's session" image={images.pushUpBanner} fallbackImage={images.pushUp} height={168} badge="Push" />

      {pushUpTypes.map((type) => (
        <Pressable
          key={type.id}
          onPress={() => navigation.navigate("WorkoutSetup", { exerciseId: route.params.exerciseId, exerciseName: route.params.exerciseName, variantName: type.name })}
          style={({ pressed }) => [styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, pressed && styles.pressed]}
        >
          <Image source={{ uri: type.image }} style={styles.thumbnail} />
          <View style={styles.copy}>
            <View style={styles.row}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{type.name}</Text>
              <View style={[styles.badge, { backgroundColor: `${theme.colors.primary}25` }]}>
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{type.difficulty}</Text>
              </View>
            </View>
            <Text style={[styles.desc, { color: theme.colors.muted }]}>{type.description}</Text>
          </View>
          <ChevronRight color={theme.colors.muted} size={20} />
        </Pressable>
      ))}
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
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  thumbnail: {
    width: 74,
    height: 74,
    borderRadius: 18
  },
  copy: {
    flex: 1,
    gap: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900"
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900"
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  }
});
