import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { useThemeMode } from "@/theme/ThemeProvider";

type Props = {
  onPress: () => void;
};

export function HeaderBackButton({ onPress }: Props) {
  const { theme } = useThemeMode();

  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <ChevronLeft color={theme.colors.text} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
