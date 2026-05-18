import { Router } from 'express';
import { authenticate } from '../lib/auth.js';
import { validate } from '../lib/validate.js';
import { quoteRequestSchema } from '../validators/cart.js';
import { QuoteService } from '../services/quote-service.js';

const router = Router();
const service = new QuoteService();

router.post('/quote', authenticate('customer'), validate(quoteRequestSchema), async (req, res, next) => {
  try {
    const data = await service.createQuote((req as any).userId, req.body);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
