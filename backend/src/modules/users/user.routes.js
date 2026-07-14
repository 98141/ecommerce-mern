const { Router } = require('express');
const controller = require('./user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/authenticate.middleware');
const { updateProfileSchema, changePasswordSchema } = require('./user.validation');

const router = Router();

router.use(authenticate);

router.get('/me', controller.getMe);
router.patch('/me', validate(updateProfileSchema), controller.updateMe);
router.patch('/me/password', validate(changePasswordSchema), controller.changeMyPassword);

module.exports = router;
