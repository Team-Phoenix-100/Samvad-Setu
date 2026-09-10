const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All routes require government_admin, govt_admin, admin, or platform_admin role
router.use(protect);
router.use(authorize('government_admin', 'govt_admin', 'admin', 'platform_admin'));

// Analytics
router.get('/analytics/summary', adminController.getAnalyticsSummary);
router.get('/analytics/domain-distribution', adminController.getDomainDistribution);
router.get('/analytics/district-breakdown', adminController.getDistrictBreakdown);

// Moderation
router.get('/moderation-queue', adminController.getModerationQueue);
router.patch('/problems/:id/moderate', adminController.moderateProblem);

// Institutions
router.get('/institutions', adminController.getInstitutions);
router.patch('/institutions/:id/verify', adminController.verifyInstitution);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
