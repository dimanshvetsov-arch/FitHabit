import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type UserAccount = {
  id: string;
  username: string;
  password: string;
  profilePhoto?: string;
  createdAt: string;
};

type AuthContextValue = {
  user: UserAccount | null;
  usedUsernames: string[];
  loading: boolean;
  createAccount: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetApp: () => Promise<void>;
  updateUsername: (username: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfilePhoto: (uri: string) => Promise<void>;
};

export const ACCOUNT_KEY = "fithabit:account:v1";
export const USED_USERNAMES_KEY = "fithabit:used-usernames:v1";
const mockUsedUsernames = ["max", "alex", "fitking"];

const Context = createContext<AuthContextValue | null>(null);

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function validateUsername(username: string, used: string[], current?: string) {
  const normalized = normalizeUsername(username);
  if (!normalized) return "Username cannot be empty";
  if (normalized.length < 3) return "Username must be at least 3 characters";
  if (normalized !== normalizeUsername(current ?? "") && used.map(normalizeUsername).includes(normalized)) {
    return "This username is already taken";
  }
  return undefined;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [usedUsernames, setUsedUsernames] = useState<string[]>(mockUsedUsernames);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([AsyncStorage.getItem(ACCOUNT_KEY), AsyncStorage.getItem(USED_USERNAMES_KEY)]).then(([storedUser, storedNames]) => {
      if (storedNames) setUsedUsernames(Array.from(new Set([...mockUsedUsernames, ...(JSON.parse(storedNames) as string[])])));
      if (storedUser) setUser(JSON.parse(storedUser) as UserAccount);
      setLoading(false);
    });
  }, []);

  const persistUser = useCallback(async (next: UserAccount | null) => {
    setUser(next);
    if (next) await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(ACCOUNT_KEY);
  }, []);

  const persistUsed = useCallback(async (names: string[]) => {
    const next = Array.from(new Set(names.map(normalizeUsername)));
    setUsedUsernames(next);
    await AsyncStorage.setItem(USED_USERNAMES_KEY, JSON.stringify(next));
  }, []);

  const createAccount = useCallback(
    async (username: string, password: string) => {
      const usernameError = validateUsername(username, usedUsernames);
      if (usernameError) return { ok: false, error: usernameError };
      if (!password) return { ok: false, error: "Password cannot be empty" };
      if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
      const next: UserAccount = { id: Date.now().toString(), username: username.trim(), password, createdAt: new Date().toISOString() };
      await persistUser(next);
      await persistUsed([...usedUsernames, username]);
      return { ok: true };
    },
    [persistUsed, persistUser, usedUsernames]
  );

  const updateUsername = useCallback(
    async (username: string) => {
      if (!user) return { ok: false, error: "No account found" };
      const usernameError = validateUsername(username, usedUsernames, user.username);
      if (usernameError) return { ok: false, error: usernameError };
      const next = { ...user, username: username.trim() };
      await persistUser(next);
      await persistUsed([...usedUsernames, username]);
      return { ok: true };
    },
    [persistUsed, persistUser, usedUsernames, user]
  );

  const updateProfilePhoto = useCallback(
    async (uri: string) => {
      if (user) await persistUser({ ...user, profilePhoto: uri });
    },
    [persistUser, user]
  );

  const logout = useCallback(async () => persistUser(null), [persistUser]);

  const resetApp = useCallback(async () => {
    await AsyncStorage.clear();
    setUser(null);
    setUsedUsernames(mockUsedUsernames);
  }, []);

  const value = useMemo(
    () => ({ user, usedUsernames, loading, createAccount, logout, resetApp, updateUsername, updateProfilePhoto }),
    [createAccount, loading, logout, resetApp, updateProfilePhoto, updateUsername, usedUsernames, user]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
