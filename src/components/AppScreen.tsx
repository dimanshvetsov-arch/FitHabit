import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeMode } from "@/theme/ThemeProvider";

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
}>;

export function AppScreen({ children, scroll = true, contentStyle }: Props) {
  const { theme } = useThemeMode();

  if (!scroll) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }, contentStyle]}>{children}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  content: {
    padding: 20,
    paddingBottom: 110,
    gap: 18
  }
});
