import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CalendarDays, Dumbbell, Home, LineChart, User } from "lucide-react-native";
import { Platform } from "react-native";
import { useThemeMode } from "@/theme/ThemeProvider";
import { MainTabParamList, RootStackParamList } from "@/types";
import { ActiveWorkoutScreen } from "@/screens/ActiveWorkoutScreen";
import { CalendarScreen } from "@/screens/CalendarScreen";
import { ExerciseSelectionScreen } from "@/screens/ExerciseSelectionScreen";
import { ExerciseDetailScreen } from "@/screens/ExerciseDetailScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { RestTimerScreen } from "@/screens/RestTimerScreen";
import { WorkoutSetupScreen } from "@/screens/WorkoutSetupScreen";
import { WorkoutSummaryScreen } from "@/screens/WorkoutSummaryScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { theme } = useThemeMode();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: Platform.select({ ios: 24, android: 16, default: 16 }),
          height: 70,
          borderRadius: 26,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          shadowColor: "#000",
          shadowOpacity: 0.28,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800", letterSpacing: 0 },
        tabBarItemStyle: { paddingVertical: 8 }
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="Progress" component={ProgressScreen} options={{ tabBarIcon: ({ color }) => <LineChart color={color} size={22} /> }} />
      <Tabs.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: ({ color }) => <CalendarDays color={color} size={22} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={22} /> }} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { theme } = useThemeMode();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: "900" },
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ExerciseSelection" component={ExerciseSelectionScreen} options={{ title: "Choose Exercise" }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: "Exercise Details" }} />
      <Stack.Screen name="WorkoutSetup" component={WorkoutSetupScreen} options={{ title: "Workout Setup" }} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RestTimer" component={RestTimerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
