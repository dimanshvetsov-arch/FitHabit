import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";

type SoundName = "tap" | "start" | "tick" | "success" | "warning";

type FeedbackSettings = {
  sounds: boolean;
  voice: boolean;
};

const SETTINGS_KEY = "fithabit:feedback-settings";
const DEFAULT_SETTINGS: FeedbackSettings = { sounds: true, voice: true };

const soundAssets: Record<SoundName, number> = {
  tap: require("../../assets/sounds/tap.wav"),
  start: require("../../assets/sounds/start.wav"),
  tick: require("../../assets/sounds/tick.wav"),
  success: require("../../assets/sounds/success.wav"),
  warning: require("../../assets/sounds/warning.wav")
};

let audioReady = false;
const cache = new Map<SoundName, Audio.Sound>();

async function ensureAudioMode() {
  if (audioReady) return;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    playThroughEarpieceAndroid: false
  });
  audioReady = true;
}

async function getSettings(): Promise<FeedbackSettings> {
  const stored = await AsyncStorage.getItem(SETTINGS_KEY);
  return stored ? { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<FeedbackSettings>) } : DEFAULT_SETTINGS;
}

export async function loadFeedbackSettings() {
  return getSettings();
}

export async function saveFeedbackSettings(settings: FeedbackSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function playFeedbackSound(name: SoundName) {
  const settings = await getSettings();
  if (!settings.sounds) return;
  try {
    await ensureAudioMode();
    let sound = cache.get(name);
    if (!sound) {
      const created = await Audio.Sound.createAsync(soundAssets[name], { volume: name === "tick" ? 0.42 : 0.62 });
      sound = created.sound;
      cache.set(name, sound);
    }
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Audio can be unavailable in some browser/device contexts; haptics still carry feedback.
  }
}

export async function speakFeedback(text: string) {
  const settings = await getSettings();
  if (!settings.voice) return;
  try {
    Speech.stop();
    Speech.speak(text, {
      pitch: 1.03,
      rate: 0.94
    });
  } catch {
    // Speech availability varies by platform.
  }
}

export async function tapFeedback() {
  void Haptics.selectionAsync();
  await playFeedbackSound("tap");
}

export async function actionFeedback(sound: SoundName, voice?: string) {
  void Haptics.impactAsync(sound === "warning" ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
  await playFeedbackSound(sound);
  if (voice) {
    await speakFeedback(voice);
  }
}
