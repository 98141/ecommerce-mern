import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
  phone: z.string().trim().optional(),
});
