import { Minus, Plus, TimerReset } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { exercises } from "@/data/mockData";
import { usePreferences } from "@/preferences/PreferencesContext";
import { actionFeedback, playFeedbackSound } from "@/services/feedback";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackScreenProps, TrackingType, WorkoutSetup } from "@/types";
import { formatDuration } from "@/utils/format";

type StepperProps = {
  label: string;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
  min: number;
  step: number;
  displayValue?: string;
};

function Stepper({ label, value, unit, onChange, min, step, displayValue }: StepperProps) {
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
        <Text style={[styles.stepperValue, { color: theme.colors.text }]}>{displayValue ?? `${value}${unit ?? ""}`}</Text>
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

function trackingCopy(type: TrackingType) {
  switch (type) {
    case "timer_only":
      return "Choose hold duration, rest, and rounds. No reps needed.";
    case "distance_time":
      return "Set distance and goal time. FitHabit calculates the pace.";
    case "reps_timer":
      return "Choose timed rounds and an optional rep goal.";
    default:
      return "Choose set duration, number of sets, rest time, and notes.";
  }
}

export function WorkoutSetupScreen({ navigation, route }: RootStackScreenProps<"WorkoutSetup">) {
  const { theme } = useThemeMode();
  const { preferences } = usePreferences();
  const exercise = exercises.find((item) => item.id === route.params.exerciseId);
  const trackingType = exercise?.trackingType ?? "reps_sets";
  const exerciseName = route.params.variantName ?? route.params.exerciseName;

  const [reps, setReps] = useState(route.params.targetReps ?? preferences.defaultReps);
  const [sets, setSets] = useState(route.params.targetSets ?? preferences.defaultSets);
  const [restSeconds, setRestSeconds] = useState(route.params.restSeconds ?? preferences.defaultRestSeconds);
  const [durationSeconds, setDurationSeconds] = useState(route.params.durationSeconds ?? (trackingType === "timer_only" ? preferences.defaultPlankSeconds : 30));
  const [rounds, setRounds] = useState(route.params.rounds ?? 3);
  const [distance, setDistance] = useState(String(route.params.distance ?? 3));
  const [goalMinutes, setGoalMinutes] = useState(String(Math.round((route.params.goalTimeSeconds ?? 1500) / 60)));
  const [repsGoal, setRepsGoal] = useState(route.params.repsGoal ?? 60);
  const [weight, setWeight] = useState(0);
  const [notes, setNotes] = useState("");

  const pace = useMemo(() => {
    const distanceValue = Number(distance);
    const minutesValue = Number(goalMinutes);
    if (!distanceValue || !minutesValue) return "Set distance and time";
    return `${(minutesValue / distanceValue).toFixed(1)} min/${preferences.distanceUnit}`;
  }, [distance, goalMinutes, preferences.distanceUnit]);

  const startWorkout = () => {
    const distanceValue = Math.max(0, Number(distance) || 0);
    const goalTimeSeconds = Math.max(60, (Number(goalMinutes) || 0) * 60);
    const effectiveSets = trackingType === "reps_sets" ? sets : trackingType === "distance_time" ? 1 : rounds;
    const effectiveReps = trackingType === "reps_sets" || trackingType === "reps_timer" ? 0 : 1;
    const setup: WorkoutSetup = {
      exerciseId: route.params.exerciseId,
      exerciseName: route.params.exerciseName,
      variationName: route.params.variantName ?? route.params.exerciseName,
      trackingType,
      reps: effectiveReps,
      sets: effectiveSets,
      restSeconds,
      notes,
      durationSeconds,
      rounds: effectiveSets,
      distance: distanceValue,
      goalTimeSeconds,
      repsGoal: trackingType === "reps_timer" ? repsGoal : undefined,
      routineDate: route.params.routineDate,
      routineItemId: route.params.routineItemId
    };

    void actionFeedback("start");
    navigation.navigate("ActiveWorkout", { setup });
  };

  return (
    <AppScreen>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{exerciseName}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{trackingCopy(trackingType)}</Text>
      </View>

      <View style={[styles.typePill, { backgroundColor: `${theme.colors.primary}22`, borderColor: theme.colors.border }]}>
        <Text style={[styles.typeText, { color: theme.colors.primary }]}>{trackingType.replace("_", " ").toUpperCase()}</Text>
      </View>

      {trackingType === "reps_sets" ? (
        <>
          <Stepper label="Set duration" value={durationSeconds} min={10} step={5} onChange={setDurationSeconds} displayValue={formatDuration(durationSeconds)} />
          <Stepper label="Sets" value={sets} min={1} step={1} onChange={setSets} />
          <Stepper label="Rest timer" value={restSeconds} unit="s" min={15} step={15} onChange={setRestSeconds} />
          {exercise?.category === "Gym" ? <Stepper label={`Training weight (${preferences.weightUnit})`} value={weight} min={0} step={5} onChange={setWeight} unit={preferences.weightUnit} /> : null}
        </>
      ) : null}

      {trackingType === "timer_only" ? (
        <>
          <Stepper label="Duration" value={durationSeconds} min={10} step={5} onChange={setDurationSeconds} displayValue={formatDuration(durationSeconds)} />
          <Stepper label="Rest timer" value={restSeconds} unit="s" min={15} step={15} onChange={setRestSeconds} />
          <Stepper label="Rounds" value={rounds} min={1} step={1} onChange={setRounds} />
        </>
      ) : null}

      {trackingType === "distance_time" ? (
        <>
          <View style={[styles.inputCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.stepperLabel, { color: theme.colors.muted }]}>Distance</Text>
            <View style={styles.inlineInput}>
              <TextInput value={distance} onChangeText={setDistance} keyboardType="decimal-pad" style={[styles.bigInput, { color: theme.colors.text }]} />
              <Text style={[styles.inputUnit, { color: theme.colors.muted }]}>{preferences.distanceUnit}</Text>
            </View>
          </View>
          <View style={[styles.inputCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.stepperLabel, { color: theme.colors.muted }]}>Goal time</Text>
            <View style={styles.inlineInput}>
              <TextInput value={goalMinutes} onChangeText={setGoalMinutes} keyboardType="number-pad" style={[styles.bigInput, { color: theme.colors.text }]} />
              <Text style={[styles.inputUnit, { color: theme.colors.muted }]}>min</Text>
            </View>
          </View>
          <View style={[styles.paceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.stepperLabel, { color: theme.colors.muted }]}>Pace</Text>
            <Text style={[styles.paceValue, { color: theme.colors.green }]}>{pace}</Text>
          </View>
        </>
      ) : null}

      {trackingType === "reps_timer" ? (
        <>
          <Stepper label="Duration" value={durationSeconds} min={10} step={5} onChange={setDurationSeconds} displayValue={formatDuration(durationSeconds)} />
          <Stepper label="Rounds" value={rounds} min={1} step={1} onChange={setRounds} />
          <Stepper label="Rest timer" value={restSeconds} unit="s" min={15} step={15} onChange={setRestSeconds} />
        </>
      ) : null}

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

      <AppButton title="Start Workout" icon={TimerReset} onPress={startWorkout} />
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
  typePill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  typeText: {
    fontSize: 12,
    fontWeight: "900"
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
  inputCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12
  },
  inlineInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10
  },
  bigInput: {
    minWidth: 100,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0,
    padding: 0
  },
  inputUnit: {
    paddingBottom: 6,
    fontSize: 16,
    fontWeight: "900"
  },
  paceCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 8
  },
  paceValue: {
    fontSize: 30,
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
