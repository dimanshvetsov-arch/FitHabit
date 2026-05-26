import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useThemeMode } from "@/theme/ThemeProvider";

type Props = {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "ghost" | "success" | "danger";
  style?: ViewStyle;
};

export function AppButton({ title, onPress, icon: Icon, variant = "primary", style }: Props) {
  const { theme } = useThemeMode();
  const isPrimary = variant === "primary";
  const background = variant === "success" ? theme.colors.green : variant === "danger" ? "#EF4444" : theme.colors.cardSoft;

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed, style]}
    >
      {isPrimary ? (
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
          {Icon ? <Icon color="#fff" size={19} strokeWidth={2.5} /> : null}
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>
      ) : (
        <LinearGradient colors={[background, background]} style={[styles.inner, { borderColor: theme.colors.border, borderWidth: 1 }]}>
          {Icon ? <Icon color={theme.colors.text} size={19} strokeWidth={2.5} /> : null}
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 18,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  },
  inner: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0
  }
});
