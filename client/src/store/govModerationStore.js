import { create } from 'zustand';
import * as govApi from '../api/govApi';

export const useGovModerationStore = create((set, get) => ({
  queue: [],
  totalCount: 0,
  filters: { page: 1, limit: 10 },
  loading: false,
  error: null,
  unreadCount: 0, // for real-time alerts

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchQueue();
  },

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),

  fetchQueue: async () => {
    set({ loading: true });
    try {
      const data = await govApi.getModerationQueue(get().filters);
      set({ queue: data.problems, totalCount: data.totalCount, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  moderateItem: async (id, payload) => {
    set({ loading: true });
    try {
      await govApi.moderateProblem(id, payload);
      // Optimistic UI removal
      set((state) => ({
        queue: state.queue.filter(p => p.id !== id),
        totalCount: state.totalCount - 1,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
