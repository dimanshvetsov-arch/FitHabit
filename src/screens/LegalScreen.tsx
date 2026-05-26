import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps } from "@/types";

export function LegalScreen({ route }: RootStackScreenProps<"PrivacyPolicy"> | RootStackScreenProps<"Terms">) {
  const { theme } = useThemeMode();
  const isPrivacy = route.name === "PrivacyPolicy";

  return (
    <AppScreen>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{isPrivacy ? "Privacy Policy" : "Terms"}</Text>
        <Text style={[styles.body, { color: theme.colors.muted }]}>
          {isPrivacy
            ? "FitHabit stores your preferences and workout history locally on this device with AsyncStorage. No account data is sent to a server by this demo app."
            : "FitHabit is a workout habit demo. Use good form, choose safe targets, and stop any workout that causes pain or dizziness."}
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12
  },
  title: {
    fontSize: 26,
    fontWeight: "900"
  },
  body: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22
  }
});
