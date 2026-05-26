import { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useThemeMode } from "@/theme/ThemeProvider";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string;
};

export function MetricCard({ label, value, icon: Icon, color }: Props) {
  const { theme } = useThemeMode();
  const accent = color ?? theme.colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={[styles.icon, { backgroundColor: `${accent}22` }]}>
        <Icon color={accent} size={20} />
      </View>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    justifyContent: "space-between"
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  value: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  label: {
    fontSize: 13,
    fontWeight: "700"
  }
});
