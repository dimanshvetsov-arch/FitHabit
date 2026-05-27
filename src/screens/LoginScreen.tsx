import { LogIn } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/auth/AuthContext";
import { useThemeMode } from "@/theme/ThemeProvider";

export function LoginScreen() {
  const { theme } = useThemeMode();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const result = await login(username, password);
    if (!result.ok) {
      setError(result.error ?? "Incorrect username or password");
      return;
    }
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Log in</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Continue with your local FitHabit account.</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={theme.colors.muted} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />
        <PasswordInput value={password} onChangeText={setPassword} placeholder="Password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <AppButton title="Log In" icon={LogIn} onPress={submit} />
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
