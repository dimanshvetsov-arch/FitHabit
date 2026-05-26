import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { ColorSchemeName } from "react-native";
import { usePreferences } from "@/preferences/PreferencesContext";
import { accentColors, lightPalette, palette } from "./colors";

type AppTheme = {
  colors: typeof palette;
  navigation: Theme;
};

type ThemeModeContext = {
  scheme: NonNullable<ColorSchemeName>;
  theme: AppTheme;
  toggleScheme: () => void;
};

const Context = createContext<ThemeModeContext | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const { preferences, updatePreference } = usePreferences();
  const scheme = preferences.themeMode;
  const colors = {
    ...(scheme === "dark" ? palette : lightPalette),
    primary: accentColors[preferences.accentColor],
    secondary: accentColors[preferences.accentColor]
  };

  const value = useMemo<ThemeModeContext>(() => {
    const baseNavigation = scheme === "dark" ? DarkTheme : DefaultTheme;

    return {
      scheme,
      theme: {
        colors,
        navigation: {
          ...baseNavigation,
          colors: {
            ...baseNavigation.colors,
            background: colors.background,
            card: colors.card,
            primary: colors.primary,
            text: colors.text,
            border: colors.border
          }
        }
      },
      toggleScheme: () => void updatePreference("themeMode", scheme === "dark" ? "light" : "dark")
    };
  }, [colors, scheme, updatePreference]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useThemeMode() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }
  return value;
}
