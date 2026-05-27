export const storageKeys = {
  auth: "@accounts",
  currentUser: "@currentUser",
  settings: "@settings",
  goals: "@goals",
  workoutHistory: "@workoutHistory",
  progress: "@progress",
  exerciseStats: "@exerciseStats"
} as const;

export const legacyStorageKeys = {
  account: "fithabit:account:v1",
  auth: "@auth",
  accounts: "fithabit:accounts:v1",
  currentUser: "fithabit:session:v1",
  usedUsernames: "fithabit:used-usernames:v1",
  settings: "fithabit:preferences:v1",
  goals: "fithabit:goals:v1",
  workoutHistory: "fithabit:workouts:v2",
  oldWorkoutHistory: "fithabit:workouts"
} as const;
