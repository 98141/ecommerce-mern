const userService = require('./user.service');
const { sendSuccess } = require('../../shared/helpers/response.helper');
const { toProfileResponse, toAdminListItem, toAdminDetail } = require('./user.mapper');

async function getMe(req, res) {
  const user = await userService.getProfile(req.user._id);
  sendSuccess(res, { data: { user: toProfileResponse(user) } });
}

async function updateMe(req, res) {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendSuccess(res, { data: { user: toProfileResponse(user) }, message: 'Perfil actualizado' });
}

async function changeMyPassword(req, res) {
  await userService.changePassword(req.user._id, req.body);
  sendSuccess(res, { message: 'Contraseña actualizada. Inicia sesión nuevamente.' });
}

async function listCustomers(req, res) {
  const { items, pagination } = await userService.listCustomers(req.query);
  sendSuccess(res, { data: { items: items.map(toAdminListItem), pagination } });
}

async function getCustomerDetail(req, res) {
  const user = await userService.getCustomerDetail(req.params.id);
  sendSuccess(res, { data: { user: toAdminDetail(user) } });
}

async function updateCustomerStatus(req, res) {
  const user = await userService.updateCustomerStatus(req.user, req.params.id, req.body);
  sendSuccess(res, { data: { user: toAdminDetail(user) }, message: 'Estado del cliente actualizado' });
}

module.exports = {
  getMe,
  updateMe,
  changeMyPassword,
  listCustomers,
  getCustomerDetail,
  updateCustomerStatus,
};
