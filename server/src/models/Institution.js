const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['HEI', 'Industry'], required: true },
    registrationNumber: { type: String, required: true },
    district: { type: String, required: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    nodalOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationStatus: {
      type: String,
      enum: ['pending_verification', 'active', 'rejected', 'suspended'],
      default: 'pending_verification'
    },
    rejectionReason: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

institutionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Institution', institutionSchema);
