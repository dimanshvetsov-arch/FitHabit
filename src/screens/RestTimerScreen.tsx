import * as Haptics from "expo-haptics";
import { SkipForward } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { ProgressRing } from "@/components/ProgressRing";
import { usePreferences } from "@/preferences/PreferencesContext";
import { playFeedbackSound } from "@/services/feedback";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps } from "@/types";

export function RestTimerScreen({ navigation, route }: RootStackScreenProps<"RestTimer">) {
  const { theme } = useThemeMode();
  const { preferences } = usePreferences();
  const { setup, completedSets, completedReps, elapsedSeconds, repsBySet } = route.params;
  const [remaining, setRemaining] = useState(setup.restSeconds);
  const nextRound = completedSets + 1;
  const roundLabel = setup.trackingType === "reps_sets" ? "set" : "round";

  useEffect(() => {
    if (remaining <= 0) {
      if (preferences.hapticFeedback) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (preferences.restTimerSound) {
        void playFeedbackSound("success");
      }
      navigation.replace("ActiveWorkout", {
        setup,
        initialSet: nextRound,
        initialCompletedReps: completedReps,
        initialElapsedSeconds: elapsedSeconds + setup.restSeconds,
        repsBySet
      });
      return;
    }
    if (remaining <= 3 && preferences.restTimerSound) {
      void playFeedbackSound("tick");
    }
    const timeout = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [completedReps, elapsedSeconds, navigation, nextRound, preferences.hapticFeedback, preferences.restTimerSound, remaining, repsBySet, setup]);

  return (
    <AppScreen scroll={false} contentStyle={styles.screen}>
      <View style={styles.backWrap}>
        <HeaderBackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={[styles.kicker, { color: theme.colors.muted }]}>Rest Time</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <ProgressRing progress={(setup.restSeconds - remaining) / setup.restSeconds} size={230} label="rest" />
        <Text style={[styles.timer, { color: theme.colors.text }]}>{remaining}s</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Next {roundLabel} {nextRound} of {setup.sets}</Text>
        {completedReps > 0 ? <Text style={[styles.metaSmall, { color: theme.colors.muted }]}>{completedReps} reps completed - {Math.round(elapsedSeconds / 60)} min in</Text> : null}
      </View>
      <AppButton
        title="Skip Rest"
        icon={SkipForward}
        onPress={() =>
          navigation.replace("ActiveWorkout", {
            setup,
            initialSet: nextRound,
            initialCompletedReps: completedReps,
            initialElapsedSeconds: elapsedSeconds + (setup.restSeconds - remaining),
            repsBySet
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
  backWrap: {
    position: "absolute",
    top: 58,
    left: 22
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
    fontWeight: "800",
    textAlign: "center"
  },
  metaSmall: {
    marginTop: -8,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  }
});
