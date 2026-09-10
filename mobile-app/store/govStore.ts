import { create } from 'zustand';
import {
  getAnalyticsSummary,
  getDomainDistribution,
  getDistrictBreakdown,
  getModerationQueue,
  moderateProblem as apiModerateProblem,
  getInstitutions,
  verifyInstitution as apiVerifyInstitution,
  getAuditLogs,
  MOCK_SUMMARY,
  MOCK_DOMAINS,
  MOCK_DISTRICTS,
  MOCK_FLAGGED_PROBLEMS,
  MOCK_INSTITUTIONS,
  MOCK_AUDIT_LOGS,
} from '../api/govApi';

export interface LeaderboardItem {
  name: string;
  district: string;
  projectsDeployed: number;
  rating: number;
}

export interface ResolutionTrendItem {
  week: string;
  resolved: number;
}

export interface AnalyticsSummary {
  totalProblems: number;
  resolvedProblems: number;
  activeHEIs: number;
  activeIndustry: number;
  resolutionTrend: ResolutionTrendItem[];
  leaderboard: LeaderboardItem[];
}

export interface FlaggedProblem {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: {
    district: string;
    block?: string;
    lat: number;
    lng: number;
    address: string;
  };
  images?: { url: string }[];
  reportedBy?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  aiMetadata?: {
    category: string;
    confidence: number;
    severity: string;
    flagReason: 'low_confidence' | 'signal_discrepancy' | 'citizen_flagged' | string;
    flaggedForReview: boolean;
  };
  moderation?: {
    status: 'pending' | 'approved' | 'rejected' | 'reclassified';
    moderatedAt?: string;
    moderatorNote?: string;
  };
}

export interface InstitutionItem {
  id: string;
  _id?: string;
  name: string;
  type: 'HEI' | 'Industry';
  registrationNumber: string;
  district: string;
  contactEmail: string;
  contactPhone: string;
  verificationStatus: 'pending_verification' | 'active' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

export interface AuditLogItem {
  _id: string;
  timestamp: string;
  actor: { name: string; email: string };
  action: string;
  targetEntity: string;
  targetId: string;
  details: Record<string, any>;
}

interface GovState {
  summary: AnalyticsSummary;
  domains: { domain: string; count: number }[];
  districts: { district: string; count: number }[];
  moderationQueue: FlaggedProblem[];
  institutions: InstitutionItem[];
  auditLogs: AuditLogItem[];
  loadingAnalytics: boolean;
  loadingModeration: boolean;
  loadingInstitutions: boolean;
  loadingAuditLogs: boolean;

  // Actions
  fetchAnalytics: () => Promise<void>;
  fetchModerationQueue: (params?: any) => Promise<void>;
  moderateProblem: (
    problemId: string,
    payload: { action: 'approve' | 'reject' | 'reclassify'; correctedCategory?: string; note?: string }
  ) => Promise<boolean>;
  fetchInstitutions: (params?: any) => Promise<void>;
  verifyInstitution: (
    institutionId: string,
    payload: { approved: boolean; reason?: string }
  ) => Promise<boolean>;
  fetchAuditLogs: (params?: any) => Promise<void>;
}

export const useGovStore = create<GovState>((set, get) => ({
  summary: MOCK_SUMMARY,
  domains: MOCK_DOMAINS,
  districts: MOCK_DISTRICTS,
  moderationQueue: MOCK_FLAGGED_PROBLEMS as FlaggedProblem[],
  institutions: MOCK_INSTITUTIONS as InstitutionItem[],
  auditLogs: MOCK_AUDIT_LOGS,
  loadingAnalytics: false,
  loadingModeration: false,
  loadingInstitutions: false,
  loadingAuditLogs: false,

  fetchAnalytics: async () => {
    set({ loadingAnalytics: true });
    try {
      const [sum, dom, dist] = await Promise.all([
        getAnalyticsSummary(),
        getDomainDistribution(),
        getDistrictBreakdown(),
      ]);
      set({
        summary: sum || MOCK_SUMMARY,
        domains: dom || MOCK_DOMAINS,
        districts: dist || MOCK_DISTRICTS,
      });
    } catch (e) {
      console.error('GovStore fetchAnalytics error:', e);
    } finally {
      set({ loadingAnalytics: false });
    }
  },

  fetchModerationQueue: async (params = {}) => {
    set({ loadingModeration: true });
    try {
      const res = await getModerationQueue(params);
      set({ moderationQueue: res?.problems || MOCK_FLAGGED_PROBLEMS });
    } catch (e) {
      console.error('GovStore fetchModerationQueue error:', e);
    } finally {
      set({ loadingModeration: false });
    }
  },

  moderateProblem: async (problemId, payload) => {
    try {
      await apiModerateProblem(problemId, payload);

      // Optimistic update: remove or update the problem in queue
      const currentQueue = get().moderationQueue;
      const targetProblem = currentQueue.find(p => p.id === problemId || p._id === problemId);
      const remainingQueue = currentQueue.filter(p => p.id !== problemId && p._id !== problemId);

      // Create new audit log item
      const newAuditLog: AuditLogItem = {
        _id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: { name: 'DHTE Admin', email: 'dhte.admin@jharkhand.gov.in' },
        action: 'PROBLEM_MODERATED',
        targetEntity: 'Problem',
        targetId: problemId,
        details: {
          action: payload.action,
          correctedCategory: payload.correctedCategory,
          note: payload.note || 'Action taken via DHTE mobile console',
          title: targetProblem?.title || 'Societal Problem',
        },
      };

      set({
        moderationQueue: remainingQueue,
        auditLogs: [newAuditLog, ...get().auditLogs],
      });
      return true;
    } catch (e) {
      console.error('GovStore moderateProblem error:', e);
      return false;
    }
  },

  fetchInstitutions: async (params = {}) => {
    set({ loadingInstitutions: true });
    try {
      const list = await getInstitutions(params);
      set({ institutions: list || MOCK_INSTITUTIONS });
    } catch (e) {
      console.error('GovStore fetchInstitutions error:', e);
    } finally {
      set({ loadingInstitutions: false });
    }
  },

  verifyInstitution: async (institutionId, payload) => {
    try {
      await apiVerifyInstitution(institutionId, payload);

      const targetInst = get().institutions.find(i => i.id === institutionId || i._id === institutionId);
      const updatedInstitutions = get().institutions.map(inst => {
        if (inst.id === institutionId || inst._id === institutionId) {
          return {
            ...inst,
            verificationStatus: payload.approved ? ('active' as const) : ('rejected' as const),
            rejectionReason: !payload.approved ? payload.reason : undefined,
          };
        }
        return inst;
      });

      const newAuditLog: AuditLogItem = {
        _id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: { name: 'DHTE Admin', email: 'dhte.admin@jharkhand.gov.in' },
        action: 'INSTITUTION_VERIFIED',
        targetEntity: 'Institution',
        targetId: institutionId,
        details: {
          approved: payload.approved,
          reason: payload.reason || (payload.approved ? 'Verified registry credentials' : 'Rejected credentials'),
          name: targetInst?.name || 'Institution',
        },
      };

      set({
        institutions: updatedInstitutions,
        auditLogs: [newAuditLog, ...get().auditLogs],
      });
      return true;
    } catch (e) {
      console.error('GovStore verifyInstitution error:', e);
      return false;
    }
  },

  fetchAuditLogs: async (params = {}) => {
    set({ loadingAuditLogs: true });
    try {
      const res = await getAuditLogs(params);
      set({ auditLogs: res?.logs || MOCK_AUDIT_LOGS });
    } catch (e) {
      console.error('GovStore fetchAuditLogs error:', e);
    } finally {
      set({ loadingAuditLogs: false });
    }
  },
}));
