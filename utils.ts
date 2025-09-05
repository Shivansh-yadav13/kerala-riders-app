import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "./stores/auth";

export const getTodayEpochSeconds = () => {
  const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const endOfDay = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

  return { startOfDay, endOfDay };
};

export const getAuthToken = async (): Promise<string> => {
  try {
    // First try to get from auth store directly (if available in current context)
    const authState = useAuthStore.getState();
    if (authState.session?.access_token) {
      // Check if token is expired
      const now = new Date().getTime() / 1000;
      if (authState.session.expires_at && authState.session.expires_at < now) {
        // Try to refresh the session
        await authState.refreshSession();
        const refreshedState = useAuthStore.getState();
        if (refreshedState.session?.access_token) {
          return refreshedState.session.access_token;
        }
      } else {
        return authState.session.access_token;
      }
    }

    // Fallback: Get the session from AsyncStorage (where auth store persists it)
    const authStorage = await AsyncStorage.getItem("auth-storage");
    if (!authStorage) {
      throw new Error("No auth session found");
    }

    const authData = JSON.parse(authStorage);
    const session = authData?.state?.session;

    if (!session?.access_token) {
      throw new Error("No access token found in session");
    }

    // Check if token is expired
    const now = new Date().getTime() / 1000;
    if (session.expires_at && session.expires_at < now) {
      throw new Error("Access token has expired");
    }

    return session.access_token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw new Error("Failed to get authentication token");
  }
};
