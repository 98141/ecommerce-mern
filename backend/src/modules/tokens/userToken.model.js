const mongoose = require('mongoose');
const { ALL_TOKEN_TYPES } = require('../../shared/constants/tokenTypes');

const { Schema } = mongoose;

const userTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ALL_TOKEN_TYPES, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userTokenSchema.index({ tokenHash: 1 }, { unique: true });
userTokenSchema.index({ userId: 1, type: 1 });
userTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = { UserToken };
