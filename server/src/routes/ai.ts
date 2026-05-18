import { Router } from 'express';
import { authenticate } from '../lib/auth.js';
import { validate } from '../lib/validate.js';
import { textToBasketRequestSchema } from '../validators/ai.js';
import { AiService } from '../services/ai-service.js';

const router = Router();
const service = new AiService();

router.post('/text-to-basket', authenticate('customer'), validate(textToBasketRequestSchema), async (req, res, next) => {
  try {
    const data = await service.textToBasket((req as any).userId, req.body);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
