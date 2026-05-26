import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Pause, Plus, SquareCheckBig, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { images } from "@/data/images";
import { RootStackScreenProps, WorkoutRecord } from "@/types";
import { formatDuration } from "@/utils/format";

export function ActiveWorkoutScreen({ navigation, route }: RootStackScreenProps<"ActiveWorkout">) {
  const { setup } = route.params;
  const [elapsedSeconds, setElapsedSeconds] = useState(route.params.initialElapsedSeconds ?? 0);
  const [currentSet] = useState(route.params.initialSet ?? 1);
  const [reps, setReps] = useState(0);
  const [completedReps] = useState(route.params.initialCompletedReps ?? 0);
  const [paused, setPaused] = useState(false);
  const targetReps = setup.reps * setup.sets;

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [paused]);

  const progressText = useMemo(() => `${completedReps + reps}/${targetReps} reps`, [completedReps, reps, targetReps]);

  const addRep = () => {
    void Haptics.selectionAsync();
    setReps((value) => Math.min(setup.reps, value + 1));
  };

  const finishSet = () => {
    const nextCompletedReps = completedReps + reps;
    if (currentSet >= setup.sets) {
      finishWorkout(nextCompletedReps, setup.sets);
      return;
    }
    navigation.navigate("RestTimer", {
      setup,
      completedSets: currentSet,
      completedReps: nextCompletedReps,
      elapsedSeconds
    });
  };

  const finishWorkout = (totalReps = completedReps + reps, totalSets = currentSet) => {
    const record: WorkoutRecord = {
      id: Date.now().toString(),
      exerciseName: setup.exerciseName,
      completedAt: new Date().toISOString(),
      totalReps,
      totalSets,
      durationSeconds: elapsedSeconds,
      calories: Math.max(24, Math.round(totalReps * 0.7 + elapsedSeconds / 50))
    };
    navigation.replace("WorkoutSummary", { record });
  };

  const leaveWorkout = () => {
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
            <Text style={styles.kicker}>Active workout</Text>
            <Pressable onPress={leaveWorkout} style={styles.closeButton}>
              <X color="#fff" size={22} />
            </Pressable>
          </View>
          <Text style={styles.title}>{setup.exerciseName}</Text>
          <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
        </View>

        <View style={styles.centerCard}>
          <Text style={styles.set}>Set {currentSet} of {setup.sets}</Text>
          <Text style={styles.repCount}>{reps}</Text>
          <Text style={styles.target}>Target {setup.reps} reps - {progressText}</Text>
          <AppButton title="+1 Rep" icon={Plus} onPress={addRep} />
        </View>

        <View style={styles.actions}>
          <AppButton title={paused ? "Resume" : "Pause"} icon={Pause} variant="ghost" onPress={() => setPaused((value) => !value)} style={styles.actionButton} />
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
