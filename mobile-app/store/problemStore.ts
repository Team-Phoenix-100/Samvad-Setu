import { create } from 'zustand';
import api from '../api/client';

export const useProblemStore = create((set, get) => ({
  problems: [],
  isLoading: false,

  fetchProblems: async () => {
    set({ isLoading: true });
    try {
      // The backend uses /problems/public, or /problems depending on auth.
      // We mimic the web client here which hits /problems/public.
      const response = await api.get('/problems/public');
      set({ problems: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch problems", error);
      set({ isLoading: false });
    }
  },

  addProblem: async (data: any) => {
    set({ isLoading: true });
    try {
      let payload = data;

      if (data.images && data.images.length > 0) {
        payload = new FormData();
        payload.append('title', data.title);
        payload.append('description', data.description || '');
        payload.append('category', data.category);
        payload.append('urgency', data.urgency);
        payload.append('location', JSON.stringify(data.location));
        
        data.images.forEach((image: any, index: number) => {
          const fileName = image.fileName || `proof_${index + 1}.jpg`;
          const type = image.mimeType || 'image/jpeg';
          // React Native FormData format for files
          payload.append('images', {
            uri: image.uri,
            name: fileName,
            type: type,
          } as any);
        });
      }

      // Important: for multipart/form-data in React Native with Axios, we might need to set headers
      // But Axios often handles it automatically if FormData is passed.
      const response = await api.post('/problems', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      set((state: any) => ({ 
        problems: [response.data, ...state.problems], 
        isLoading: false 
      }));
      return response.data;
    } catch (error: any) {
      console.error("Failed to submit problem", error);
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit problem.";
      return { error: errorMessage };
    }
  },
  
  deleteProblem: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/problems/${id}`);
      set((state: any) => ({ 
        problems: state.problems.filter((p: any) => p.id !== id && p._id !== id), 
        isLoading: false 
      }));
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