import { LinearGradient } from "expo-linear-gradient";
import { Dumbbell, LogIn, UserPlus } from "lucide-react-native";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { RootStackScreenProps } from "@/types";
import { useThemeMode } from "@/theme/ThemeProvider";

export function AuthScreen({ navigation }: RootStackScreenProps<"Auth">) {
  const { theme } = useThemeMode();
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, [fade, lift]);

  return (
    <AppScreen contentStyle={styles.content}>
      <Animated.View style={[styles.panel, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <LinearGradient colors={[`${theme.colors.primary}44`, `${theme.colors.secondary}16`]} style={[styles.logo, { borderColor: theme.colors.border }]}>
          <Dumbbell color="#fff" size={42} strokeWidth={2.8} />
        </LinearGradient>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>FitHabit</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Log in or create a local account to keep your workouts, streak, and goals private on this device.</Text>
        </View>
        <View style={styles.actions}>
          <AppButton title="Log In" icon={LogIn} onPress={() => navigation.navigate("Login")} />
          <AppButton title="Create Account" icon={UserPlus} variant="ghost" onPress={() => navigation.navigate("CreateAccount")} />
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    minHeight: "100%"
  },
  panel: {
    gap: 24
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 }
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 23
  },
  actions: {
    gap: 12
  }
});
