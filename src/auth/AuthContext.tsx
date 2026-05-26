import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { legacyStorageKeys, storageKeys } from "@/storage/keys";

export type UserAccount = {
  id: string;
  username: string;
  password: string;
  profilePhoto?: string;
  createdAt: string;
};

type AuthContextValue = {
  user: UserAccount | null;
  currentUser: UserAccount | null;
  usedUsernames: string[];
  loading: boolean;
  createAccount: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetApp: () => Promise<void>;
  updateUsername: (username: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfilePhoto: (uri: string) => Promise<void>;
};

export const ACCOUNT_KEY = legacyStorageKeys.account;
export const ACCOUNTS_KEY = storageKeys.auth;
export const SESSION_KEY = storageKeys.currentUser;
export const USED_USERNAMES_KEY = `${storageKeys.auth}:usedUsernames`;
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
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [usedUsernames, setUsedUsernames] = useState<string[]>(mockUsedUsernames);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(ACCOUNT_KEY),
      AsyncStorage.getItem(ACCOUNTS_KEY),
      AsyncStorage.getItem(legacyStorageKeys.accounts),
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(legacyStorageKeys.currentUser),
      AsyncStorage.getItem(USED_USERNAMES_KEY),
      AsyncStorage.getItem(legacyStorageKeys.usedUsernames)
    ]).then(async ([storedUser, storedAccounts, legacyAccounts, storedSession, legacySession, storedNames, legacyNames]) => {
      const legacyUser = storedUser ? (JSON.parse(storedUser) as UserAccount) : null;
      const savedAccounts = storedAccounts ? (JSON.parse(storedAccounts) as UserAccount[]) : legacyAccounts ? (JSON.parse(legacyAccounts) as UserAccount[]) : legacyUser ? [legacyUser] : [];
      const sessionId = storedSession ? (JSON.parse(storedSession) as string) : legacySession ? (JSON.parse(legacySession) as string) : undefined;
      const sessionUser = savedAccounts.find((account) => account.id === sessionId) ?? null;
      setAccounts(savedAccounts);
      setUser(sessionUser);
      const names = savedAccounts.map((account) => account.username);
      if (storedNames) names.push(...(JSON.parse(storedNames) as string[]));
      if (legacyNames) names.push(...(JSON.parse(legacyNames) as string[]));
      setUsedUsernames(Array.from(new Set([...mockUsedUsernames, ...names].map(normalizeUsername))));
      if (!storedAccounts && savedAccounts.length) await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(savedAccounts));
      if (!storedSession && sessionUser) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser.id));
      setLoading(false);
    });
  }, []);

  const persistAccounts = useCallback(async (next: UserAccount[]) => {
    setAccounts(next);
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
  }, []);

  const persistSession = useCallback(async (next: UserAccount | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next.id));
    } else {
      await AsyncStorage.multiRemove([SESSION_KEY, legacyStorageKeys.currentUser, ACCOUNT_KEY]);
    }
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
      await persistAccounts([...accounts, next]);
      await persistSession(next);
      await persistUsed([...usedUsernames, username]);
      return { ok: true };
    },
    [accounts, persistAccounts, persistSession, persistUsed, usedUsernames]
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const account = accounts.find((item) => normalizeUsername(item.username) === normalizeUsername(username));
      if (!account || account.password !== password) {
        return { ok: false, error: "Incorrect username or password" };
      }
      await persistSession(account);
      return { ok: true };
    },
    [accounts, persistSession]
  );

  const updateUsername = useCallback(
    async (username: string) => {
      if (!user) return { ok: false, error: "No account found" };
      const usernameError = validateUsername(username, usedUsernames, user.username);
      if (usernameError) return { ok: false, error: usernameError };
      const next = { ...user, username: username.trim() };
      await persistAccounts(accounts.map((account) => account.id === next.id ? next : account));
      await persistSession(next);
      await persistUsed([...usedUsernames, username]);
      return { ok: true };
    },
    [accounts, persistAccounts, persistSession, persistUsed, usedUsernames, user]
  );

  const updateProfilePhoto = useCallback(
    async (uri: string) => {
      if (!user) return;
      const next = { ...user, profilePhoto: uri };
      await persistAccounts(accounts.map((account) => account.id === next.id ? next : account));
      await persistSession(next);
    },
    [accounts, persistAccounts, persistSession, user]
  );

  const logout = useCallback(async () => persistSession(null), [persistSession]);

  const resetApp = useCallback(async () => {
    await AsyncStorage.clear();
    setUser(null);
    setAccounts([]);
    setUsedUsernames(mockUsedUsernames);
  }, []);

  const value = useMemo(
    () => ({ user, currentUser: user, usedUsernames, loading, createAccount, login, logout, resetApp, updateUsername, updateProfilePhoto }),
    [createAccount, loading, login, logout, resetApp, updateProfilePhoto, updateUsername, usedUsernames, user]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
