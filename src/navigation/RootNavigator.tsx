import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CalendarDays, Dumbbell, Home, LineChart, Settings } from "lucide-react-native";
import { Platform, Text, View } from "react-native";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { useAuth } from "@/auth/AuthContext";
import { useGoals } from "@/goals/GoalsContext";
import { useThemeMode } from "@/theme/ThemeProvider";
import { MainTabParamList, RootStackParamList } from "@/types";
import { ActiveWorkoutScreen } from "@/screens/ActiveWorkoutScreen";
import { AuthScreen } from "@/screens/AuthScreen";
import { CalendarScreen } from "@/screens/CalendarScreen";
import { CalendarDayDetailScreen } from "@/screens/CalendarDayDetailScreen";
import { CreateAccountScreen } from "@/screens/CreateAccountScreen";
import { ExerciseSelectionScreen } from "@/screens/ExerciseSelectionScreen";
import { ExerciseDetailScreen } from "@/screens/ExerciseDetailScreen";
import { GoalsSetupScreen } from "@/screens/GoalsSetupScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { LegalScreen } from "@/screens/LegalScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { ProfileEditScreen } from "@/screens/ProfileEditScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { RestTimerScreen } from "@/screens/RestTimerScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
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
      <Tabs.Screen name="Exercises" component={ExerciseSelectionScreen} options={{ tabBarIcon: ({ color }) => <Dumbbell color={color} size={22} /> }} />
      <Tabs.Screen name="Progress" component={ProgressScreen} options={{ tabBarIcon: ({ color }) => <LineChart color={color} size={22} /> }} />
      <Tabs.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: ({ color }) => <CalendarDays color={color} size={22} /> }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <Settings color={color} size={22} /> }} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { theme } = useThemeMode();
  const { currentUser, loading: authLoading } = useAuth();
  const { goals, loading: goalsLoading } = useGoals();

  if (authLoading || goalsLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>FitHabit</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <Stack.Navigator
        key="auth"
        initialRouteName="Auth"
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: "900" },
          contentStyle: { backgroundColor: theme.colors.background },
          headerLeft: () => <HeaderBackButton onPress={() => navigation.goBack()} />
        })}
      >
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log In" }} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  const initialRouteName = !goals ? "GoalsSetup" : "MainTabs";

  return (
    <Stack.Navigator
      key={initialRouteName}
      initialRouteName={initialRouteName}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: "900" },
        contentStyle: { backgroundColor: theme.colors.background },
        headerLeft: () => <HeaderBackButton onPress={() => navigation.goBack()} />
      })}
    >
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GoalsSetup" component={GoalsSetupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ExerciseSelection" component={ExerciseSelectionScreen} options={{ title: "Choose Exercise" }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: "Exercise Details" }} />
      <Stack.Screen name="WorkoutSetup" component={WorkoutSetupScreen} options={{ title: "Workout Setup" }} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RestTimer" component={RestTimerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CalendarDayDetail" component={CalendarDayDetailScreen} options={{ title: "Day Detail" }} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ title: "Edit Profile" }} />
      <Stack.Screen name="PrivacyPolicy" component={LegalScreen} options={{ title: "Privacy Policy" }} />
      <Stack.Screen name="Terms" component={LegalScreen} options={{ title: "Terms" }} />
    </Stack.Navigator>
  );
}
