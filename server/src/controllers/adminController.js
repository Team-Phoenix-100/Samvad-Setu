const Problem = require('../models/Problem');
const Institution = require('../models/Institution');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const getIo = () => require('../app').io;

// Analytics
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments();
    const resolvedProblems = await Problem.countDocuments({ status: 'resolved' });
    const activeHEIs = await Institution.countDocuments({ type: 'HEI', verificationStatus: 'active' });
    const activeIndustry = await Institution.countDocuments({ type: 'Industry', verificationStatus: 'active' });

    res.json({
      totalProblems,
      resolvedProblems,
      activeHEIs,
      activeIndustry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getDomainDistribution = async (req, res) => {
  try {
    const distribution = await Problem.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { domain: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getDistrictBreakdown = async (req, res) => {
  try {
    const breakdown = await Problem.aggregate([
      { $group: { _id: "$location.district", count: { $sum: 1 } } },
      { $project: { district: { $ifNull: ["$_id", "Unknown"] }, count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Moderation
exports.getModerationQueue = async (req, res) => {
  try {
    const { domain, minConfidence, maxConfidence, page = 1, limit = 10 } = req.query;
    
    let query = {
      'aiMetadata.flaggedForReview': true,
      'moderation.status': 'pending'
    };

    if (domain) query['aiMetadata.category'] = domain;
    if (minConfidence) query['aiMetadata.confidence'] = { ...query['aiMetadata.confidence'], $gte: parseFloat(minConfidence) };
    if (maxConfidence) query['aiMetadata.confidence'] = { ...query['aiMetadata.confidence'], $lte: parseFloat(maxConfidence) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const problems = await Problem.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Problem.countDocuments(query);

    res.json({
      problems,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.moderateProblem = async (req, res) => {
  try {
    const { action, correctedCategory, note } = req.body;
    const problemId = req.params.id;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    let newStatus;
    if (action === 'approve') newStatus = 'approved';
    else if (action === 'reject') newStatus = 'rejected';
    else if (action === 'reclassified') newStatus = 'reclassified';
    else return res.status(400).json({ message: 'Invalid action' });

    if (action === 'reclassified' && correctedCategory) {
      problem.moderation.originalCategory = problem.category;
      problem.category = correctedCategory;
    }

    problem.moderation.status = newStatus;
    problem.moderation.moderatedBy = req.user._id;
    problem.moderation.moderatedAt = Date.now();
    problem.moderation.notes = note;
    problem.aiMetadata.flaggedForReview = false; // removes it from queue

    await problem.save();

    // Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: 'PROBLEM_MODERATED',
      targetEntity: 'Problem',
      targetId: problem._id,
      details: { action, note, correctedCategory }
    });

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Institutions
exports.getInstitutions = async (req, res) => {
  try {
    const { type, status, district } = req.query;
    let query = {};
    if (type) query.type = type;
    if (status) query.verificationStatus = status;
    if (district) query.district = district;

    const institutions = await Institution.find(query).sort({ createdAt: -1 });
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.verifyInstitution = async (req, res) => {
  try {
    const { approved, reason } = req.body;
    const institutionId = req.params.id;

    const institution = await Institution.findById(institutionId);
    if (!institution) return res.status(404).json({ message: 'Institution not found' });

    institution.verificationStatus = approved ? 'active' : 'rejected';
    institution.rejectionReason = reason;
    institution.verifiedBy = req.user._id;
    institution.verifiedAt = Date.now();

    await institution.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'INSTITUTION_VERIFIED',
      targetEntity: 'Institution',
      targetId: institution._id,
      details: { approved, reason }
    });

    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCount = await AuditLog.countDocuments();

    res.json({
      logs,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
