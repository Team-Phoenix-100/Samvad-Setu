const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Institution = require('../src/models/Institution');

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/samvad-setu";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    let govAdmin = await User.findOne({ email: 'dhte.admin@jharkhand.gov.in' });
    if (!govAdmin) {
      govAdmin = new User({
        name: 'DHTE Admin',
        email: 'dhte.admin@jharkhand.gov.in',
        password: 'admin123',
        role: 'government_admin',
        isVerified: true
      });
      await govAdmin.save();
      console.log('Seeded Gov Admin');
    } else {
      console.log('Gov Admin already exists');
    }

    // 2. Create some flagged problems
    const problemsCount = await Problem.countDocuments({ 'aiMetadata.flaggedForReview': true });
    if (problemsCount < 5) {
      // Need a citizen to be the reporter
      let citizen = await User.findOne({ role: 'citizen' });
      if (!citizen) {
        citizen = new User({
          name: 'Test Citizen',
          email: 'citizen_seed@example.com',
          password: 'citizenPassword123',
          role: 'citizen',
          isVerified: true
        });
        await citizen.save();
      }

      const dummyProblems = [
        { title: 'Suspicious road collapse', category: 'Infrastructure & Safety', urgency: 'high', aiMetadata: { category: 'Civil Infrastructure', confidence: 0.45, severity: 'high', flagReason: 'low_confidence', flaggedForReview: true } },
        { title: 'Contaminated water supply', category: 'Infrastructure & Safety', urgency: 'high', aiMetadata: { category: 'Renewable Energy & Water', confidence: 0.55, severity: 'critical', flagReason: 'signal_discrepancy', flaggedForReview: true } },
        { title: 'Illegal mining activity', category: 'Agriculture & Forestry', urgency: 'critical', aiMetadata: { category: 'Mining Hazards', confidence: 0.60, severity: 'critical', flagReason: 'citizen_flagged', flaggedForReview: true } },
        { title: 'School building unsafe', category: 'Education & Skilling', urgency: 'medium', aiMetadata: { category: 'Education & Skilling', confidence: 0.38, severity: 'medium', flagReason: 'low_confidence', flaggedForReview: true } },
        { title: 'Forest fire near village', category: 'Agriculture & Forestry', urgency: 'critical', aiMetadata: { category: 'Agriculture & Forestry', confidence: 0.65, severity: 'critical', flagReason: 'signal_discrepancy', flaggedForReview: true } },
      ];

      for (let pData of dummyProblems) {
        const problem = new Problem({
          title: pData.title,
          description: 'Auto-generated seed description for testing moderation queue.',
          category: pData.category,
          urgency: pData.urgency,
          location: { district: 'Ranchi', block: 'Kanke', lat: 23.3441, lng: 85.3096 },
          images: [{ url: 'https://via.placeholder.com/300', publicId: 'dummy_id' }],
          reportedBy: citizen._id,
          aiMetadata: pData.aiMetadata,
          moderation: { status: 'pending' },
          timeline: [{ stage: "Reported", timestamp: new Date().toISOString(), actor: "Citizen" }]
        });
        await problem.save();
      }
      console.log('Seeded 5 flagged problems');
    } else {
      console.log('Flagged problems already seeded');
    }

    // 3. Create Institutions pending verification
    const instCount = await Institution.countDocuments();
    if (instCount < 3) {
      const institutions = [
        { name: 'Ranchi University Tech Wing', type: 'HEI', registrationNumber: 'RU-TECH-001', district: 'Ranchi', verificationStatus: 'pending_verification' },
        { name: 'Tata Steel CSR Foundation', type: 'Industry', registrationNumber: 'TS-CSR-999', district: 'East Singhbhum', verificationStatus: 'pending_verification' },
        { name: 'BIT Sindri Innovation Lab', type: 'HEI', registrationNumber: 'BIT-002', district: 'Dhanbad', verificationStatus: 'pending_verification' },
      ];
      
      for (let iData of institutions) {
        const inst = new Institution(iData);
        await inst.save();
      }
      console.log('Seeded 3 pending institutions');
    } else {
      console.log('Institutions already seeded');
    }

  } catch (error) {
    console.error('Seed Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
