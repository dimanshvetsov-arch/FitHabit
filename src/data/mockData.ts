import { Exercise } from "@/types";
import { images } from "./images";

export const exercises: Exercise[] = [
  {
    id: "push-ups",
    name: "Push Ups",
    category: "Push",
    image: images.pushUp,
    description: "The classic upper-body bodyweight builder.",
    accent: "#8B5CF6",
    difficulty: "Easy",
    muscles: ["Chest", "Triceps", "Shoulders"],
    variations: ["Standard Push Up", "Wide Push Up", "Diamond Push Up", "Incline Push Up", "Decline Push Up", "Knee Push Up"]
  },
  {
    id: "pull-ups",
    name: "Pull Ups",
    category: "Pull",
    image: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?auto=format&fit=crop&w=1200&q=85",
    description: "Simple, powerful back and biceps training.",
    accent: "#6366F1",
    difficulty: "Hard",
    muscles: ["Back", "Biceps"],
    variations: ["Standard Pull Up", "Chin Up", "Wide Grip Pull Up", "Assisted Pull Up", "Negative Pull Up"]
  },
  {
    id: "squats",
    name: "Squats",
    category: "Legs",
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=85",
    description: "Beginner-friendly lower-body strength.",
    accent: "#22C55E",
    difficulty: "Easy",
    muscles: ["Quads", "Glutes", "Hamstrings"],
    variations: ["Bodyweight Squat", "Jump Squat", "Sumo Squat", "Goblet Squat", "Bulgarian Split Squat"]
  },
  {
    id: "lunges",
    name: "Lunges",
    category: "Legs",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
    description: "Single-leg control for stronger legs and hips.",
    accent: "#22C55E",
    difficulty: "Medium",
    muscles: ["Quads", "Glutes", "Hamstrings"],
    variations: ["Forward Lunge", "Reverse Lunge", "Walking Lunge", "Jumping Lunge", "Side Lunge"]
  },
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=85",
    description: "Core stability without complicated movement.",
    accent: "#F59E0B",
    difficulty: "Easy",
    muscles: ["Abs", "Core", "Shoulders"],
    variations: ["Standard Plank", "Side Plank", "Elbow Plank", "High Plank", "Plank Shoulder Taps"]
  },
  {
    id: "sit-ups",
    name: "Sit Ups",
    category: "Core",
    image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=85",
    description: "Basic core volume with easy variations.",
    accent: "#F59E0B",
    difficulty: "Easy",
    muscles: ["Abs", "Core"],
    variations: ["Standard Sit Up", "Crunch", "Bicycle Crunch", "Reverse Crunch", "V-Up"]
  },
  {
    id: "burpees",
    name: "Burpees",
    category: "Full Body",
    image: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=1200&q=85",
    description: "A compact full-body conditioning move.",
    accent: "#EF4444",
    difficulty: "Hard",
    muscles: ["Full Body", "Cardio"],
    variations: ["Standard Burpee", "Half Burpee", "Burpee Push Up", "Burpee Tuck Jump", "Slow Burpee"]
  },
  {
    id: "jumping-jacks",
    name: "Jumping Jacks",
    category: "Cardio",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
    description: "Fast, simple cardio for warmups and finishers.",
    accent: "#06B6D4",
    difficulty: "Easy",
    muscles: ["Full Body", "Cardio"],
    variations: ["Standard Jumping Jack", "Step Jack", "Power Jack", "Cross Jack", "Squat Jack"]
  },
  {
    id: "bench-press",
    name: "Bench Press",
    category: "Gym",
    image: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=1200&q=85",
    description: "The standard gym press for chest strength.",
    accent: "#6366F1",
    difficulty: "Medium",
    muscles: ["Chest", "Triceps", "Shoulders"],
    variations: ["Flat Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Bench Press", "Close Grip Bench Press"]
  },
  {
    id: "deadlift",
    name: "Deadlift",
    category: "Gym",
    image: "https://images.unsplash.com/photo-1598266663439-2056e6900339?auto=format&fit=crop&w=1200&q=85",
    description: "A fundamental hinge for posterior-chain strength.",
    accent: "#8B5CF6",
    difficulty: "Hard",
    muscles: ["Back", "Glutes", "Hamstrings"],
    variations: ["Conventional Deadlift", "Romanian Deadlift", "Sumo Deadlift", "Dumbbell Deadlift", "Trap Bar Deadlift"]
  }
];

export const motivationalMessages = [
  "Small reps stack into serious strength.",
  "Show up today. Let momentum do the rest.",
  "Clean form beats rushed volume.",
  "Your streak starts with the next set."
];
