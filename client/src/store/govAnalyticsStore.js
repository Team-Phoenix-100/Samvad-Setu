import { create } from 'zustand';
import * as govApi from '../api/govApi';

export const useGovAnalyticsStore = create((set) => ({
  summary: null,
  domainDistribution: [],
  districtBreakdown: [],
  loading: false,
  error: null,

  fetchSummary: async () => {
    set({ loading: true });
    try {
      const data = await govApi.getAnalyticsSummary();
      set({ summary: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchDomainDistribution: async () => {
    set({ loading: true });
    try {
      const data = await govApi.getDomainDistribution();
      set({ domainDistribution: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchDistrictBreakdown: async () => {
    set({ loading: true });
    try {
      const data = await govApi.getDistrictBreakdown();
      set({ districtBreakdown: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
