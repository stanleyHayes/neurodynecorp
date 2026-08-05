import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "neurodyne_mobile_token";
export const REFRESH_KEY = "neurodyne_mobile_refresh";
export const USER_KEY = "neurodyne_mobile_user";
const sessionClearedListeners = new Set<() => void>();

export const authStorage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_KEY),
  getUser: () => SecureStore.getItemAsync(USER_KEY),
  setSession: async (token: string, user: unknown, refreshToken?: string) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
      refreshToken
        ? SecureStore.setItemAsync(REFRESH_KEY, refreshToken)
        : Promise.resolve(),
    ]);
  },
  setTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
    ]);
  },
  setUser: async (user: unknown) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    sessionClearedListeners.forEach((listener) => listener());
  },
  onSessionCleared: (listener: () => void) => {
    sessionClearedListeners.add(listener);
    return () => { sessionClearedListeners.delete(listener); };
  },
};
