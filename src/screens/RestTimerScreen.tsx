import * as Haptics from "expo-haptics";
import { SkipForward } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { ProgressRing } from "@/components/ProgressRing";
import { playFeedbackSound } from "@/services/feedback";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps } from "@/types";

export function RestTimerScreen({ navigation, route }: RootStackScreenProps<"RestTimer">) {
  const { theme } = useThemeMode();
  const { setup, completedSets, completedReps, elapsedSeconds } = route.params;
  const [remaining, setRemaining] = useState(setup.restSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void playFeedbackSound("success");
      navigation.replace("ActiveWorkout", {
        setup,
        initialSet: completedSets + 1,
        initialCompletedReps: completedReps,
        initialElapsedSeconds: elapsedSeconds + setup.restSeconds
      });
      return;
    }
    if (remaining <= 3) {
      void playFeedbackSound("tick");
    }
    const timeout = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [navigation, remaining, setup]);

  return (
    <AppScreen scroll={false} contentStyle={styles.screen}>
      <Text style={[styles.kicker, { color: theme.colors.muted }]}>Rest before set {completedSets + 1}</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <ProgressRing progress={(setup.restSeconds - remaining) / setup.restSeconds} size={230} label="rest" />
        <Text style={[styles.timer, { color: theme.colors.text }]}>{remaining}s</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>{completedReps} reps completed · {Math.round(elapsedSeconds / 60)} min in</Text>
      </View>
      <AppButton
        title="Skip Rest"
        icon={SkipForward}
        onPress={() =>
          navigation.replace("ActiveWorkout", {
            setup,
            initialSet: completedSets + 1,
            initialCompletedReps: completedReps,
            initialElapsedSeconds: elapsedSeconds + (setup.restSeconds - remaining)
          })
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 22,
    justifyContent: "center",
    gap: 28
  },
  kicker: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900"
  },
  card: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    gap: 18
  },
  timer: {
    fontSize: 58,
    fontWeight: "900",
    letterSpacing: 0
  },
  meta: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  }
});
