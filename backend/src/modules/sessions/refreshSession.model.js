const mongoose = require('mongoose');

const { Schema } = mongoose;

const refreshSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    familyId: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

refreshSessionSchema.index({ tokenHash: 1 }, { unique: true });
refreshSessionSchema.index({ userId: 1 });
refreshSessionSchema.index({ familyId: 1 });
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshSession = mongoose.model('RefreshSession', refreshSessionSchema);

module.exports = { RefreshSession };
