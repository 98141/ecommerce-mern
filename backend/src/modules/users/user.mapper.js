function toProfileResponse(user) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

function toAdminListItem(user) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    status: user.status,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

function toAdminDetail(user) {
  return {
    ...toAdminListItem(user),
    role: user.role,
    updatedAt: user.updatedAt,
  };
}

module.exports = { toProfileResponse, toAdminListItem, toAdminDetail };
