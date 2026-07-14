import { z } from 'zod';
import { emailSchema } from '../../../schemas/password.schema';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});
