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

type CurrentUserSession = {
  id: string;
  username: string;
};

type AuthResult = { ok: boolean; error?: string };

type AuthContextValue = {
  user: UserAccount | null;
  currentUser: UserAccount | null;
  usedUsernames: string[];
  loading: boolean;
  loadAuthState: () => Promise<void>;
  createAccount: (username: string, password: string) => Promise<AuthResult>;
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetApp: () => Promise<void>;
  updateUsername: (username: string) => Promise<AuthResult>;
  updateProfilePhoto: (uri: string) => Promise<void>;
};

export const ACCOUNTS_KEY = storageKeys.auth;
export const CURRENT_USER_KEY = storageKeys.currentUser;

const mockUsedUsernames = ["max", "alex", "fitking"];
const Context = createContext<AuthContextValue | null>(null);

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function sessionFor(account: UserAccount): CurrentUserSession {
  return { id: account.id, username: account.username };
}

function validateUsername(username: string, accounts: UserAccount[], currentId?: string) {
  const normalized = normalizeUsername(username);
  if (!normalized) return "Username cannot be empty";
  if (normalized.length < 3) return "Username must be at least 3 characters";
  if (accounts.some((account) => account.id !== currentId && normalizeUsername(account.username) === normalized)) {
    return "This username is already taken";
  }
  if (!currentId && mockUsedUsernames.includes(normalized)) {
    return "This username is already taken";
  }
  return undefined;
}

async function readAccounts() {
  const stored = await AsyncStorage.getItem(ACCOUNTS_KEY);
  if (stored) return JSON.parse(stored) as UserAccount[];

  const legacyAccounts = await AsyncStorage.getItem(legacyStorageKeys.auth) ?? await AsyncStorage.getItem(legacyStorageKeys.accounts);
  if (legacyAccounts) {
    const parsed = JSON.parse(legacyAccounts) as UserAccount[];
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(parsed));
    return parsed;
  }

  const legacyAccount = await AsyncStorage.getItem(legacyStorageKeys.account);
  if (legacyAccount) {
    const parsed = [JSON.parse(legacyAccount) as UserAccount];
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(parsed));
    return parsed;
  }

  return [];
}

async function readCurrentSession() {
  const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  const parsed = JSON.parse(stored) as CurrentUserSession | string;
  return typeof parsed === "string" ? { id: parsed, username: "" } : parsed;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const usedUsernames = useMemo(() => Array.from(new Set([...mockUsedUsernames, ...accounts.map((account) => normalizeUsername(account.username))])), [accounts]);

  const loadAuthState = useCallback(async () => {
    setLoading(true);
    const savedAccounts = await readAccounts();
    const session = await readCurrentSession();
    const sessionAccount = session ? savedAccounts.find((account) => account.id === session.id || normalizeUsername(account.username) === normalizeUsername(session.username)) ?? null : null;
    setAccounts(savedAccounts);
    setCurrentUser(sessionAccount);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAuthState();
  }, [loadAuthState]);

  const saveAccounts = useCallback(async (next: UserAccount[]) => {
    setAccounts(next);
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
  }, []);

  const saveCurrentUser = useCallback(async (account: UserAccount | null) => {
    setCurrentUser(account);
    if (account) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionFor(account)));
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
  }, []);

  const createAccount = useCallback(
    async (username: string, password: string) => {
      const savedAccounts = await readAccounts();
      const usernameError = validateUsername(username, savedAccounts);
      if (usernameError) return { ok: false, error: usernameError };
      if (!password) return { ok: false, error: "Password cannot be empty" };
      if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };

      const account: UserAccount = {
        id: `user_${Date.now()}`,
        username: username.trim(),
        password,
        createdAt: new Date().toISOString()
      };
      const nextAccounts = [...savedAccounts, account];
      await saveAccounts(nextAccounts);
      await saveCurrentUser(account);
      return { ok: true };
    },
    [saveAccounts, saveCurrentUser]
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const savedAccounts = await readAccounts();
      const account = savedAccounts.find((item) => normalizeUsername(item.username) === normalizeUsername(username));
      if (!account || account.password !== password) {
        return { ok: false, error: "Incorrect username or password" };
      }
      setAccounts(savedAccounts);
      await saveCurrentUser(account);
      return { ok: true };
    },
    [saveCurrentUser]
  );

  const logout = useCallback(async () => {
    await saveCurrentUser(null);
  }, [saveCurrentUser]);

  const resetApp = useCallback(async () => {
    await AsyncStorage.clear();
    setAccounts([]);
    setCurrentUser(null);
  }, []);

  const updateUsername = useCallback(
    async (username: string) => {
      if (!currentUser) return { ok: false, error: "No account found" };
      const savedAccounts = await readAccounts();
      const usernameError = validateUsername(username, savedAccounts, currentUser.id);
      if (usernameError) return { ok: false, error: usernameError };
      const nextUser = { ...currentUser, username: username.trim() };
      const nextAccounts = savedAccounts.map((account) => account.id === nextUser.id ? nextUser : account);
      await saveAccounts(nextAccounts);
      await saveCurrentUser(nextUser);
      return { ok: true };
    },
    [currentUser, saveAccounts, saveCurrentUser]
  );

  const updateProfilePhoto = useCallback(
    async (uri: string) => {
      if (!currentUser) return;
      const savedAccounts = await readAccounts();
      const nextUser = { ...currentUser, profilePhoto: uri };
      const nextAccounts = savedAccounts.map((account) => account.id === nextUser.id ? nextUser : account);
      await saveAccounts(nextAccounts);
      await saveCurrentUser(nextUser);
    },
    [currentUser, saveAccounts, saveCurrentUser]
  );

  const value = useMemo(
    () => ({
      user: currentUser,
      currentUser,
      usedUsernames,
      loading,
      loadAuthState,
      createAccount,
      login,
      logout,
      resetApp,
      updateUsername,
      updateProfilePhoto
    }),
    [createAccount, currentUser, loadAuthState, loading, login, logout, resetApp, updateProfilePhoto, updateUsername, usedUsernames]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
