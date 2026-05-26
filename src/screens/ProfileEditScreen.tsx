import * as ImagePicker from "expo-image-picker";
import { Camera, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppButton } from "@/components/AppButton";
import { useAuth } from "@/auth/AuthContext";
import { usePreferences } from "@/preferences/PreferencesContext";
import { useThemeMode } from "@/theme/ThemeProvider";

export function ProfileEditScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { theme } = useThemeMode();
  const { user, updateUsername, updateProfilePhoto } = useAuth();
  const { preferences, updatePreference } = usePreferences();
  const [username, setUsername] = useState(user?.username ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername(user?.username ?? "");
  }, [user?.username]);

  const chooseProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Gallery permission is required to choose a profile photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });
    if (!result.canceled) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        await updateProfilePhoto(uri);
        await updatePreference("profilePhoto", uri);
      }
    }
  };

  const saveProfile = async () => {
    const result = await updateUsername(username);
    if (!result.ok) {
      setError(result.error ?? "Could not save username");
      return;
    }
    await updatePreference("userName", username.trim());
    navigation.goBack();
  };

  return (
    <AppScreen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>User name</Text>
        <TextInput
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            setError("");
          }}
          placeholder="Your name"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
        />
        {error ? <Text style={[styles.error, { color: theme.colors.orange }]}>{error}</Text> : null}
        <View style={styles.photoRow}>
          {user?.profilePhoto || preferences.profilePhoto ? <Image source={{ uri: user?.profilePhoto || preferences.profilePhoto }} style={styles.avatar} /> : <User color={theme.colors.muted} size={34} />}
          <AppButton title="Choose Profile Photo" icon={Camera} variant="ghost" onPress={chooseProfilePhoto} />
        </View>
      </View>
      <AppButton title="Save profile" icon={Camera} onPress={saveProfile} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "900"
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12
  },
  label: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700"
  },
  error: {
    fontSize: 13,
    fontWeight: "800"
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24
  }
});
