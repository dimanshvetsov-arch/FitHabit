import { Eye } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useThemeMode } from "@/theme/ThemeProvider";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function PasswordInput({ value, onChangeText, placeholder }: Props) {
  const { theme } = useThemeMode();
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrap, { borderColor: theme.colors.border }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        secureTextEntry={!visible}
        style={[styles.input, { color: theme.colors.text }]}
      />
      <Pressable
        onPressIn={() => setVisible(true)}
        onPressOut={() => setVisible(false)}
        onResponderRelease={() => setVisible(false)}
        style={styles.eyeButton}
      >
        <Eye color={visible ? theme.colors.primary : theme.colors.muted} size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 16,
    fontWeight: "700"
  },
  eyeButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center"
  }
});
