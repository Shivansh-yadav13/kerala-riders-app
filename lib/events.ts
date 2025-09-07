import { getAuthToken } from "@/utils";

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Event interfaces
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  maxParticipants?: number;
  category: string;
  difficulty?: string;
  distance?: number;
  registrationDeadline?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    krid: string;
    name?: string;
    email: string;
  };
  participants?: EventParticipant[];
  participantCount?: number;
  userParticipation?: EventParticipant | null;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userKRId: string;
  status: 'registered' | 'waitlist' | 'cancelled';
  registeredAt: string;
  user?: {
    krid: string;
    name?: string;
    email: string;
  };
}

export interface CreateEventData {
  title: string;
  description?: string;
  date: string;
  location: string;
  maxParticipants?: number;
  category: string;
  difficulty?: string;
  distance?: number;
  registrationDeadline?: string;
}

export interface EventFilters {
  category?: string;
  difficulty?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

// Event categories
export const EVENT_CATEGORIES = [
  { value: 'cycling', label: 'Cycling', icon: 'bicycle' },
  { value: 'running', label: 'Running', icon: 'fitness' },
  { value: 'hiking', label: 'Hiking', icon: 'walk' },
  { value: 'swimming', label: 'Swimming', icon: 'water' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
] as const;

export const EVENT_DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

// API functions
export const eventApi = {
  // Get all events with optional filters
  async getEvents(filters?: EventFilters, currentUserKRId?: string): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.difficulty) {
        params.append('difficulty', filters.difficulty);
      }
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters?.location) {
        params.append('location', filters.location);
      }

      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/events${queryString ? `?${queryString}` : ''}`;

      // Try to get auth token, but make the request even if it fails (for public events)
      let headers: HeadersInit = {};
      try {
        const token = await getAuthToken();
        headers = {
          'Authorization': `Bearer ${token}`,
        };
      } catch (authError) {
        console.log('No auth token available, fetching public events only');
      }

      const response = await fetch(url, { headers });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch events');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch events');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch events');
    }
  },

  // Get single event by ID
  async getEventById(eventId: string, currentUserKRId?: string): Promise<Event | null> {
    try {
      // Try to get auth token, but make the request even if it fails (for public events)
      let headers: HeadersInit = {};
      try {
        const token = await getAuthToken();
        headers = {
          'Authorization': `Bearer ${token}`,
        };
      } catch (authError) {
        console.log('No auth token available, fetching public event only');
      }

      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, { headers });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(result.error || 'Failed to fetch event');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch event');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  },

  // Create new event
  async createEvent(eventData: CreateEventData, createdBy: string): Promise<Event> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create event');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error instanceof Error ? error : new Error('Failed to create event');
    }
  },

  // Join event
  async joinEvent(eventId: string, userKRId: string): Promise<EventParticipant> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join event');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to join event');
      }

      return result.data.participation;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error instanceof Error ? error : new Error('Failed to join event');
    }
  },

  // Leave event
  async leaveEvent(eventId: string, userKRId: string): Promise<void> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to leave event');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to leave event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error instanceof Error ? error : new Error('Failed to leave event');
    }
  },

  // Update event (only by creator)
  async updateEvent(eventId: string, updates: Partial<CreateEventData>, userKRId: string): Promise<Event> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update event');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to update event');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error instanceof Error ? error : new Error('Failed to update event');
    }
  },

  // Delete event (only by creator)
  async deleteEvent(eventId: string, userKRId: string): Promise<void> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete event');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error instanceof Error ? error : new Error('Failed to delete event');
    }
  },

  // Get user's created events
  async getUserCreatedEvents(userKRId: string): Promise<Event[]> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userKRId}/events?type=created`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user events');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user events');
      }

      return result.data.events || [];
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch user events');
    }
  },

  // Get user's joined events
  async getUserJoinedEvents(userKRId: string): Promise<Event[]> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userKRId}/events?type=joined`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch joined events');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch joined events');
      }

      return result.data.events || [];
    } catch (error) {
      console.error('Error fetching joined events:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch joined events');
    }
  },
};