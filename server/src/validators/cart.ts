import { z } from 'zod';

export const quoteRequestSchema = z.object({
  items: z.array(
    z.object({
      marketProductId: z.string().min(1),
      productId: z.string().min(1),
      requestedQty: z.number().positive(),
      requestedUnit: z.string().min(1),
      substitutionAllowed: z.boolean().optional().default(true)
    })
  ),
  addressId: z.string().min(1),
  marketId: z.string().min(1),
  zoneId: z.string().min(1),
  substitutionPolicy: z.enum(['ASK_EVERY_TIME', 'ALLOW_SIMILAR', 'REMOVE_UNAVAILABLE']).optional().default('ASK_EVERY_TIME')
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
