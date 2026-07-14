const mongoose = require('mongoose');
const { ALL_ROLES, ROLES } = require('../../shared/constants/roles');
const { ALL_USER_STATUSES, USER_STATUS } = require('../../shared/constants/userStatus');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ALL_ROLES, default: ROLES.CUSTOMER, required: true },
    status: {
      type: String,
      enum: ALL_USER_STATUSES,
      default: USER_STATUS.PENDING_VERIFICATION,
      required: true,
    },
    emailVerified: { type: Boolean, default: false, required: true },
    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: 1 });

const User = mongoose.model('User', userSchema);

module.exports = { User };
