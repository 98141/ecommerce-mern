const { Router } = require('express');
const controller = require('./user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/authenticate.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { ROLES } = require('../../shared/constants/roles');
const { adminListCustomersSchema, adminCustomerIdSchema, adminUpdateStatusSchema } = require('./user.validation');

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', validate(adminListCustomersSchema), controller.listCustomers);
router.get('/:id', validate(adminCustomerIdSchema), controller.getCustomerDetail);
router.patch('/:id/status', validate(adminUpdateStatusSchema), controller.updateCustomerStatus);

module.exports = router;
