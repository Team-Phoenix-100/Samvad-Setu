const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    ticketId: { type: String, sparse: true, unique: true },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'other',
    },
    department: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      district: { type: String },
      block: { type: String },
      address: { type: String },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      }
    ],
    status: {
      type: String,
      enum: ['unresolved', 'resolved', 'Submitted', 'Under_Govt_Review', 'Escalated_To_HEI', 'Corporate_Pledged', 'Site_Clearance', 'Resolved', 'Rejected'],
      default: 'unresolved',
    },
    severity: { type: String, default: 'medium' },
    urgency: {
      type: String,
      default: 'medium',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedHEI: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    corporatePartner: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    slaHours: { type: Number, default: 72 },
    statusHistory: [
      {
        status: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        stage: { type: String },
        timestamp: { type: mongoose.Schema.Types.Mixed },
        actor: { type: String },
        notes: { type: String }
      }
    ],
    aiMetadata: {
      category: { type: String },
      confidence: { type: Number, min: 0, max: 1 },
      severity: { type: String },
      priority: { type: Number },
      needsHumanReview: { type: Boolean },
      flagReason: { type: String },
      flaggedForReview: { type: Boolean, default: false },
      duplicatesDetected: [String]
    },
    moderation: {
      status: { type: String, enum: ['pending', 'approved', 'rejected', 'reclassified'], default: 'pending' },
      moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      moderatedAt: { type: Date },
      notes: { type: String },
      originalCategory: { type: String }
    }
  },
  { timestamps: true }
);

// Map _id to id for the frontend
problemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
