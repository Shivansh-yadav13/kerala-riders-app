import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuthStore } from "./auth";

export interface Activity {
  id: string;
  name: string;
  type: string;
  sportType: string;
  distance: number; // in meters
  movingTime: number; // in seconds (was duration)
  elapsedTime: number; // in seconds
  totalElevation: number; // in meters (was elevationGain)
  startDate: string; // ISO string
  startDateLocal: string; // ISO string
  timezone?: string;
  averageSpeed?: number;
  maxSpeed?: number;
  workoutType?: number;
  createdAt: string; // ISO string
  // Legacy fields for backward compatibility
  duration?: number; // computed from movingTime
  elevationGain?: number; // computed from totalElevation
  date?: Date; // computed from startDate
}


// API Response interfaces
export interface ActivityApiResponse {
  success: boolean;
  data: {
    activities: Activity[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
      totalPages: number;
      currentPage: number;
    };
    filters: {
      email: string | null;
      krid: string | null;
      sportType: string | null;
      startDate: string | null;
      endDate: string | null;
    };
  };
}

export interface ActivityFilters {
  sportType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  lastSyncedAt: Date | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  } | null;
  filters: ActivityFilters | null;
  isLoadingMore: boolean;
}

interface ActivityActions {
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  clearActivities: () => void;
  clearError: () => void;
  // API actions
  fetchActivities: (userIdentifier: string, filters?: ActivityFilters, replace?: boolean) => Promise<void>;
  loadMoreActivities: (userIdentifier: string) => Promise<void>;
  refreshActivities: (userIdentifier: string, filters?: ActivityFilters) => Promise<void>;
  setFilters: (filters: ActivityFilters) => void;
  // Helper to normalize API activities to legacy format
  normalizeActivity: (activity: Activity) => Activity;
}

type ActivityStore = ActivityState & ActivityActions;

const generateId = () => Math.random().toString(36).substr(2, 9);

// API Configuration
const API_BASE_URL = 'http://localhost:3000'; // Replace with your actual webapp URL in production

// Helper to get auth token from the auth store
const getAuthToken = async (): Promise<string> => {
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
    const authStorage = await AsyncStorage.getItem('auth-storage');
    if (!authStorage) {
      throw new Error('No auth session found');
    }

    const authData = JSON.parse(authStorage);
    const session = authData?.state?.session;
    
    if (!session?.access_token) {
      throw new Error('No access token found in session');
    }

    // Check if token is expired
    const now = new Date().getTime() / 1000;
    if (session.expires_at && session.expires_at < now) {
      throw new Error('Access token has expired');
    }

    return session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Failed to get authentication token');
  }
};


export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],
      loading: false,
      error: null,
      lastSyncedAt: null,
      pagination: null,
      filters: null,
      isLoadingMore: false,

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: generateId(),
        };
        
        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
      },

      updateActivity: (id, updates) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === id ? { ...activity, ...updates } : activity
          ),
        }));
      },

      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        }));
      },

      clearActivities: () => {
        set({
          activities: [],
          lastSyncedAt: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // Helper to normalize API activities to legacy format
      normalizeActivity: (activity: Activity): Activity => {
        return {
          ...activity,
          // Add computed legacy fields for backward compatibility
          duration: activity.movingTime,
          elevationGain: activity.totalElevation,
          date: new Date(activity.startDate),
        };
      },

      // Fetch activities from API
      fetchActivities: async (userIdentifier: string, filters?: ActivityFilters, replace: boolean = true) => {
        set({ loading: true, error: null });

        try {
          const token = await getAuthToken();
          if (!token) {
            throw new Error('No authentication token available');
          }

          // Build query parameters
          const params = new URLSearchParams();
          
          // Determine if userIdentifier is email or krid
          if (userIdentifier.includes('@')) {
            params.append('email', userIdentifier);
          } else {
            params.append('krid', userIdentifier);
          }

          if (filters?.sportType) params.append('sportType', filters.sportType);
          if (filters?.startDate) params.append('startDate', filters.startDate);
          if (filters?.endDate) params.append('endDate', filters.endDate);
          if (filters?.limit) params.append('limit', filters.limit.toString());
          if (filters?.offset) params.append('offset', filters.offset.toString());

          const response = await fetch(`${API_BASE_URL}/api/user/activity/get-all?${params}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }

          const data: ActivityApiResponse = await response.json();

          if (!data.success) {
            throw new Error('API returned error response');
          }

          // Normalize activities
          const normalizedActivities = data.data.activities.map(get().normalizeActivity);

          set((state) => ({
            activities: replace ? normalizedActivities : [...state.activities, ...normalizedActivities],
            pagination: data.data.pagination,
            filters: filters || null,
            loading: false,
            error: null,
            lastSyncedAt: new Date(),
          }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch activities';
          console.error('Error fetching activities:', error);
          set({
            loading: false,
            error: errorMessage,
          });
        }
      },

      // Load more activities (pagination)
      loadMoreActivities: async (userIdentifier: string) => {
        const { pagination, filters, isLoadingMore } = get();
        
        if (isLoadingMore || !pagination?.hasMore) return;

        set({ isLoadingMore: true, error: null });

        try {
          const nextFilters = {
            ...filters,
            offset: (filters?.offset || 0) + (filters?.limit || 50),
          };

          await get().fetchActivities(userIdentifier, nextFilters, false);
        } finally {
          set({ isLoadingMore: false });
        }
      },

      // Refresh activities (clear and fetch from beginning)
      refreshActivities: async (userIdentifier: string, filters?: ActivityFilters) => {
        const refreshFilters = { ...filters, offset: 0 };
        await get().fetchActivities(userIdentifier, refreshFilters, true);
      },

      // Set filters
      setFilters: (filters: ActivityFilters) => {
        set({ filters });
      },
    }),
    {
      name: "activity-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activities: state.activities,
        lastSyncedAt: state.lastSyncedAt,
        pagination: state.pagination,
        filters: state.filters,
      }),
    }
  )
);