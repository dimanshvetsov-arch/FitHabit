import * as Notifications from "expo-notifications";
import { Bell, Flame, Moon, RotateCcw, Star, Sun, Trophy, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { MetricCard } from "@/components/MetricCard";
import { useWorkouts } from "@/hooks/useWorkouts";
import { getDailyReminders, setDailyReminders } from "@/storage/workoutStorage";
import { useThemeMode } from "@/theme/ThemeProvider";

export function ProfileScreen() {
  const { theme, scheme, toggleScheme } = useThemeMode();
  const { stats, resetWorkouts } = useWorkouts();
  const [reminders, setReminders] = useState(false);
  const isNew = stats.totalWorkouts === 0;

  useEffect(() => {
    void getDailyReminders().then(setReminders);
  }, []);

  const toggleReminders = async (enabled: boolean) => {
    setReminders(enabled);
    await setDailyReminders(enabled);
    if (enabled) {
      const permission = await Notifications.requestPermissionsAsync();
      if (permission.granted) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "FitHabit reminder",
            body: "Time to protect your streak with one focused session."
          },
          trigger: { hour: 18, minute: 0, repeats: true }
        });
      }
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const confirmReset = () => {
    Alert.alert("Reset training data?", "This clears workouts, streaks, reminders, and achievements on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await Notifications.cancelAllScheduledNotificationsAsync();
          await resetWorkouts();
          setReminders(false);
        }
      }
    ]);
  };

  return (
    <AppScreen>
      <View style={[styles.hero, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.cardSoft }]}>
          <User color={theme.colors.muted} size={46} />
        </View>
        <Text style={[styles.name, { color: theme.colors.text }]}>New account</Text>
        <Text style={[styles.level, { color: theme.colors.muted }]}>{isNew ? "No level yet" : "Training profile active"}</Text>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { backgroundColor: theme.colors.primary, width: isNew ? "0%" : "24%" }]} />
        </View>
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Workouts" value={`${stats.totalWorkouts}`} icon={Trophy} color={theme.colors.orange} />
        <MetricCard label="Calories" value={`${stats.totalCalories}`} icon={Flame} color={theme.colors.green} />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Hours" value={`${stats.totalHours}`} icon={Star} color={theme.colors.secondary} />
        <MetricCard label="Streak" value={`${stats.streak}d`} icon={Flame} color={theme.colors.primary} />
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Settings</Text>
      <View style={[styles.setting, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}22` }]}>
          <Bell color={theme.colors.primary} size={20} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Daily workout reminder</Text>
          <Text style={[styles.settingMeta, { color: theme.colors.muted }]}>6:00 PM every day</Text>
        </View>
        <Switch value={reminders} onValueChange={toggleReminders} thumbColor="#fff" trackColor={{ false: theme.colors.cardSoft, true: theme.colors.primary }} />
      </View>

      <Pressable onPress={toggleScheme} style={[styles.setting, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: `${theme.colors.secondary}22` }]}>
          {scheme === "dark" ? <Moon color={theme.colors.secondary} size={20} /> : <Sun color={theme.colors.orange} size={20} />}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Appearance</Text>
          <Text style={[styles.settingMeta, { color: theme.colors.muted }]}>{scheme === "dark" ? "Dark mode" : "Light mode"}</Text>
        </View>
      </Pressable>

      <Pressable onPress={confirmReset} style={[styles.setting, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: "rgba(239,68,68,0.18)" }]}>
          <RotateCcw color="#EF4444" size={20} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Reset local data</Text>
          <Text style={[styles.settingMeta, { color: theme.colors.muted }]}>Return this device to a new account state</Text>
        </View>
      </Pressable>

      <Text style={[styles.section, { color: theme.colors.text }]}>Achievements</Text>
      <View style={[styles.empty, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Trophy color={theme.colors.muted} size={24} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No achievements yet</Text>
        <Text style={[styles.emptyMeta, { color: theme.colors.muted }]}>Finish workouts to unlock badges.</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    gap: 10
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  name: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0
  },
  level: {
    fontSize: 14,
    fontWeight: "900"
  },
  xpTrack: {
    marginTop: 8,
    width: "100%",
    height: 9,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden"
  },
  xpFill: {
    height: "100%",
    borderRadius: 99
  },
  metrics: {
    flexDirection: "row",
    gap: 12
  },
  section: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0
  },
  setting: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  settingText: {
    flex: 1
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "900"
  },
  settingMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700"
  },
  empty: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900"
  },
  emptyMeta: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center"
  }
});
