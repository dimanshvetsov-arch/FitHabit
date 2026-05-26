import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { useAuth } from "@/auth/AuthContext";
import { RootStackScreenProps } from "@/types";
import { useThemeMode } from "@/theme/ThemeProvider";

export function CreateAccountScreen({ navigation }: RootStackScreenProps<"CreateAccount">) {
  const { theme } = useThemeMode();
  const { createAccount } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (confirm !== password) {
      setError("Confirm password must match password");
      return;
    }
    const result = await createAccount(username, password);
    if (!result.ok) {
      setError(result.error ?? "Could not create account");
      return;
    }
    navigation.replace("GoalsSetup");
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Set up your local FitHabit profile before entering the app.</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={theme.colors.muted} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry placeholderTextColor={theme.colors.muted} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />
        <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirm password" secureTextEntry placeholderTextColor={theme.colors.muted} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <AppButton title="Continue" onPress={submit} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center", minHeight: "100%" },
  title: { fontSize: 36, fontWeight: "900", letterSpacing: 0 },
  subtitle: { marginTop: 8, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 24, padding: 18, gap: 12 },
  input: { borderWidth: 1, borderRadius: 16, minHeight: 54, paddingHorizontal: 14, fontSize: 16, fontWeight: "700" },
  error: { color: "#EF4444", fontSize: 13, fontWeight: "800" }
});
