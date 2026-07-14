const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  PENDING_VERIFICATION: 'pending_verification',
});

const ALL_USER_STATUSES = Object.values(USER_STATUS);

module.exports = { USER_STATUS, ALL_USER_STATUSES };
