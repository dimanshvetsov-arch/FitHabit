import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { Camera, Download, RotateCcw, Trash2, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Share, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { useAuth } from "@/auth/AuthContext";
import { MainGoal, useGoals } from "@/goals/GoalsContext";
import { accentColors } from "@/theme/colors";
import { useWorkouts } from "@/hooks/useWorkouts";
import { AccentColor, FitnessLevel, usePreferences } from "@/preferences/PreferencesContext";
import { loadWorkouts } from "@/storage/workoutStorage";
import { useThemeMode } from "@/theme/ThemeProvider";

const levels: FitnessLevel[] = ["Beginner", "Intermediate", "Advanced"];
const accents: AccentColor[] = ["Purple", "Blue", "Green", "Orange", "Red"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const goals: MainGoal[] = ["Build muscle", "Lose weight", "Improve endurance", "Build discipline", "Stay healthy"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useThemeMode();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{children}</View>
    </View>
  );
}

function SettingRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  const { theme } = useThemeMode();
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        {value ? <Text style={[styles.rowValue, { color: theme.colors.muted }]}>{value}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function NumberInput({ value, onChange, suffix }: { value: number; onChange: (value: number) => void; suffix?: string }) {
  const { theme } = useThemeMode();
  return (
    <View style={styles.numberWrap}>
      <TextInput
        value={String(value)}
        keyboardType="number-pad"
        onChangeText={(text) => onChange(Math.max(0, Number(text) || 0))}
        style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      {suffix ? <Text style={[styles.suffix, { color: theme.colors.muted }]}>{suffix}</Text> : null}
    </View>
  );
}

export function SettingsScreen({ navigation }: { navigation: { navigate: (screen: string) => void } }) {
  const { theme, toggleScheme } = useThemeMode();
  const { preferences, updatePreference, resetPreferences } = usePreferences();
  const { user, updateUsername, updateProfilePhoto, resetApp: resetAccount } = useAuth();
  const { goals: userGoals, updateGoals, clearGoals } = useGoals();
  const { resetWorkouts } = useWorkouts();
  const [username, setUsername] = useState(user?.username ?? "");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    setUsername(user?.username ?? "");
  }, [user?.username]);

  const toggleDay = (day: string) => {
    const hasDay = preferences.preferredWorkoutDays.includes(day);
    const next = hasDay ? preferences.preferredWorkoutDays.filter((item) => item !== day) : [...preferences.preferredWorkoutDays, day];
    void updatePreference("preferredWorkoutDays", next);
  };

  const toggleGoalDay = (day: string) => {
    if (!userGoals) return;
    const hasDay = userGoals.preferredWorkoutDays.includes(day);
    const next = hasDay ? userGoals.preferredWorkoutDays.filter((item) => item !== day) : [...userGoals.preferredWorkoutDays, day];
    void updateGoals({ ...userGoals, preferredWorkoutDays: next });
    void updatePreference("preferredWorkoutDays", next.map((item) => item.slice(0, 3)));
  };

  const saveUsername = async () => {
    const result = await updateUsername(username);
    if (!result.ok) {
      setUsernameError(result.error ?? "Could not save username");
      return;
    }
    setUsernameError("");
    await updatePreference("userName", username.trim());
  };

  const chooseProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Gallery permission is required to choose a profile photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });
    if (!result.canceled) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        await updateProfilePhoto(uri);
        await updatePreference("profilePhoto", uri);
      }
    }
  };

  const toggleDailyReminder = async (enabled: boolean) => {
    await updatePreference("dailyWorkoutReminder", enabled);
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (enabled) {
      await scheduleDailyReminder(preferences.reminderTime);
    }
  };

  const scheduleDailyReminder = async (time: string) => {
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.granted) {
      const [hour, minute] = time.split(":").map(Number);
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: { title: "FitHabit reminder", body: "Time for today's workout." },
        trigger: { hour: hour || 18, minute: minute || 0, repeats: true }
      });
    }
  };

  const updateReminderTime = async (value: string) => {
    await updatePreference("reminderTime", value);
    if (preferences.dailyWorkoutReminder) {
      await scheduleDailyReminder(value);
    }
  };

  const exportData = async () => {
    const workouts = await loadWorkouts();
    await Share.share({ message: JSON.stringify({ account: user, goals: userGoals, preferences, workouts }, null, 2) });
  };

  const clearHistory = () => {
    Alert.alert("Clear workout history?", "This removes completed workouts from this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => void resetWorkouts() }
    ]);
  };

  const resetApp = () => {
    Alert.alert("Reset app?", "This clears your account, settings, goals, workouts, streak, and exercise counters.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await resetWorkouts();
          await resetPreferences();
          await clearGoals();
          await resetAccount();
        }
      }
    ]);
  };

  return (
    <AppScreen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      <Section title="Profile">
        <SettingRow label="User name">
          <TextInput
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              setUsernameError("");
            }}
            style={[styles.textInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />
        </SettingRow>
        {usernameError ? <Text style={[styles.error, { color: theme.colors.orange }]}>{usernameError}</Text> : null}
        <AppButton title="Save username" variant="ghost" onPress={saveUsername} />
        <SettingRow label="Profile photo">
          {user?.profilePhoto || preferences.profilePhoto ? <Image source={{ uri: user?.profilePhoto || preferences.profilePhoto }} style={styles.avatar} /> : <User color={theme.colors.muted} size={28} />}
        </SettingRow>
        <AppButton title="Choose Profile Photo" icon={Camera} variant="ghost" onPress={chooseProfilePhoto} />
        <AppButton title="Edit profile" variant="ghost" onPress={() => navigation.navigate("ProfileEdit")} />
        <View style={styles.segmentRow}>
          {levels.map((level) => (
            <Pressable
              key={level}
              onPress={() => {
                void updatePreference("fitnessLevel", level);
                if (userGoals) void updateGoals({ ...userGoals, fitnessLevel: level });
              }}
              style={[styles.segment, { backgroundColor: preferences.fitnessLevel === level ? theme.colors.primary : theme.colors.cardSoft }]}
            >
              <Text style={[styles.segmentText, { color: preferences.fitnessLevel === level ? "#fff" : theme.colors.muted }]}>{level}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      {userGoals ? (
        <Section title="Goals">
          <SettingRow label="Main goal" value={userGoals.mainGoal} />
          <View style={styles.segmentRow}>
            {goals.map((goal) => (
              <Pressable key={goal} onPress={() => void updateGoals({ ...userGoals, mainGoal: goal })} style={[styles.segment, { backgroundColor: userGoals.mainGoal === goal ? theme.colors.primary : theme.colors.cardSoft }]}>
                <Text style={[styles.segmentText, { color: userGoals.mainGoal === goal ? "#fff" : theme.colors.muted }]}>{goal}</Text>
              </Pressable>
            ))}
          </View>
          <SettingRow label="Weekly workout goal" value={`${userGoals.weeklyWorkoutGoal} workouts`} />
          <View style={styles.segmentRow}>
            {[2, 3, 4, 5, 6, 7].map((goal) => (
              <Pressable key={goal} onPress={() => void updateGoals({ ...userGoals, weeklyWorkoutGoal: goal })} style={[styles.segment, { backgroundColor: userGoals.weeklyWorkoutGoal === goal ? theme.colors.primary : theme.colors.cardSoft }]}>
                <Text style={[styles.segmentText, { color: userGoals.weeklyWorkoutGoal === goal ? "#fff" : theme.colors.muted }]}>{goal}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.dayGrid}>
            {fullDays.map((day) => {
              const active = userGoals.preferredWorkoutDays.includes(day);
              return (
                <Pressable key={day} onPress={() => toggleGoalDay(day)} style={[styles.day, { backgroundColor: active ? theme.colors.primary : theme.colors.cardSoft }]}>
                  <Text style={[styles.dayText, { color: active ? "#fff" : theme.colors.muted }]}>{day.slice(0, 3)}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>
      ) : null}

      <Section title="Workout Preferences">
        <SettingRow label="Default reps"><NumberInput value={preferences.defaultReps} onChange={(value) => void updatePreference("defaultReps", value)} /></SettingRow>
        <SettingRow label="Default sets"><NumberInput value={preferences.defaultSets} onChange={(value) => void updatePreference("defaultSets", value)} /></SettingRow>
        <SettingRow label="Default rest time"><NumberInput value={preferences.defaultRestSeconds} suffix="sec" onChange={(value) => void updatePreference("defaultRestSeconds", value)} /></SettingRow>
        <SettingRow label="Default plank duration"><NumberInput value={preferences.defaultPlankSeconds} suffix="sec" onChange={(value) => void updatePreference("defaultPlankSeconds", value)} /></SettingRow>
        <SettingRow label="Reminder time">
          <TextInput value={preferences.reminderTime} onChangeText={(value) => void updateReminderTime(value)} style={[styles.timeInput, { color: theme.colors.text, borderColor: theme.colors.border }]} />
        </SettingRow>
        <View style={styles.dayGrid}>
          {days.map((day) => {
            const active = preferences.preferredWorkoutDays.includes(day);
            return (
              <Pressable key={day} onPress={() => toggleDay(day)} style={[styles.day, { backgroundColor: active ? theme.colors.primary : theme.colors.cardSoft }]}>
                <Text style={[styles.dayText, { color: active ? "#fff" : theme.colors.muted }]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="App Preferences">
        <SettingRow label="Dark mode / Light mode" value={preferences.themeMode}><Switch value={preferences.themeMode === "dark"} onValueChange={toggleScheme} /></SettingRow>
        <View style={styles.swatches}>
          {accents.map((accent) => (
            <Pressable key={accent} onPress={() => void updatePreference("accentColor", accent)} style={[styles.swatch, { backgroundColor: accentColors[accent], borderColor: preferences.accentColor === accent ? theme.colors.text : "transparent" }]} />
          ))}
        </View>
        <SettingRow label="Haptic feedback"><Switch value={preferences.hapticFeedback} onValueChange={(value) => void updatePreference("hapticFeedback", value)} /></SettingRow>
        <SettingRow label="Sound effects"><Switch value={preferences.soundEffects} onValueChange={(value) => void updatePreference("soundEffects", value)} /></SettingRow>
        <SettingRow label="Motivational messages"><Switch value={preferences.motivationalMessages} onValueChange={(value) => void updatePreference("motivationalMessages", value)} /></SettingRow>
      </Section>

      <Section title="Notifications">
        <SettingRow label="Daily workout reminder"><Switch value={preferences.dailyWorkoutReminder} onValueChange={(value) => void toggleDailyReminder(value)} /></SettingRow>
        <SettingRow label="Streak reminder"><Switch value={preferences.streakReminder} onValueChange={(value) => void updatePreference("streakReminder", value)} /></SettingRow>
        <SettingRow label="Rest timer sound"><Switch value={preferences.restTimerSound} onValueChange={(value) => void updatePreference("restTimerSound", value)} /></SettingRow>
      </Section>

      <Section title="Units">
        <View style={styles.segmentRow}>
          {(["kg", "lbs"] as const).map((unit) => <Pressable key={unit} onPress={() => void updatePreference("weightUnit", unit)} style={[styles.segment, { backgroundColor: preferences.weightUnit === unit ? theme.colors.primary : theme.colors.cardSoft }]}><Text style={[styles.segmentText, { color: preferences.weightUnit === unit ? "#fff" : theme.colors.muted }]}>{unit}</Text></Pressable>)}
        </View>
        <View style={styles.segmentRow}>
          {(["km", "miles"] as const).map((unit) => <Pressable key={unit} onPress={() => void updatePreference("distanceUnit", unit)} style={[styles.segment, { backgroundColor: preferences.distanceUnit === unit ? theme.colors.primary : theme.colors.cardSoft }]}><Text style={[styles.segmentText, { color: preferences.distanceUnit === unit ? "#fff" : theme.colors.muted }]}>{unit}</Text></Pressable>)}
        </View>
        <View style={styles.segmentRow}>
          {(["12-hour", "24-hour"] as const).map((format) => <Pressable key={format} onPress={() => void updatePreference("timeFormat", format)} style={[styles.segment, { backgroundColor: preferences.timeFormat === format ? theme.colors.primary : theme.colors.cardSoft }]}><Text style={[styles.segmentText, { color: preferences.timeFormat === format ? "#fff" : theme.colors.muted }]}>{format}</Text></Pressable>)}
        </View>
      </Section>

      <Section title="Data">
        <AppButton title="Export workout data" icon={Download} variant="ghost" onPress={exportData} />
        <AppButton title="Clear all workout history" icon={Trash2} variant="danger" onPress={clearHistory} />
        <AppButton title="Reset app" icon={RotateCcw} variant="danger" onPress={resetApp} />
      </Section>

      <Section title="About">
        <SettingRow label="App name" value="FitHabit" />
        <SettingRow label="App version" value="1.0.0" />
        <AppButton title="Privacy policy" variant="ghost" onPress={() => navigation.navigate("PrivacyPolicy")} />
        <AppButton title="Terms" variant="ghost" onPress={() => navigation.navigate("Terms")} />
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "900", letterSpacing: 0 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "900", letterSpacing: 0 },
  sectionCard: { borderWidth: 1, borderRadius: 24, padding: 16, gap: 14 },
  row: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "900" },
  rowValue: { marginTop: 2, fontSize: 13, fontWeight: "700" },
  error: { fontSize: 13, fontWeight: "800" },
  textInput: { minWidth: 150, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, minHeight: 42, fontWeight: "700" },
  timeInput: { width: 86, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, minHeight: 42, fontWeight: "800", textAlign: "center" },
  avatar: { width: 42, height: 42, borderRadius: 16 },
  segmentRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  segment: { minHeight: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, flexGrow: 1 },
  segmentText: { fontSize: 12, fontWeight: "900" },
  numberWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  numberInput: { width: 76, borderWidth: 1, borderRadius: 14, minHeight: 42, textAlign: "center", fontSize: 16, fontWeight: "900" },
  suffix: { fontSize: 12, fontWeight: "900" },
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  day: { minWidth: 48, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 12, fontWeight: "900" },
  swatches: { flexDirection: "row", gap: 12 },
  swatch: { width: 36, height: 36, borderRadius: 14, borderWidth: 3 }
});
