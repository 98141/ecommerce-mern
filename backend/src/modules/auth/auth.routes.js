const { Router } = require('express');
const controller = require('./auth.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/authenticate.middleware');
const { loginRateLimiter, sensitiveActionRateLimiter } = require('../../middlewares/rateLimit.middleware');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./auth.validation');

const router = Router();

router.post('/register', sensitiveActionRateLimiter, validate(registerSchema), controller.register);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post(
  '/resend-verification',
  sensitiveActionRateLimiter,
  validate(resendVerificationSchema),
  controller.resendVerification,
);
router.post('/login', loginRateLimiter, validate(loginSchema), controller.login);
router.post('/refresh', sensitiveActionRateLimiter, controller.refresh);
router.post('/logout', controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);
router.post(
  '/forgot-password',
  sensitiveActionRateLimiter,
  validate(forgotPasswordSchema),
  controller.forgotPassword,
);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

module.exports = router;
