import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps } from "@/types";

export function CalendarDayDetailScreen({ route }: RootStackScreenProps<"CalendarDayDetail">) {
  const { theme } = useThemeMode();

  return (
    <AppScreen>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{route.params.date}</Text>
        <Text style={[styles.body, { color: theme.colors.muted }]}>Workout details for this day will appear here after completed sessions.</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 8
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  body: {
    fontSize: 15,
    fontWeight: "700"
  }
});
