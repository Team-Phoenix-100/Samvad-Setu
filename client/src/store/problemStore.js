import { create } from 'zustand';
import api from '../api/axios';

export const useProblemStore = create((set, get) => ({
  problems: [],
  isLoading: false,

  fetchProblems: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/problems');
      set({ problems: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch problems", error);
      set({ isLoading: false });
    }
  },

  fetchPublicProblems: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/problems/public');
      set({ problems: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch public problems", error);
      set({ isLoading: false });
    }
  },

  addProblem: async (data) => {
    set({ isLoading: true });
    try {
      let payload = data;

      if (data.images && data.images.length > 0) {
        payload = new FormData();
        payload.append('title', data.title);
        payload.append('description', data.description);
        payload.append('category', data.category);
        payload.append('urgency', data.urgency);
        payload.append('location', JSON.stringify(data.location));
        if (data.aiMetadata) payload.append('aiMetadata', JSON.stringify(data.aiMetadata));
        if (data.audio) payload.append('audio', data.audio, data.audio.name || 'voice-note.webm');

        data.images.forEach((image, index) => {
          const fileName = image.name || `proof_${index + 1}.jpg`;
          payload.append('images', image, fileName);
        });
      }

      const response = await api.post('/problems', payload);
      const newProblem = response.data.problem || response.data;
      set({ problems: [newProblem, ...get().problems], isLoading: false });
      return newProblem;
    } catch (error) {
      console.error("Failed to submit problem", error);
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit problem.";
      return { error: errorMessage };
    }
  },

  updateProblem: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/problems/${id}`, updatedData);
      set({
        problems: get().problems.map(p => (p.id === id || p._id === id) ? response.data : p),
        isLoading: false
      });
      return { success: true, problem: response.data };
    } catch (error) {
      console.error("Failed to update problem", error);
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || error.message || "Failed to update problem.";
      return { success: false, error: errorMessage };
    }
  },

  deleteProblem: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/problems/${id}`);
      set({
        problems: get().problems.filter(p => p.id !== id && p._id !== id),
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error("Failed to delete problem", error);
      set({ isLoading: false });
      return false;
    }
  }
}));