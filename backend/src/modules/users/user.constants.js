const { USER_STATUS } = require('../../shared/constants/userStatus');

const ADMIN_ASSIGNABLE_STATUSES = [USER_STATUS.ACTIVE, USER_STATUS.BLOCKED];

module.exports = { ADMIN_ASSIGNABLE_STATUSES };
