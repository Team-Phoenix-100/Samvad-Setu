import { create } from 'zustand';
import * as govApi from '../api/govApi';

export const useGovInstitutionStore = create((set, get) => ({
  institutions: [],
  filters: { status: 'pending_verification' },
  loading: false,
  error: null,
  pendingCount: 0,

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchInstitutions();
  },

  incrementPending: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),

  fetchInstitutions: async () => {
    set({ loading: true });
    try {
      const data = await govApi.getInstitutions(get().filters);
      set({ institutions: data, loading: false });
      
      // Update pending count specifically if we fetch all or just pending
      const pending = data.filter(i => i.verificationStatus === 'pending_verification').length;
      if (get().filters.status === 'pending_verification') {
         set({ pendingCount: data.length });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  verifyItem: async (id, approved, reason) => {
    set({ loading: true });
    try {
      await govApi.verifyInstitution(id, { approved, reason });
      // Optimistic update
      set((state) => ({
        institutions: state.institutions.map(inst => 
          inst.id === id ? { ...inst, verificationStatus: approved ? 'active' : 'rejected' } : inst
        ),
        pendingCount: Math.max(0, state.pendingCount - 1),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
