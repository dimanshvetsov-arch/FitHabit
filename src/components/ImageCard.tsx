import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeMode } from "@/theme/ThemeProvider";

type Props = {
  title: string;
  subtitle?: string;
  image: string;
  height?: number;
  badge?: string;
  fallbackImage?: string;
  onPress?: () => void;
};

export function ImageCard({ title, subtitle, image, height = 172, badge, fallbackImage, onPress }: Props) {
  const { theme } = useThemeMode();
  const [source, setSource] = useState(image);

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <ImageBackground source={{ uri: source }} onError={() => fallbackImage && setSource(fallbackImage)} imageStyle={styles.image} style={[styles.card, { height }]}>
        <LinearGradient colors={["rgba(13,17,23,0.1)", "rgba(13,17,23,0.86)"]} style={styles.overlay}>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
          <View style={styles.textWrap}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    overflow: "hidden"
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end"
  },
  image: {
    borderRadius: 24
  },
  overlay: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between"
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800"
  },
  textWrap: {
    gap: 4
  },
  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    color: "rgba(249,250,251,0.76)",
    fontSize: 14,
    fontWeight: "600"
  }
});
