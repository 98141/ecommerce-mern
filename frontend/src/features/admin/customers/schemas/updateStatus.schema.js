import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'blocked']),
  reason: z.string().trim().optional(),
});
