import { LinearGradient } from "expo-linear-gradient";
import { Pause, Save, SquareCheckBig, X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ImageBackground, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { images } from "@/data/images";
import { actionFeedback, playFeedbackSound } from "@/services/feedback";
import { RootStackScreenProps, WorkoutRecord } from "@/types";
import { formatDuration } from "@/utils/format";

export function ActiveWorkoutScreen({ navigation, route }: RootStackScreenProps<"ActiveWorkout">) {
  const { setup } = route.params;
  const [elapsedSeconds, setElapsedSeconds] = useState(route.params.initialElapsedSeconds ?? 0);
  const [currentSet] = useState(route.params.initialSet ?? 1);
  const [completedReps] = useState(route.params.initialCompletedReps ?? 0);
  const [repsBySet] = useState<number[]>(route.params.repsBySet ?? []);
  const [roundSeconds, setRoundSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [repInput, setRepInput] = useState("");
  const finishedRef = useRef(false);
  const needsRepInput = setup.trackingType === "reps_sets" || setup.trackingType === "reps_timer";
  const roundLabel = setup.trackingType === "reps_sets" ? "Set" : "Round";
  const primaryTimer = setup.trackingType === "distance_time" ? setup.goalTimeSeconds ?? 0 : setup.durationSeconds ?? 30;
  const timerRemaining = Math.max(0, primaryTimer - roundSeconds);

  useEffect(() => {
    if (paused || repModalOpen || finishedRef.current) return;
    const interval = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
      setRoundSeconds((value) => value + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, repModalOpen]);

  useEffect(() => {
    if (finishedRef.current || primaryTimer <= 0 || roundSeconds < primaryTimer) return;
    if (needsRepInput) {
      setPaused(true);
      setRepModalOpen(true);
      void playFeedbackSound("success");
      return;
    }
    finishRound(completedReps, repsBySet);
  }, [completedReps, needsRepInput, primaryTimer, repsBySet, roundSeconds]);

  const totalPlanned = useMemo(() => setup.sets, [setup.sets]);

  const saveSetReps = () => {
    const reps = Math.max(0, Number(repInput) || 0);
    const nextRepsBySet = [...repsBySet, reps];
    const nextCompletedReps = completedReps + reps;
    setRepModalOpen(false);
    setRepInput("");
    finishRound(nextCompletedReps, nextRepsBySet);
  };

  const finishRound = (nextCompletedReps = completedReps, nextRepsBySet = repsBySet) => {
    if (finishedRef.current) return;
    if (currentSet >= setup.sets) {
      void actionFeedback("success");
      finishWorkout(nextCompletedReps, setup.sets, nextRepsBySet);
      return;
    }
    void actionFeedback("success");
    navigation.navigate("RestTimer", {
      setup,
      completedSets: currentSet,
      completedReps: nextCompletedReps,
      elapsedSeconds,
      repsBySet: nextRepsBySet
    });
  };

  const finishWorkout = (totalReps = completedReps, totalSets = currentSet, finalRepsBySet = repsBySet) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const durationSeconds = Math.max(1, elapsedSeconds);
    const totalMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
    const timerOnly = setup.trackingType === "timer_only";
    const repsWorkout = setup.trackingType === "reps_sets" || setup.trackingType === "reps_timer";
    const timedRoundsWorkout = timerOnly || setup.trackingType === "reps_timer";
    const record: WorkoutRecord = {
      id: `workout_${Date.now()}`,
      exerciseName: setup.exerciseName,
      variationName: setup.variationName,
      trackingType: repsWorkout ? "timed_reps" : setup.trackingType,
      completedAt: new Date().toISOString(),
      setDurationSeconds: repsWorkout ? setup.durationSeconds : undefined,
      restTimeSeconds: setup.restSeconds,
      setsCompleted: setup.trackingType === "reps_sets" ? totalSets : undefined,
      roundsCompleted: timedRoundsWorkout ? totalSets : undefined,
      repsBySet: repsWorkout ? finalRepsBySet : undefined,
      totalSeconds: timedRoundsWorkout ? totalSets * (setup.durationSeconds ?? 0) : undefined,
      totalMinutes,
      totalReps: repsWorkout ? totalReps : 0,
      completedSets: totalSets,
      totalSets,
      targetReps: 0,
      targetSets: setup.sets,
      durationSeconds,
      calories: Math.max(24, Math.round(totalReps * 0.7 + durationSeconds / 50 + (setup.distance ?? 0) * 55)),
      routineDate: setup.routineDate,
      routineItemId: setup.routineItemId
    };
    navigation.replace("WorkoutSummary", { record });
  };

  const leaveWorkout = () => {
    void actionFeedback("warning");
    Alert.alert("Leave workout?", "This active session will not be saved.", [
      { text: "Stay", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: () => navigation.navigate("MainTabs") }
    ]);
  };

  return (
    <ImageBackground source={{ uri: images.workoutGym }} style={styles.background}>
      <LinearGradient colors={["rgba(13,17,23,0.64)", "rgba(13,17,23,0.96)"]} style={styles.overlay}>
        <View style={styles.top}>
          <View style={styles.topBar}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <Text style={styles.kicker}>Active workout</Text>
            <Pressable onPress={leaveWorkout} style={styles.closeButton}>
              <X color="#fff" size={22} />
            </Pressable>
          </View>
          <Text style={styles.title}>{setup.variationName ?? setup.exerciseName}</Text>
          <Text style={styles.timer}>{formatDuration(timerRemaining)}</Text>
        </View>

        <View style={styles.centerCard}>
          <Text style={styles.set}>{roundLabel} {currentSet} of {totalPlanned}</Text>
          <Text style={styles.target}>{needsRepInput ? "Go for quality reps until the timer ends." : "Hold steady until the timer ends."}</Text>
          {needsRepInput ? <Text style={styles.repsMeta}>{completedReps} reps logged so far</Text> : null}
        </View>

        <View style={styles.actions}>
          <AppButton
            title={paused ? "Resume" : "Pause"}
            icon={Pause}
            variant="ghost"
            onPress={() => {
              const next = !paused;
              setPaused(next);
              void playFeedbackSound(next ? "warning" : "start");
            }}
            style={styles.actionButton}
          />
          <AppButton title={currentSet >= setup.sets ? "Finish" : "Finish Round"} icon={SquareCheckBig} variant="success" onPress={() => needsRepInput ? setRepModalOpen(true) : finishRound()} style={styles.actionButton} />
        </View>

        <Modal visible={repModalOpen} transparent animationType="fade" onRequestClose={() => setRepModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>How many reps did you complete?</Text>
              <Text style={styles.modalSubtitle}>{roundLabel} {currentSet} of {setup.sets}</Text>
              <TextInput
                value={repInput}
                onChangeText={setRepInput}
                keyboardType="number-pad"
                autoFocus
                placeholder="0"
                placeholderTextColor="rgba(249,250,251,0.32)"
                style={styles.repInput}
              />
              <AppButton title="Save reps" icon={Save} onPress={saveSetReps} />
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, padding: 22, paddingTop: 66, justifyContent: "space-between" },
  top: { gap: 8 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closeButton: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  kicker: { color: "rgba(249,250,251,0.72)", fontWeight: "800" },
  title: { color: "#fff", fontSize: 34, fontWeight: "900", letterSpacing: 0 },
  timer: { color: "#fff", fontSize: 72, fontWeight: "900", letterSpacing: 0 },
  centerCard: { borderRadius: 30, padding: 24, backgroundColor: "rgba(31,41,55,0.82)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", gap: 18 },
  set: { color: "rgba(249,250,251,0.72)", fontSize: 16, fontWeight: "900" },
  target: { color: "#fff", fontSize: 18, fontWeight: "900", textAlign: "center", lineHeight: 25 },
  repsMeta: { color: "rgba(249,250,251,0.72)", fontSize: 15, fontWeight: "800", textAlign: "center" },
  actions: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center", padding: 22 },
  modalCard: { width: "100%", maxWidth: 420, borderRadius: 28, backgroundColor: "#1F2937", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 20, gap: 14 },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center", letterSpacing: 0 },
  modalSubtitle: { color: "rgba(249,250,251,0.66)", fontSize: 13, fontWeight: "800", textAlign: "center" },
  repInput: { minHeight: 72, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", textAlign: "center", fontSize: 34, fontWeight: "900" }
});
