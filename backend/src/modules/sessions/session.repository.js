const { RefreshSession } = require('./refreshSession.model');

function create(data) {
  return RefreshSession.create(data);
}

function findByTokenHash(tokenHash) {
  return RefreshSession.findOne({ tokenHash });
}

function revokeById(id, { replacedByTokenHash = null } = {}) {
  return RefreshSession.findByIdAndUpdate(id, { revokedAt: new Date(), replacedByTokenHash }, { new: true });
}

function revokeFamily(familyId) {
  return RefreshSession.updateMany(
    { familyId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

function revokeAllForUser(userId) {
  return RefreshSession.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

function touchLastUsed(id) {
  return RefreshSession.findByIdAndUpdate(id, { lastUsedAt: new Date() });
}

module.exports = { create, findByTokenHash, revokeById, revokeFamily, revokeAllForUser, touchLastUsed };
