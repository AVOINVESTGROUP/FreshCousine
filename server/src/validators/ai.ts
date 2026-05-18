import { z } from 'zod';

export const textToBasketRequestSchema = z.object({
  text: z.string().min(3),
  marketId: z.string().min(1),
  servings: z.number().int().positive().optional().default(2)
});

export type TextToBasketRequest = z.infer<typeof textToBasketRequestSchema>;
