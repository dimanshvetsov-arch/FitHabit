import { Exercise, PushUpType } from "@/types";
import { images } from "./images";

export const exercises: Exercise[] = [
  { id: "push-ups", name: "Push Ups", category: "Push", image: images.pushUpBanner, description: "Chest, shoulders, triceps", accent: "#8B5CF6" },
  { id: "pull-ups", name: "Pull Ups", category: "Pull", image: images.workoutGym, description: "Back and biceps strength", accent: "#6366F1" },
  { id: "squats", name: "Squats", category: "Legs", image: images.fitnessBackground, description: "Quads, glutes, core", accent: "#22C55E" },
  { id: "plank", name: "Plank", category: "Core", image: images.progress, description: "Core stability and control", accent: "#F59E0B" },
  { id: "dips", name: "Dips", category: "Push", image: images.workoutGym, description: "Arms, chest, shoulders", accent: "#8B5CF6" },
  { id: "bench-press", name: "Bench Press", category: "Push", image: images.homeHero, description: "Upper-body power", accent: "#6366F1" }
];

export const pushUpTypes: PushUpType[] = [
  { id: "standard", name: "Standard Push Up", description: "Balanced chest, shoulder, and triceps work.", difficulty: "Easy", image: images.pushUp },
  { id: "diamond", name: "Diamond Push Up", description: "Close-grip variation for triceps intensity.", difficulty: "Hard", image: images.pushUp },
  { id: "wide", name: "Wide Push Up", description: "More chest emphasis with a wider base.", difficulty: "Medium", image: images.pushUp },
  { id: "incline", name: "Incline Push Up", description: "Approachable angle for cleaner volume.", difficulty: "Easy", image: images.pushUp },
  { id: "decline", name: "Decline Push Up", description: "Elevated feet for upper-chest strength.", difficulty: "Hard", image: images.pushUp }
];

export const motivationalMessages = [
  "Small reps stack into serious strength.",
  "Show up today. Let momentum do the rest.",
  "Clean form beats rushed volume.",
  "Your streak starts with the next set."
];
