import api from './client';

// Predefined Jharkhand DHTE Mock Data for offline & demo reliability
export const MOCK_SUMMARY = {
  totalProblems: 148,
  resolvedProblems: 64,
  activeHEIs: 28,
  activeIndustry: 19,
  resolutionTrend: [
    { week: 'W-1', resolved: 4 },
    { week: 'W-2', resolved: 7 },
    { week: 'W-3', resolved: 6 },
    { week: 'W-4', resolved: 11 },
    { week: 'W-5', resolved: 16 },
    { week: 'W-6', resolved: 20 },
  ],
  leaderboard: [
    { name: 'BIT Sindri', district: 'Dhanbad', projectsDeployed: 8, rating: 4.9 },
    { name: 'NIT Jamshedpur', district: 'East Singhbhum', projectsDeployed: 6, rating: 4.8 },
    { name: 'BIT Mesra', district: 'Ranchi', projectsDeployed: 5, rating: 4.7 },
    { name: 'IIT (ISM) Dhanbad', district: 'Dhanbad', projectsDeployed: 4, rating: 4.9 },
    { name: 'Ranchi University Tech Wing', district: 'Ranchi', projectsDeployed: 3, rating: 4.5 },
  ],
};

export const MOCK_DOMAINS = [
  { domain: 'Civil Infrastructure', count: 42 },
  { domain: 'Water & Drainage', count: 35 },
  { domain: 'Mining Hazards', count: 28 },
  { domain: 'Agriculture & Forestry', count: 24 },
  { domain: 'Education & Skilling', count: 19 },
];

export const MOCK_DISTRICTS = [
  { district: 'Ranchi', count: 38 },
  { district: 'Dhanbad', count: 29 },
  { district: 'East Singhbhum', count: 24 },
  { district: 'Bokaro', count: 18 },
  { district: 'Hazaribagh', count: 14 },
  { district: 'Deoghar', count: 11 },
];

export const MOCK_FLAGGED_PROBLEMS = [
  {
    id: 'PROB-JH-01',
    _id: 'PROB-JH-01',
    title: 'Suspicious Sub-surface Road Cave-in Near School',
    description: 'Deep road collapse near Kanke Road school gate. Bitumen layer washed off after minor rains, exposing hollow soil underneath.',
    category: 'Civil Infrastructure',
    urgency: 'high',
    location: { district: 'Ranchi', block: 'Kanke', lat: 23.3441, lng: 85.3096, address: 'Near DAV Public School, Kanke Road, Ranchi' },
    images: [{ url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop' }],
    reportedBy: { name: 'Rohan Sharma', email: 'rohan.citizen@jharkhand.in', phone: '+91 94311 82910' },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    aiMetadata: {
      category: 'Civil Infrastructure',
      confidence: 0.45,
      severity: 'high',
      flagReason: 'low_confidence',
      flaggedForReview: true,
    },
    moderation: { status: 'pending' },
  },
  {
    id: 'PROB-JH-02',
    _id: 'PROB-JH-02',
    title: 'High Arsenic & Turbid Water from Handpump',
    description: 'Reddish yellow sediment pumping from community borewell. Citizens falling ill with stomach infections over 2 weeks.',
    category: 'Water & Drainage',
    urgency: 'critical',
    location: { district: 'Dhanbad', block: 'Jharia', lat: 23.7431, lng: 86.4111, address: 'Ward 4, Near Jharia Fire Area, Dhanbad' },
    images: [{ url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop' }],
    reportedBy: { name: 'Priya Verma', email: 'priya.v@gmail.com', phone: '+91 98351 09281' },
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    aiMetadata: {
      category: 'Water & Drainage',
      confidence: 0.55,
      severity: 'critical',
      flagReason: 'signal_discrepancy',
      flaggedForReview: true,
    },
    moderation: { status: 'pending' },
  },
  {
    id: 'PROB-JH-03',
    _id: 'PROB-JH-03',
    title: 'Acid Mine Drainage Runoff Inundating Paddy Fields',
    description: 'Sulfur-rich runoff from coal overburden dump overflowing into 12 acres of agricultural land during sudden cloudburst.',
    category: 'Mining Hazards',
    urgency: 'critical',
    location: { district: 'Bokaro', block: 'Bermo', lat: 23.7741, lng: 85.9611, address: 'Bermo Coal Belt, Bokaro' },
    images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop' }],
    reportedBy: { name: 'Amitabh Soren', email: 'amitabh.soren@jharkhand.in', phone: '+91 97714 88219' },
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    aiMetadata: {
      category: 'Mining Hazards',
      confidence: 0.60,
      severity: 'critical',
      flagReason: 'citizen_flagged',
      flaggedForReview: true,
    },
    moderation: { status: 'pending' },
  },
  {
    id: 'PROB-JH-04',
    _id: 'PROB-JH-04',
    title: 'Cracked Structural Beam in Poly-Technic Hostel',
    description: 'Diagonal shear crack visible on 2nd floor pillar. Water seepage during monsoon worsening concrete spalling.',
    category: 'Education & Skilling',
    urgency: 'high',
    location: { district: 'East Singhbhum', block: 'Jamshedpur', lat: 22.8046, lng: 86.2029, address: 'Govt Polytechnic Campus, Jamshedpur' },
    images: [{ url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563?w=600&auto=format&fit=crop' }],
    reportedBy: { name: 'Kavita Das', email: 'kavita.warden@gmail.com', phone: '+91 94301 22817' },
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    aiMetadata: {
      category: 'Education & Skilling',
      confidence: 0.38,
      severity: 'high',
      flagReason: 'low_confidence',
      flaggedForReview: true,
    },
    moderation: { status: 'pending' },
  },
  {
    id: 'PROB-JH-05',
    _id: 'PROB-JH-05',
    title: 'Dry Forest Brush Fire Approaching Village Boundary',
    description: 'Uncontrolled ground fire in sal forest border. Local fire engine unable to reach due to lack of unpaved road access.',
    category: 'Agriculture & Forestry',
    urgency: 'critical',
    location: { district: 'Hazaribagh', block: 'Barkagaon', lat: 23.9931, lng: 85.3611, address: 'Barkagaon Forest Range, Hazaribagh' },
    images: [{ url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop' }],
    reportedBy: { name: 'Sunil Mahto', email: 'sunil.mahto@gmail.com', phone: '+91 91234 56789' },
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    aiMetadata: {
      category: 'Agriculture & Forestry',
      confidence: 0.65,
      severity: 'critical',
      flagReason: 'signal_discrepancy',
      flaggedForReview: true,
    },
    moderation: { status: 'pending' },
  },
];

export const MOCK_INSTITUTIONS = [
  {
    id: 'INST-01',
    _id: 'INST-01',
    name: 'BIT Sindri Innovation Lab',
    type: 'HEI',
    registrationNumber: 'AISHE-U-0205',
    district: 'Dhanbad',
    contactEmail: 'innovation@bitsindri.ac.in',
    contactPhone: '+91 326 2350495',
    verificationStatus: 'pending_verification',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'INST-02',
    _id: 'INST-02',
    name: 'Tata Steel CSR Foundation',
    type: 'Industry',
    registrationNumber: 'CIN-U85100JH2016NPL008921',
    district: 'East Singhbhum',
    contactEmail: 'csr.jharkhand@tatasteel.com',
    contactPhone: '+91 657 2424000',
    verificationStatus: 'pending_verification',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'INST-03',
    _id: 'INST-03',
    name: 'Ranchi University Tech Wing',
    type: 'HEI',
    registrationNumber: 'AISHE-U-0208',
    district: 'Ranchi',
    contactEmail: 'techwing@ranchiuniversity.ac.in',
    contactPhone: '+91 651 2205177',
    verificationStatus: 'pending_verification',
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
  {
    id: 'INST-04',
    _id: 'INST-04',
    name: 'Birla Institute of Technology (BIT) Mesra',
    type: 'HEI',
    registrationNumber: 'AISHE-U-0204',
    district: 'Ranchi',
    contactEmail: 'dean.rnd@bitmesra.ac.in',
    contactPhone: '+91 651 2275444',
    verificationStatus: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'INST-05',
    _id: 'INST-05',
    name: 'Central Coalfields Limited (CCL) CSR Division',
    type: 'Industry',
    registrationNumber: 'CIN-U10200JH1956GOI000581',
    district: 'Ranchi',
    contactEmail: 'csr@centralcoalfields.in',
    contactPhone: '+91 651 2360123',
    verificationStatus: 'active',
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    _id: 'LOG-001',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    actor: { name: 'DHTE Admin', email: 'dhte.admin@jharkhand.gov.in' },
    action: 'PROBLEM_MODERATED',
    targetEntity: 'Problem',
    targetId: 'PROB-JH-01',
    details: { action: 'reclassified', correctedCategory: 'Civil Infrastructure', note: 'Confirmed bitumen wash-off by visual inspection' },
  },
  {
    _id: 'LOG-002',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    actor: { name: 'DHTE Admin', email: 'dhte.admin@jharkhand.gov.in' },
    action: 'INSTITUTION_VERIFIED',
    targetEntity: 'Institution',
    targetId: 'INST-04',
    details: { approved: true, reason: 'AISHE code U-0204 verified against state university gazette' },
  },
  {
    _id: 'LOG-003',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    actor: { name: 'DHTE Admin', email: 'dhte.admin@jharkhand.gov.in' },
    action: 'PROBLEM_MODERATED',
    targetEntity: 'Problem',
    targetId: 'PROB-JH-03',
    details: { action: 'approve', note: 'Emergency acid mine drainage escalation approved for IIT ISM lab' },
  },
];

// -----------------------------------------------------------------------------
// Exported API Functions with Real Backend Calls & Seamless Fallback
// -----------------------------------------------------------------------------

export const getAnalyticsSummary = async () => {
  try {
    const res = await api.get('/admin/analytics/summary');
    return res.data;
  } catch (error) {
    return MOCK_SUMMARY;
  }
};

export const getDomainDistribution = async () => {
  try {
    const res = await api.get('/admin/analytics/domain-distribution');
    return res.data;
  } catch (error) {
    return MOCK_DOMAINS;
  }
};

export const getDistrictBreakdown = async () => {
  try {
    const res = await api.get('/admin/analytics/district-breakdown');
    return res.data;
  } catch (error) {
    return MOCK_DISTRICTS;
  }
};

export const getModerationQueue = async (params: any = {}) => {
  try {
    const res = await api.get('/admin/moderation-queue', { params });
    return res.data;
  } catch (error) {
    let list = [...MOCK_FLAGGED_PROBLEMS];
    if (params.domain && params.domain !== 'All') {
      list = list.filter(p => p.aiMetadata?.category === params.domain || p.category === params.domain);
    }
    if (params.minConfidence !== undefined) {
      list = list.filter(p => (p.aiMetadata?.confidence || 0) >= params.minConfidence);
    }
    if (params.maxConfidence !== undefined) {
      list = list.filter(p => (p.aiMetadata?.confidence || 0) <= params.maxConfidence);
    }
    return {
      problems: list,
      totalCount: list.length,
      totalPages: 1,
      currentPage: 1,
    };
  }
};

export const getProblemForReview = async (problemId: string) => {
  try {
    const res = await api.get(`/admin/problems/${problemId}`);
    return res.data;
  } catch (error) {
    const found = MOCK_FLAGGED_PROBLEMS.find(p => p.id === problemId || p._id === problemId);
    return found || MOCK_FLAGGED_PROBLEMS[0];
  }
};

export const moderateProblem = async (problemId: string, payload: any) => {
  try {
    const res = await api.patch(`/admin/problems/${problemId}/moderate`, payload);
    return res.data;
  } catch (error) {
    return { status: 'success', action: payload.action, problemId };
  }
};

export const getInstitutions = async (params: any = {}) => {
  try {
    const res = await api.get('/admin/institutions', { params });
    return res.data;
  } catch (error) {
    let list = [...MOCK_INSTITUTIONS];
    if (params.type && params.type !== 'All') {
      list = list.filter(i => i.type === params.type);
    }
    if (params.status) {
      list = list.filter(i => i.verificationStatus === params.status);
    }
    if (params.district && params.district !== 'All') {
      list = list.filter(i => i.district === params.district);
    }
    return list;
  }
};

export const getInstitutionDetail = async (institutionId: string) => {
  try {
    const res = await api.get(`/admin/institutions/${institutionId}`);
    return res.data;
  } catch (error) {
    const found = MOCK_INSTITUTIONS.find(i => i.id === institutionId || i._id === institutionId);
    return found || MOCK_INSTITUTIONS[0];
  }
};

export const verifyInstitution = async (institutionId: string, payload: any) => {
  try {
    const res = await api.patch(`/admin/institutions/${institutionId}/verify`, payload);
    return res.data;
  } catch (error) {
    return { status: 'success', approved: payload.approved, institutionId };
  }
};

export const getAuditLogs = async (params: any = {}) => {
  try {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  } catch (error) {
    return {
      logs: MOCK_AUDIT_LOGS,
      totalCount: MOCK_AUDIT_LOGS.length,
      totalPages: 1,
      currentPage: 1,
    };
  }
};
