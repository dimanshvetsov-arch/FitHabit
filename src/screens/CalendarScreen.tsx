import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Check, ChevronDown, ChevronUp, Copy, GripVertical, Medal, Pencil, Plus, Search, Trash2, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { exercises } from "@/data/mockData";
import { useWorkouts } from "@/hooks/useWorkouts";
import { usePreferences } from "@/preferences/PreferencesContext";
import { dateKey, dayKeyFromDate, RoutineDayKey, routineDays, RoutineItem, useRoutine } from "@/routine/RoutineContext";
import { useThemeMode } from "@/theme/ThemeProvider";
import { RootStackParamList, TrackingType } from "@/types";
import { formatDuration } from "@/utils/format";

type DraftRoutineItem = Omit<RoutineItem, "id">;

const dayLabels = Object.fromEntries(routineDays.map((day) => [day.key, day.label])) as Record<RoutineDayKey, string>;

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function weekDates(selectedDate: string) {
  const selected = new Date(`${selectedDate}T12:00:00`);
  const mondayOffset = (selected.getDay() + 6) % 7;
  const monday = addDays(selected, -mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function monthTitle(date: string) {
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function formatTarget(item: RoutineItem | DraftRoutineItem, distanceUnit: string) {
  switch (item.trackingType) {
    case "timer_only":
      return `${formatDuration(item.durationSeconds ?? 45)} x ${item.rounds ?? 3} rounds`;
    case "distance_time":
      return `${item.distance ?? 3} ${distanceUnit} in ${formatDuration(item.goalTimeSeconds ?? 1500)}`;
    case "reps_timer":
      return `${formatDuration(item.durationSeconds ?? 30)} x ${item.rounds ?? 3} rounds${item.repsGoal ? ` - ${item.repsGoal} reps` : ""}`;
    default:
      return `${item.targetReps ?? 12} reps x ${item.targetSets ?? 3} sets`;
  }
}

function createDraft(exercise = exercises[0], variation = exercise.variations[0], defaults = { reps: 12, sets: 3, rest: 60, plank: 45 }): DraftRoutineItem {
  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    variationName: variation,
    trackingType: exercise.trackingType,
    targetReps: defaults.reps,
    targetSets: defaults.sets,
    restTime: defaults.rest,
    durationSeconds: exercise.trackingType === "timer_only" ? defaults.plank : 30,
    rounds: 3,
    distance: 3,
    goalTimeSeconds: 1500,
    repsGoal: exercise.trackingType === "reps_timer" ? 60 : undefined
  };
}

function Stepper({ label, value, onChange, step = 1, min = 0, suffix }: { label: string; value: number; onChange: (value: number) => void; step?: number; min?: number; suffix?: string }) {
  const { theme } = useThemeMode();
  return (
    <View style={[styles.modalField, { backgroundColor: theme.colors.cardSoft }]}>
      <Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable onPress={() => onChange(Math.max(min, value - step))} style={[styles.miniButton, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.miniText, { color: theme.colors.text }]}>-</Text>
        </Pressable>
        <Text style={[styles.stepperValue, { color: theme.colors.text }]}>{value}{suffix ?? ""}</Text>
        <Pressable onPress={() => onChange(value + step)} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.miniText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useThemeMode();
  const { preferences } = usePreferences();
  const { stats } = useWorkouts();
  const {
    selectedDate,
    setSelectedDate,
    getRoutineForDate,
    getCompletionForDate,
    addRoutineItem,
    updateRoutineItem,
    deleteRoutineItem,
    reorderRoutineItems,
    duplicateDayRoutine,
    clearDayRoutine,
    markRoutineItemCompleted
  } = useRoutine();
  const [modalOpen, setModalOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<DraftRoutineItem>(() => createDraft(exercises[0], exercises[0].variations[0], { reps: preferences.defaultReps, sets: preferences.defaultSets, rest: preferences.defaultRestSeconds, plank: preferences.defaultPlankSeconds }));
  const today = dateKey(new Date());

  useEffect(() => {
    if (selectedDate < today) {
      setSelectedDate(today);
    }
  }, [selectedDate, setSelectedDate, today]);

  const selectedDay = dayKeyFromDate(selectedDate);
  const routine = getRoutineForDate(selectedDate);
  const completion = getCompletionForDate(selectedDate);
  const completedCount = routine.filter((item) => completion[item.id]).length;
  const progress = routine.length ? completedCount / routine.length : 0;
  const filteredExercises = exercises.filter((exercise) => exercise.name.toLowerCase().includes(search.toLowerCase()) || exercise.category.toLowerCase().includes(search.toLowerCase()));

  const openAddModal = () => {
    setEditingItem(null);
    setDraft(createDraft(exercises[0], exercises[0].variations[0], { reps: preferences.defaultReps, sets: preferences.defaultSets, rest: preferences.defaultRestSeconds, plank: preferences.defaultPlankSeconds }));
    setSearch("");
    setModalOpen(true);
  };

  const openEditModal = (item: RoutineItem) => {
    setEditingItem(item);
    setDraft({ ...item });
    setSearch("");
    setModalOpen(true);
  };

  const selectExercise = (exerciseId: string) => {
    const exercise = exercises.find((item) => item.id === exerciseId) ?? exercises[0];
    setDraft(createDraft(exercise, exercise.variations[0], { reps: preferences.defaultReps, sets: preferences.defaultSets, rest: preferences.defaultRestSeconds, plank: preferences.defaultPlankSeconds }));
  };

  const saveRoutineItem = async () => {
    if (editingItem) {
      await updateRoutineItem(selectedDay, { ...draft, id: editingItem.id });
    } else {
      await addRoutineItem(selectedDay, draft);
    }
    setModalOpen(false);
  };

  const startRoutineWorkout = (item: RoutineItem) => {
    navigation.navigate("WorkoutSetup", {
      exerciseId: item.exerciseId,
      exerciseName: item.exerciseName,
      variantName: item.variationName,
      routineDate: selectedDate,
      routineItemId: item.id,
      targetReps: item.targetReps,
      targetSets: item.targetSets,
      restSeconds: item.restTime,
      durationSeconds: item.durationSeconds,
      rounds: item.rounds,
      distance: item.distance,
      goalTimeSeconds: item.goalTimeSeconds,
      repsGoal: item.repsGoal
    });
  };

  const currentExercise = exercises.find((exercise) => exercise.id === draft.exerciseId) ?? exercises[0];

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{monthTitle(selectedDate)}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Plan your weekly rhythm and check off today.</Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: `${theme.colors.orange}22`, borderColor: theme.colors.border }]}>
          <Medal color={theme.colors.orange} size={18} />
          <Text style={[styles.streakText, { color: theme.colors.text }]}>{stats.streak}d</Text>
        </View>
      </View>

      <View style={styles.weekRow}>
        {weekDates(selectedDate).map((date) => {
          const key = dateKey(date);
          const active = key === selectedDate;
          const today = key === dateKey(new Date());
          const past = key < dateKey(new Date());
          return (
            <Pressable
              key={key}
              disabled={past}
              onPress={() => setSelectedDate(key)}
              style={[styles.weekDay, past && styles.disabledDay, { backgroundColor: active ? theme.colors.primary : theme.colors.card, borderColor: today ? theme.colors.primary : theme.colors.border }]}
            >
              <Text style={[styles.weekShort, { color: active ? "#fff" : theme.colors.muted }]}>{routineDays[(date.getDay() + 6) % 7].short}</Text>
              <Text style={[styles.weekNumber, { color: active ? "#fff" : past ? theme.colors.muted : theme.colors.text }]}>{date.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={[styles.dayTitle, { color: theme.colors.text }]}>{dayLabels[selectedDay]}</Text>
            <Text style={[styles.summaryMeta, { color: theme.colors.muted }]}>{routine.length ? `${completedCount} of ${routine.length} completed` : "No routine planned"}</Text>
          </View>
          <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.cardSoft }]}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.colors.primary }]} />
        </View>
        <View style={styles.summaryActions}>
          <AppButton title="Add Exercise" icon={Plus} onPress={openAddModal} style={styles.actionButton} />
          <AppButton title="Duplicate Day" icon={Copy} variant="ghost" onPress={() => setDuplicateOpen(true)} style={styles.actionButton} />
        </View>
        {routine.length ? <AppButton title="Clear Day" icon={Trash2} variant="danger" onPress={() => void clearDayRoutine(selectedDay)} /> : null}
      </View>

      <View style={styles.list}>
        {routine.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Medal color={theme.colors.primary} size={32} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No routine planned for this day</Text>
            <Text style={[styles.emptyBody, { color: theme.colors.muted }]}>Add your first exercise to build consistency.</Text>
            <AppButton title="Add Exercise" icon={Plus} onPress={openAddModal} />
          </View>
        ) : routine.map((item, index) => {
          const exercise = exercises.find((entry) => entry.id === item.exerciseId);
          const done = Boolean(completion[item.id]);
          return (
            <View key={item.id} style={[styles.exerciseCard, { backgroundColor: theme.colors.card, borderColor: done ? theme.colors.green : theme.colors.border }]}>
              <Image source={{ uri: exercise?.image }} style={styles.exerciseImage} />
              <View style={styles.exerciseBody}>
                <View style={styles.exerciseTop}>
                  <Pressable onPress={() => void markRoutineItemCompleted(selectedDate, item.id, !done)} style={[styles.checkbox, { backgroundColor: done ? theme.colors.green : theme.colors.cardSoft }]}>
                    {done ? <Check color="#fff" size={16} /> : null}
                  </Pressable>
                  <View style={styles.exerciseText}>
                    <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{item.exerciseName}</Text>
                    <Text style={[styles.exerciseMeta, { color: theme.colors.muted }]}>{item.variationName}</Text>
                  </View>
                  <GripVertical color={theme.colors.muted} size={18} />
                </View>
                <Text style={[styles.target, { color: theme.colors.primary }]}>{formatTarget(item, preferences.distanceUnit)}</Text>
                <View style={styles.cardActions}>
                  <Pressable onPress={() => void reorderRoutineItems(selectedDay, index, index - 1)} style={[styles.iconButton, { backgroundColor: theme.colors.cardSoft }]}>
                    <ChevronUp color={theme.colors.text} size={17} />
                  </Pressable>
                  <Pressable onPress={() => void reorderRoutineItems(selectedDay, index, index + 1)} style={[styles.iconButton, { backgroundColor: theme.colors.cardSoft }]}>
                    <ChevronDown color={theme.colors.text} size={17} />
                  </Pressable>
                  <Pressable onPress={() => openEditModal(item)} style={[styles.iconButton, { backgroundColor: theme.colors.cardSoft }]}>
                    <Pencil color={theme.colors.text} size={17} />
                  </Pressable>
                  <Pressable onPress={() => void deleteRoutineItem(selectedDay, item.id)} style={[styles.iconButton, { backgroundColor: `${theme.colors.orange}22` }]}>
                    <Trash2 color={theme.colors.orange} size={17} />
                  </Pressable>
                  <Pressable onPress={() => startRoutineWorkout(item)} style={[styles.startMini, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.startMiniText}>Start</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{editingItem ? "Edit exercise" : "Add exercise"}</Text>
              <Pressable onPress={() => setModalOpen(false)} style={[styles.iconButton, { backgroundColor: theme.colors.cardSoft }]}>
                <X color={theme.colors.text} size={18} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={[styles.searchBox, { backgroundColor: theme.colors.cardSoft }]}>
                <Search color={theme.colors.muted} size={18} />
                <TextInput value={search} onChangeText={setSearch} placeholder="Search exercise" placeholderTextColor={theme.colors.muted} style={[styles.searchInput, { color: theme.colors.text }]} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exercisePicker}>
                {filteredExercises.map((exercise) => {
                  const active = draft.exerciseId === exercise.id;
                  return (
                    <Pressable key={exercise.id} onPress={() => selectExercise(exercise.id)} style={[styles.exerciseChip, { backgroundColor: active ? theme.colors.primary : theme.colors.cardSoft }]}>
                      <Text style={[styles.exerciseChipText, { color: active ? "#fff" : theme.colors.text }]}>{exercise.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>Variation</Text>
              <View style={styles.variationGrid}>
                {currentExercise.variations.map((variation) => {
                  const active = draft.variationName === variation;
                  return (
                    <Pressable key={variation} onPress={() => setDraft({ ...draft, variationName: variation })} style={[styles.variationChip, { backgroundColor: active ? theme.colors.primary : theme.colors.cardSoft }]}>
                      <Text style={[styles.variationText, { color: active ? "#fff" : theme.colors.text }]}>{variation}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {draft.trackingType === "reps_sets" ? (
                <>
                  <Stepper label="Reps" value={draft.targetReps ?? 12} onChange={(value) => setDraft({ ...draft, targetReps: value })} min={1} />
                  <Stepper label="Sets" value={draft.targetSets ?? 3} onChange={(value) => setDraft({ ...draft, targetSets: value })} min={1} />
                  <Stepper label="Rest" value={draft.restTime ?? 60} onChange={(value) => setDraft({ ...draft, restTime: value })} min={15} step={15} suffix="s" />
                </>
              ) : null}
              {draft.trackingType === "timer_only" ? (
                <>
                  <Stepper label="Duration" value={draft.durationSeconds ?? 45} onChange={(value) => setDraft({ ...draft, durationSeconds: value })} min={10} step={5} suffix="s" />
                  <Stepper label="Rounds" value={draft.rounds ?? 3} onChange={(value) => setDraft({ ...draft, rounds: value })} min={1} />
                  <Stepper label="Rest" value={draft.restTime ?? 60} onChange={(value) => setDraft({ ...draft, restTime: value })} min={15} step={15} suffix="s" />
                </>
              ) : null}
              {draft.trackingType === "distance_time" ? (
                <>
                  <Stepper label={`Distance (${preferences.distanceUnit})`} value={draft.distance ?? 3} onChange={(value) => setDraft({ ...draft, distance: value })} min={1} />
                  <Stepper label="Goal time" value={Math.round((draft.goalTimeSeconds ?? 1500) / 60)} onChange={(value) => setDraft({ ...draft, goalTimeSeconds: value * 60 })} min={5} step={5} suffix="m" />
                </>
              ) : null}
              {draft.trackingType === "reps_timer" ? (
                <>
                  <Stepper label="Duration" value={draft.durationSeconds ?? 30} onChange={(value) => setDraft({ ...draft, durationSeconds: value })} min={10} step={5} suffix="s" />
                  <Stepper label="Rounds" value={draft.rounds ?? 3} onChange={(value) => setDraft({ ...draft, rounds: value })} min={1} />
                  <Stepper label="Reps goal" value={draft.repsGoal ?? 60} onChange={(value) => setDraft({ ...draft, repsGoal: value })} min={0} step={5} />
                  <Stepper label="Rest" value={draft.restTime ?? 60} onChange={(value) => setDraft({ ...draft, restTime: value })} min={15} step={15} suffix="s" />
                </>
              ) : null}
              <AppButton title={editingItem ? "Save Changes" : "Add to Day Routine"} icon={Plus} onPress={saveRoutineItem} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={duplicateOpen} transparent animationType="fade" onRequestClose={() => setDuplicateOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Duplicate {dayLabels[selectedDay]}</Text>
              <Pressable onPress={() => setDuplicateOpen(false)} style={[styles.iconButton, { backgroundColor: theme.colors.cardSoft }]}>
                <X color={theme.colors.text} size={18} />
              </Pressable>
            </View>
            <View style={styles.variationGrid}>
              {routineDays.filter((day) => day.key !== selectedDay).map((day) => (
                <Pressable
                  key={day.key}
                  onPress={async () => {
                    await duplicateDayRoutine(selectedDay, day.key);
                    setDuplicateOpen(false);
                  }}
                  style={[styles.variationChip, { backgroundColor: theme.colors.cardSoft }]}
                >
                  <Text style={[styles.variationText, { color: theme.colors.text }]}>{day.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: 0 },
  subtitle: { marginTop: 6, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  streakBadge: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", gap: 7, alignItems: "center" },
  streakText: { fontSize: 14, fontWeight: "900" },
  weekRow: { flexDirection: "row", gap: 8 },
  weekDay: { flex: 1, minHeight: 68, borderWidth: 1, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 4 },
  disabledDay: { opacity: 0.38 },
  weekShort: { fontSize: 11, fontWeight: "900" },
  weekNumber: { fontSize: 18, fontWeight: "900" },
  summaryCard: { borderWidth: 1, borderRadius: 28, padding: 18, gap: 14, shadowColor: "#8B5CF6", shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 16 } },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  dayTitle: { fontSize: 24, fontWeight: "900", letterSpacing: 0 },
  summaryMeta: { marginTop: 4, fontSize: 13, fontWeight: "800" },
  progressPercent: { fontSize: 28, fontWeight: "900" },
  progressTrack: { height: 10, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  summaryActions: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1 },
  list: { gap: 12 },
  empty: { borderWidth: 1, borderRadius: 26, padding: 22, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  emptyBody: { fontSize: 14, fontWeight: "700", textAlign: "center", lineHeight: 20 },
  exerciseCard: { borderWidth: 1, borderRadius: 24, padding: 12, flexDirection: "row", gap: 12 },
  exerciseImage: { width: 78, minHeight: 112, borderRadius: 18, backgroundColor: "#111827" },
  exerciseBody: { flex: 1, gap: 10 },
  exerciseTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  exerciseText: { flex: 1 },
  exerciseName: { fontSize: 17, fontWeight: "900" },
  exerciseMeta: { marginTop: 2, fontSize: 12, fontWeight: "800" },
  target: { fontSize: 13, fontWeight: "900" },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  iconButton: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  startMini: { minHeight: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginLeft: "auto" },
  startMiniText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  modalCard: { maxHeight: "88%", borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, padding: 18, gap: 14 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  modalTitle: { fontSize: 24, fontWeight: "900", letterSpacing: 0 },
  modalContent: { gap: 12, paddingBottom: 24 },
  searchBox: { minHeight: 48, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, minHeight: 48, fontSize: 15, fontWeight: "800" },
  exercisePicker: { gap: 8, paddingVertical: 2 },
  exerciseChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  exerciseChipText: { fontSize: 13, fontWeight: "900" },
  fieldLabel: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  variationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variationChip: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  variationText: { fontSize: 13, fontWeight: "900" },
  modalField: { borderRadius: 18, padding: 14, gap: 10 },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  miniButton: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  miniText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  stepperValue: { fontSize: 24, fontWeight: "900", letterSpacing: 0 }
});
