import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { AuthProvider } from "@/auth/AuthContext";
import { GoalsProvider } from "@/goals/GoalsContext";
import { PreferencesProvider } from "@/preferences/PreferencesContext";
import { WorkoutProgressProvider } from "@/progress/WorkoutProgressContext";
import { RoutineProvider } from "@/routine/RoutineContext";
import { ThemeProvider, useThemeMode } from "@/theme/ThemeProvider";
import { RootNavigator } from "@/navigation/RootNavigator";

function AppShell() {
  const { scheme, theme } = useThemeMode();

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
      }
      input, textarea {
        -webkit-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <NavigationContainer theme={theme.navigation}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GoalsProvider>
        <PreferencesProvider>
          <RoutineProvider>
            <WorkoutProgressProvider>
              <ThemeProvider>
                <AppShell />
              </ThemeProvider>
            </WorkoutProgressProvider>
          </RoutineProvider>
        </PreferencesProvider>
      </GoalsProvider>
    </AuthProvider>
  );
}
