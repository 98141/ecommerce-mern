import { z } from 'zod';
import { emailSchema } from '../../../schemas/password.schema';

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});
