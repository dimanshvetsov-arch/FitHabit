import { Minus, Plus, TimerReset } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { actionFeedback, playFeedbackSound } from "@/services/feedback";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps } from "@/types";
import { useState } from "react";

type StepperProps = {
  label: string;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
  min: number;
  step: number;
};

function Stepper({ label, value, unit, onChange, min, step }: StepperProps) {
  const { theme } = useThemeMode();

  return (
    <View style={[styles.stepper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.stepperLabel, { color: theme.colors.muted }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          style={[styles.roundButton, { backgroundColor: theme.colors.cardSoft }]}
          onPress={() => {
            void playFeedbackSound("tap");
            onChange(Math.max(min, value - step));
          }}
        >
          <Minus color={theme.colors.text} size={18} />
        </Pressable>
        <Text style={[styles.stepperValue, { color: theme.colors.text }]}>{value}{unit ?? ""}</Text>
        <Pressable
          style={[styles.roundButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            void playFeedbackSound("tap");
            onChange(value + step);
          }}
        >
          <Plus color="#fff" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

export function WorkoutSetupScreen({ navigation, route }: RootStackScreenProps<"WorkoutSetup">) {
  const { theme } = useThemeMode();
  const [reps, setReps] = useState(12);
  const [sets, setSets] = useState(4);
  const [restSeconds, setRestSeconds] = useState(60);
  const [notes, setNotes] = useState("");
  const exerciseName = route.params.variantName ?? route.params.exerciseName;

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{exerciseName}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Set the target, keep the reps honest, and let FitHabit handle the rhythm.</Text>
      </View>

      <Stepper label="Reps per set" value={reps} min={1} step={1} onChange={setReps} />
      <Stepper label="Sets" value={sets} min={1} step={1} onChange={setSets} />
      <Stepper label="Rest timer" value={restSeconds} unit="s" min={15} step={15} onChange={setRestSeconds} />

      <View style={[styles.notesCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.stepperLabel, { color: theme.colors.muted }]}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Tempo, form cue, or goal for this session"
          placeholderTextColor={theme.colors.muted}
          style={[styles.notes, { color: theme.colors.text }]}
        />
      </View>

      <AppButton
        title="Start Workout"
        icon={TimerReset}
        onPress={() => {
          void actionFeedback("start");
          navigation.navigate("ActiveWorkout", {
            setup: {
              exerciseId: route.params.exerciseId,
              exerciseName,
              reps,
              sets,
              restSeconds,
              notes
            }
          });
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  stepper: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 16
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  stepperValue: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0
  },
  notesCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    minHeight: 150,
    gap: 10
  },
  notes: {
    flex: 1,
    minHeight: 88,
    textAlignVertical: "top",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21
  }
});
