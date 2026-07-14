const { UserToken } = require('./userToken.model');

function create(data) {
  return UserToken.create(data);
}

function findActiveByHash(tokenHash) {
  return UserToken.findOne({ tokenHash });
}

function invalidateActiveByUserAndType(userId, type) {
  return UserToken.updateMany(
    { userId, type, usedAt: null },
    { $set: { usedAt: new Date() } },
  );
}

function markUsed(id) {
  return UserToken.findByIdAndUpdate(id, { usedAt: new Date() }, { new: true });
}

module.exports = { create, findActiveByHash, invalidateActiveByUserAndType, markUsed };
