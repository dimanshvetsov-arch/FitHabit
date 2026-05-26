import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import { lightPalette, palette } from "./colors";

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
  const systemScheme = useColorScheme() ?? "dark";
  const [manualScheme, setManualScheme] = useState<NonNullable<ColorSchemeName> | null>(null);
  const scheme = manualScheme ?? systemScheme;
  const colors = scheme === "dark" ? palette : lightPalette;

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
      toggleScheme: () => setManualScheme((current) => (current === "light" ? "dark" : "light"))
    };
  }, [colors, scheme]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useThemeMode() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }
  return value;
}
