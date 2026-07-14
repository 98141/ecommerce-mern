const { z } = require('zod');
const { passwordSchema, objectIdSchema, paginationSchema } = require('../../shared/validators/common.validators');
const { ADMIN_ASSIGNABLE_STATUSES } = require('./user.constants');

const updateProfileSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(1).optional(),
      lastName: z.string().trim().min(1).optional(),
      phone: z.string().trim().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: passwordSchema,
    newPasswordConfirmation: z.string().min(1, 'Debes confirmar la nueva contraseña'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const adminListCustomersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: paginationSchema.extend({
    search: z.string().trim().optional(),
    status: z.string().optional(),
    emailVerified: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    sort: z.string().optional(),
  }),
});

const adminCustomerIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: objectIdSchema }),
});

const adminUpdateStatusSchema = z.object({
  body: z.object({
    status: z.enum(ADMIN_ASSIGNABLE_STATUSES),
    reason: z.string().trim().optional().default(''),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: objectIdSchema }),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  adminListCustomersSchema,
  adminCustomerIdSchema,
  adminUpdateStatusSchema,
};
