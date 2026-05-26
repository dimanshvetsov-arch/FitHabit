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
    trackingType: "reps_sets",
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
    trackingType: "reps_sets",
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
    trackingType: "reps_sets",
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
    trackingType: "reps_sets",
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
    trackingType: "timer_only",
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
    trackingType: "reps_sets",
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
    trackingType: "reps_sets",
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
    trackingType: "reps_timer",
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
    trackingType: "reps_sets",
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
    trackingType: "reps_sets",
    muscles: ["Back", "Glutes", "Hamstrings"],
    variations: ["Conventional Deadlift", "Romanian Deadlift", "Sumo Deadlift", "Dumbbell Deadlift", "Trap Bar Deadlift"]
  },
  {
    id: "wall-sit",
    name: "Wall Sit",
    category: "Legs",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=85",
    description: "A simple timed leg endurance hold.",
    accent: "#22C55E",
    difficulty: "Medium",
    trackingType: "timer_only",
    muscles: ["Quads", "Glutes", "Core"],
    variations: ["Standard Wall Sit", "Weighted Wall Sit", "Single-Leg Wall Sit", "Wall Sit Calf Raise"]
  },
  {
    id: "hollow-hold",
    name: "Hollow Hold",
    category: "Core",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=85",
    description: "A clean core tension drill for beginners.",
    accent: "#F59E0B",
    difficulty: "Medium",
    trackingType: "timer_only",
    muscles: ["Abs", "Core"],
    variations: ["Standard Hollow Hold", "Tuck Hollow Hold", "Hollow Rock", "Single-Leg Hollow Hold"]
  },
  {
    id: "running",
    name: "Running",
    category: "Cardio",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=85",
    description: "Distance and time based cardio training.",
    accent: "#06B6D4",
    difficulty: "Medium",
    trackingType: "distance_time",
    muscles: ["Cardio", "Legs"],
    variations: ["Easy Run", "Tempo Run", "Intervals", "Long Run", "Recovery Run"]
  },
  {
    id: "walking",
    name: "Walking",
    category: "Cardio",
    image: "https://images.unsplash.com/photo-1475274110913-480c45d0e873?auto=format&fit=crop&w=1200&q=85",
    description: "Low-impact distance and time tracking.",
    accent: "#22C55E",
    difficulty: "Easy",
    trackingType: "distance_time",
    muscles: ["Cardio", "Legs"],
    variations: ["Easy Walk", "Brisk Walk", "Incline Walk", "Outdoor Walk", "Treadmill Walk"]
  },
  {
    id: "cycling",
    name: "Cycling",
    category: "Cardio",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=85",
    description: "Distance and goal-time rides.",
    accent: "#6366F1",
    difficulty: "Medium",
    trackingType: "distance_time",
    muscles: ["Cardio", "Quads", "Glutes"],
    variations: ["Easy Ride", "Interval Ride", "Hill Ride", "Endurance Ride", "Recovery Ride"]
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    category: "Cardio",
    image: "https://images.unsplash.com/photo-1598971639058-a67f5f7b1f4f?auto=format&fit=crop&w=1200&q=85",
    description: "Timed cardio with an optional rep goal.",
    accent: "#EF4444",
    difficulty: "Medium",
    trackingType: "reps_timer",
    muscles: ["Core", "Cardio", "Shoulders"],
    variations: ["Standard Mountain Climber", "Slow Mountain Climber", "Cross-Body Mountain Climber", "Slider Mountain Climber"]
  },
  {
    id: "high-knees",
    name: "High Knees",
    category: "Cardio",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=85",
    description: "Timed cardio rounds with optional reps.",
    accent: "#06B6D4",
    difficulty: "Easy",
    trackingType: "reps_timer",
    muscles: ["Cardio", "Core", "Legs"],
    variations: ["Standard High Knees", "Marching High Knees", "Sprint High Knees", "High Knees With Reach"]
  }
];

export const motivationalMessages = [
  "Small reps stack into serious strength.",
  "Show up today. Let momentum do the rest.",
  "Clean form beats rushed volume.",
  "Your streak starts with the next set."
];
