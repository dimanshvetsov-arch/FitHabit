import { LinearGradient } from "expo-linear-gradient";
import { Pause, Plus, SquareCheckBig, X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { images } from "@/data/images";
import { actionFeedback, playFeedbackSound, tapFeedback } from "@/services/feedback";
import { RootStackScreenProps, WorkoutRecord } from "@/types";
import { formatDuration } from "@/utils/format";

export function ActiveWorkoutScreen({ navigation, route }: RootStackScreenProps<"ActiveWorkout">) {
  const { setup } = route.params;
  const [elapsedSeconds, setElapsedSeconds] = useState(route.params.initialElapsedSeconds ?? 0);
  const [currentSet] = useState(route.params.initialSet ?? 1);
  const [reps, setReps] = useState(0);
  const [completedReps] = useState(route.params.initialCompletedReps ?? 0);
  const [roundSeconds, setRoundSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const finishedRef = useRef(false);
  const targetReps = setup.reps * setup.sets;
  const isRepBased = setup.trackingType === "reps_sets" || setup.trackingType === "reps_timer";
  const roundLabel = setup.trackingType === "reps_sets" ? "Set" : "Round";
  const primaryTimer = setup.trackingType === "distance_time" ? setup.goalTimeSeconds ?? 0 : setup.durationSeconds ?? 0;

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
      setRoundSeconds((value) => value + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]);

  const progressText = useMemo(() => `${completedReps + reps}/${targetReps} reps`, [completedReps, reps, targetReps]);
  const timerRemaining = primaryTimer > 0 ? Math.max(0, primaryTimer - roundSeconds) : 0;

  useEffect(() => {
    if (finishedRef.current || primaryTimer <= 0 || setup.trackingType === "reps_sets") return;
    if (roundSeconds >= primaryTimer) {
      finishSet(completedReps + reps);
    }
  }, [completedReps, primaryTimer, reps, roundSeconds, setup.trackingType]);

  const addRep = () => {
    void tapFeedback();
    const nextReps = Math.min(setup.reps, reps + 1);
    if (nextReps >= setup.reps) {
      void playFeedbackSound("success");
      setReps(nextReps);
      finishSet(completedReps + nextReps);
      return;
    }
    setReps(nextReps);
  };

  const finishSet = (nextCompletedReps = completedReps + reps) => {
    if (finishedRef.current) return;
    if (currentSet >= setup.sets) {
      void actionFeedback("success");
      finishWorkout(nextCompletedReps, setup.sets);
      return;
    }
    void actionFeedback("success");
    navigation.navigate("RestTimer", {
      setup,
      completedSets: currentSet,
      completedReps: nextCompletedReps,
      elapsedSeconds
    });
  };

  const finishWorkout = (totalReps = completedReps + reps, totalSets = currentSet) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const durationSeconds = Math.max(1, elapsedSeconds);
    const totalMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
    const record: WorkoutRecord = {
      id: Date.now().toString(),
      exerciseName: setup.exerciseName,
      variationName: setup.variationName,
      trackingType: setup.trackingType,
      completedAt: new Date().toISOString(),
      totalMinutes,
      totalReps: setup.trackingType === "distance_time" || setup.trackingType === "timer_only" ? 0 : totalReps,
      completedSets: totalSets,
      totalSets,
      targetReps: setup.reps,
      targetSets: setup.sets,
      durationSeconds,
      calories: Math.max(24, Math.round(totalReps * 0.7 + durationSeconds / 50 + (setup.distance ?? 0) * 55))
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
          <Text style={styles.timer}>{primaryTimer > 0 ? formatDuration(timerRemaining) : formatDuration(elapsedSeconds)}</Text>
        </View>

        <View style={styles.centerCard}>
          <Text style={styles.set}>{roundLabel} {currentSet} of {setup.sets}</Text>
          {setup.trackingType === "distance_time" ? (
            <>
              <Text style={styles.repCount}>{setup.distance ?? 0}</Text>
              <Text style={styles.target}>km goal - {formatDuration(elapsedSeconds)} elapsed</Text>
            </>
          ) : isRepBased ? (
            <>
              <Text style={styles.repCount}>{reps}</Text>
              <Text style={styles.target}>{setup.trackingType === "reps_timer" ? `${formatDuration(setup.durationSeconds ?? 0)} round` : `Target ${setup.reps} reps`} - {progressText}</Text>
              <AppButton title="+1 Rep" icon={Plus} onPress={addRep} />
            </>
          ) : (
            <>
              <Text style={styles.repCount}>{formatDuration(timerRemaining)}</Text>
              <Text style={styles.target}>{formatDuration(elapsedSeconds)} elapsed - hold steady</Text>
            </>
          )}
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
          <AppButton title={currentSet >= setup.sets ? "Finish" : "Finish Set"} icon={SquareCheckBig} variant="success" onPress={finishSet} style={styles.actionButton} />
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  overlay: {
    flex: 1,
    padding: 22,
    paddingTop: 66,
    justifyContent: "space-between"
  },
  top: {
    gap: 8
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  kicker: {
    color: "rgba(249,250,251,0.72)",
    fontWeight: "800"
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0
  },
  timer: {
    color: "#fff",
    fontSize: 58,
    fontWeight: "900",
    letterSpacing: 0
  },
  centerCard: {
    borderRadius: 30,
    padding: 24,
    backgroundColor: "rgba(31,41,55,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 18
  },
  set: {
    color: "rgba(249,250,251,0.72)",
    fontSize: 16,
    fontWeight: "900"
  },
  repCount: {
    color: "#fff",
    fontSize: 112,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0
  },
  target: {
    color: "rgba(249,250,251,0.72)",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  },
  actions: {
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1
  }
});
