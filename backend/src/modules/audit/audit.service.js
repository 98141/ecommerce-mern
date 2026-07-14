const { AuditLog } = require('./auditLog.model');

async function record({ actorId = null, action, targetType = null, targetId = null, metadata = {}, ipAddress = '', userAgent = '' }) {
  await AuditLog.create({ actorId, action, targetType, targetId, metadata, ipAddress, userAgent });
}

module.exports = { record };
