const { z } = require('zod');
const { emailSchema, passwordSchema } = require('../../shared/validators/common.validators');

const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
    lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
    email: emailSchema,
    phone: z.string().trim().optional().default(''),
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, 'Debes confirmar la contraseña'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'La contraseña es obligatoria'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'El token es obligatorio'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'El token es obligatorio'),
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, 'Debes confirmar la contraseña'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
