import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";
import { useThemeMode } from "@/theme/ThemeProvider";

type Props = {
  progress: number;
  size?: number;
  label: string;
};

export function ProgressRing({ progress, size = 108, label }: Props) {
  const { theme } = useThemeMode();
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.cardSoft} strokeWidth={stroke} fill="transparent" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.primary}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - clamped * circumference}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { color: theme.colors.text }]}>{Math.round(clamped * 100)}%</Text>
        <Text style={[styles.label, { color: theme.colors.muted }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    position: "absolute",
    alignItems: "center"
  },
  percent: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  label: {
    fontSize: 12,
    fontWeight: "700"
  }
});
