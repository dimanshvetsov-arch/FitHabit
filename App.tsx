import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { PreferencesProvider } from "@/preferences/PreferencesContext";
import { WorkoutProgressProvider } from "@/progress/WorkoutProgressContext";
import { ThemeProvider, useThemeMode } from "@/theme/ThemeProvider";
import { RootNavigator } from "@/navigation/RootNavigator";

function AppShell() {
  const { scheme, theme } = useThemeMode();

  return (
    <NavigationContainer theme={theme.navigation}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <WorkoutProgressProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </WorkoutProgressProvider>
    </PreferencesProvider>
  );
}
