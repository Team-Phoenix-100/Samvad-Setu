import api from './axios';

const API_URL = '/admin';

export const getAnalyticsSummary = async () => {
  const res = await api.get(`${API_URL}/analytics/summary`);
  return res.data;
};

export const getDomainDistribution = async () => {
  const res = await api.get(`${API_URL}/analytics/domain-distribution`);
  return res.data;
};

export const getDistrictBreakdown = async () => {
  const res = await api.get(`${API_URL}/analytics/district-breakdown`);
  return res.data;
};

export const getModerationQueue = async (params) => {
  const res = await api.get(`${API_URL}/moderation-queue`, { params });
  return res.data;
};

export const moderateProblem = async (problemId, payload) => {
  const res = await api.patch(`${API_URL}/problems/${problemId}/moderate`, payload);
  return res.data;
};

export const getInstitutions = async (params) => {
  const res = await api.get(`${API_URL}/institutions`, { params });
  return res.data;
};

export const verifyInstitution = async (institutionId, payload) => {
  const res = await api.patch(`${API_URL}/institutions/${institutionId}/verify`, payload);
  return res.data;
};

export const getAuditLogs = async (params) => {
  const res = await api.get(`${API_URL}/audit-logs`, { params });
  return res.data;
};
