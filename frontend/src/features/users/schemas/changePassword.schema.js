import { z } from 'zod';
import { passwordSchema } from '../../../schemas/password.schema';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: passwordSchema,
    newPasswordConfirmation: z.string().min(1, 'Debes confirmar la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['newPasswordConfirmation'],
  });
