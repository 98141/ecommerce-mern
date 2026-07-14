const { User } = require('./user.model');
const { ROLES } = require('../../shared/constants/roles');

function findByEmail(email, { withPassword = false } = {}) {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  return withPassword ? query.select('+passwordHash +failedLoginAttempts +lockUntil') : query;
}

function findById(id, { withPassword = false } = {}) {
  const query = User.findById(id);
  return withPassword ? query.select('+passwordHash +failedLoginAttempts +lockUntil') : query;
}

function createUser(data) {
  return User.create(data);
}

function updateById(id, update) {
  return User.findByIdAndUpdate(id, update, { new: true });
}

function findCustomerById(id) {
  return User.findOne({ _id: id, role: ROLES.CUSTOMER });
}

async function listCustomers({ page, limit, search, status, emailVerified, sort }) {
  const filter = { role: ROLES.CUSTOMER };

  if (status) filter.status = status;
  if (typeof emailVerified === 'boolean') filter.emailVerified = emailVerified;
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }, { phone: regex }];
  }

  const sortSpec = sort || '-createdAt';
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter).sort(sortSpec).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { items, total };
}

module.exports = { findByEmail, findById, createUser, updateById, findCustomerById, listCustomers };
