import { Camera } from "lucide-react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppButton } from "@/components/AppButton";
import { usePreferences } from "@/preferences/PreferencesContext";
import { useThemeMode } from "@/theme/ThemeProvider";

export function ProfileEditScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { theme } = useThemeMode();
  const { preferences, updatePreference } = usePreferences();

  return (
    <AppScreen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>User name</Text>
        <TextInput
          value={preferences.userName}
          onChangeText={(value) => void updatePreference("userName", value)}
          placeholder="Your name"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
        />
        <Text style={[styles.label, { color: theme.colors.muted }]}>Profile photo URL</Text>
        <TextInput
          value={preferences.profilePhoto}
          onChangeText={(value) => void updatePreference("profilePhoto", value)}
          placeholder="https://..."
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
        />
      </View>
      <AppButton title="Done" icon={Camera} onPress={navigation.goBack} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "900"
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12
  },
  label: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700"
  }
});
