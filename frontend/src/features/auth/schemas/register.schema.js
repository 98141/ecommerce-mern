import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../../schemas/password.schema';

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
    lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
    email: emailSchema,
    phone: z.string().trim().optional(),
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, 'Debes confirmar la contraseña'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirmation'],
  });
