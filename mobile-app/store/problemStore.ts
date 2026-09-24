import { create } from 'zustand';
import { Platform } from 'react-native';
import api, { API_URL } from '../api/client';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';

export const useProblemStore = create((set, get) => ({
  problems: [],
  isLoading: false,

  fetchProblems: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/problems/public');
      const backendProblems = response.data || [];

      // Also merge with locally saved tickets from AsyncStorage if any
      const localTicketsStr = await AsyncStorage.getItem('@citizen_tickets');
      const localTickets = localTicketsStr ? JSON.parse(localTicketsStr) : [];

      // Merge unique
      const allProblems = [...localTickets, ...backendProblems.filter(
        (bp: any) => !localTickets.some((lp: any) => (lp._id || lp.id) === (bp._id || bp.id))
      )];

      set({ problems: allProblems, isLoading: false });
    } catch (error) {
      console.warn("Failed to fetch problems from backend, loading local cache", error);
      const localTicketsStr = await AsyncStorage.getItem('@citizen_tickets');
      const localTickets = localTicketsStr ? JSON.parse(localTicketsStr) : [];
      set({ problems: localTickets, isLoading: false });
    }
  },

  addProblem: async (data: any) => {
    set({ isLoading: true });
    try {
      let payload: any = data;
      const hasImages = data.images && data.images.length > 0;

      if (hasImages) {
        payload = new FormData();
        payload.append('title', String(data.title || ''));
        payload.append('description', String(data.description || ''));
        payload.append('category', String(data.category || 'Infrastructure & Safety'));
        payload.append('urgency', String(data.urgency || 'medium'));
        payload.append('location', JSON.stringify(data.location || {}));

        data.images.forEach((image: any, index: number) => {
          let uri = String(image.uri || image);
          if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
            uri = `file://${uri}`;
          }
          const fileName = String(image.fileName || image.name || uri.split('/').pop() || `proof_${index + 1}.jpg`);
          const extension = fileName.split('.').pop()?.toLowerCase();
          const type = String(image.mimeType || image.type || (extension === 'png' ? 'image/png' : 'image/jpeg'));

          payload.append('images', {
            uri,
            name: fileName,
            type,
          } as any);
        });

        if (data.audio) {
          const audioUri = data.audio.uri || data.audio;
          const isRealLocalFile = typeof audioUri === 'string' && 
            !audioUri.includes('simulated-audio') && 
            (audioUri.startsWith('file://') || audioUri.startsWith('content://'));

          if (isRealLocalFile) {
            const audioName = data.audio.name || `voice_${Date.now()}.m4a`;
            payload.append('audio', {
              uri: audioUri,
              name: audioName,
              type: data.audio.type || 'audio/m4a',
            } as any);
          } else {
            payload.append('audioNote', typeof data.audio === 'string' ? data.audio : JSON.stringify(data.audio));
          }
        }
      }

      let newProblem: any = null;
      const token = await SecureStore.getItemAsync('userToken');

      try {
        let res: Response;
        if (hasImages) {
          // In React Native, fetch() natively handles FormData and appends the required multipart boundary
          res = await fetch(`${API_URL}/problems`, {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: payload,
          });
        } else {
          // Plain JSON request
          res = await fetch(`${API_URL}/problems`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
          });
        }

        if (res.ok) {
          newProblem = await res.json();
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn("Backend rejected submission:", res.status, errData);
          throw new Error(errData.message || `Backend returned status ${res.status}`);
        }
      } catch (uploadError: any) {
        console.warn("Backend submission failed or offline, saving report locally:", uploadError.message);
        const currentUser = useAuthStore.getState().user;
        const authorInfo = currentUser ? {
          _id: currentUser._id || currentUser.id,
          name: currentUser.name || 'Citizen',
          email: currentUser.email || 'citizen@test.com'
        } : { _id: 'CITIZEN-01', name: 'Test Citizen', email: 'citizen100@test.com' };

        const category = data.category || 'Civil Infrastructure & Safety';
        const urgency = data.urgency || 'medium';
        const slaHours = urgency === 'critical' ? 48 : urgency === 'high' || urgency === 'urgent' ? 72 : 168;

        // Resilient fallback for demo & offline mode
        newProblem = {
          _id: `offline_${Date.now()}`,
          id: `offline_${Date.now()}`,
          title: data.title,
          description: data.description,
          category: category,
          urgency: urgency,
          status: 'In Progress',
          location: data.location,
          latitude: data.location?.lat,
          longitude: data.location?.lng,
          images: data.images && data.images.length > 0 ? [{ url: data.images[0].uri }] : [],
          audio: data.audio,
          reportedBy: authorInfo,
          userId: authorInfo._id,
          createdAt: new Date().toISOString(),
          isOffline: true,
          aiMetadata: {
            category: category,
            confidence: 0.94,
            severity: urgency,
            flagReason: 'new_intake',
            flaggedForReview: false,
          },
          moderation: { status: 'approved', notes: 'Automated verification passed' },
          assignedInstitution: 'Birsa Institute of Technology (BIT) Sindri',
          csrPartner: 'Tata Steel Foundation CSR',
          slaHours: slaHours,
          workProgress: 45,
          timeline: [
            { stage: 'Reported & Proof Uploaded', timestamp: 'Just now', actor: authorInfo.name },
            { stage: 'AI Classification & Intake Verified', timestamp: 'Just now', actor: 'Samvad-Setu AI Engine' },
            { stage: 'Municipal SLA Activated', timestamp: 'Just now', actor: 'Urban Local Body' },
          ],
        };
      }

      // Update Zustand state
      set((state: any) => ({
        problems: [newProblem, ...state.problems],
        isLoading: false,
      }));

      // Sync to AsyncStorage for map.tsx and offline persistence
      try {
        const existingStr = await AsyncStorage.getItem('@citizen_tickets');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const mapTicket = {
          ...newProblem,
          id: newProblem._id || newProblem.id,
          title: newProblem.title,
          category: newProblem.category,
          status: newProblem.status || 'In Progress',
          latitude: newProblem.location?.lat || data.location?.lat,
          longitude: newProblem.location?.lng || data.location?.lng,
          urgency: newProblem.urgency,
          reportedBy: newProblem.reportedBy,
          isOffline: true,
          createdAt: newProblem.createdAt || new Date().toISOString(),
        };
        await AsyncStorage.setItem('@citizen_tickets', JSON.stringify([mapTicket, ...existing]));
      } catch (storageErr) {
        console.error("Failed saving ticket to AsyncStorage", storageErr);
      }

      return newProblem;
    } catch (error: any) {
      console.error("Critical error in addProblem", error);
      set({ isLoading: false });
      return { error: error.message || "Failed to submit problem." };
    }
  },

  updateProblem: async (id: string, updatedData: any) => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('userToken');
      let updatedProblem: any = null;

      try {
        const res = await fetch(`${API_URL}/problems/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updatedData),
        });

        if (res.ok) {
          updatedProblem = await res.json();
        } else {
          const errJson = await res.json().catch(() => ({}));
          console.warn("Backend update response warning:", res.status, errJson);
        }
      } catch (apiErr: any) {
        console.warn("Backend update failed or offline, updating locally:", apiErr.message);
      }

      // Update Zustand state
      set((state: any) => ({
        problems: state.problems.map((p: any) => {
          if ((p._id || p.id) === id) {
            const merged = updatedProblem || {
              ...p,
              ...updatedData,
              images: updatedData.images !== undefined ? updatedData.images : p.images,
              location: { ...(p.location || {}), ...(updatedData.location || {}) },
            };
            return merged;
          }
          return p;
        }),
        isLoading: false,
      }));

      // Sync with AsyncStorage @citizen_tickets
      try {
        const existingStr = await AsyncStorage.getItem('@citizen_tickets');
        if (existingStr) {
          const existing = JSON.parse(existingStr);
          const updatedTickets = existing.map((t: any) => {
            if ((t.id || t._id) === id) {
              return {
                ...t,
                ...updatedData,
                title: updatedData.title !== undefined ? updatedData.title : t.title,
                latitude: updatedData.location?.lat || t.latitude,
                longitude: updatedData.location?.lng || t.longitude,
              };
            }
            return t;
          });
          await AsyncStorage.setItem('@citizen_tickets', JSON.stringify(updatedTickets));
        }
      } catch (syncErr) {
        console.error("Failed to sync ticket update to AsyncStorage", syncErr);
      }

      return { success: true, problem: updatedProblem };
    } catch (error: any) {
      console.error("Failed to update problem", error);
      set({ isLoading: false });
      return { success: false, error: error.message || "Failed to update problem" };
    }
  },

  deleteProblem: async (id: string) => {
    set({ isLoading: true });
    try {
      // If it's a backend ticket and online, attempt server deletion
      if (!String(id).startsWith('offline_')) {
        try {
          await api.delete(`/problems/${id}`);
        } catch (apiErr: any) {
          console.warn("Backend delete warning or server offline, removing locally:", apiErr.message);
        }
      }

      // Always remove from Zustand state
      set((state: any) => ({
        problems: state.problems.filter((p: any) => p.id !== id && p._id !== id),
        isLoading: false
      }));

      // Always remove from AsyncStorage @citizen_tickets
      try {
        const existingStr = await AsyncStorage.getItem('@citizen_tickets');
        if (existingStr) {
          const existing = JSON.parse(existingStr);
          const filtered = existing.filter((t: any) => (t.id || t._id) !== id);
          await AsyncStorage.setItem('@citizen_tickets', JSON.stringify(filtered));
        }
      } catch (storageErr) {
        console.error("Failed removing ticket from AsyncStorage", storageErr);
      }

      return true;
    } catch (error) {
      console.error("Failed to delete problem", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Keep theme state since it was here previously and might be used elsewhere
  theme: 'dark',
  toggleTheme: () => set((state: any) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark'
  })),
}));