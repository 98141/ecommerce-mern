function toRegisterUserResponse(user) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  };
}

function toAuthUserResponse(user) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  };
}

module.exports = { toRegisterUserResponse, toAuthUserResponse };
