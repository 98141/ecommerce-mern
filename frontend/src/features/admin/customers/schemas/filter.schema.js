import { z } from 'zod';

export const customerFilterSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['', 'active', 'blocked', 'pending_verification']).optional(),
});
