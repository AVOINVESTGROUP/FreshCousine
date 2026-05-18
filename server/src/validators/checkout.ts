import { z } from 'zod';

export const authorizeRequestSchema = z.object({
  quoteId: z.string().min(1),
  paymentMethod: z.string().min(1),
  idempotencyKey: z.string().min(1)
});

export type AuthorizeRequest = z.infer<typeof authorizeRequestSchema>;
