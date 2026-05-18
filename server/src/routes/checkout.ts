import { Router } from 'express';
import { authenticate } from '../lib/auth.js';
import { validate } from '../lib/validate.js';
import { authorizeRequestSchema } from '../validators/checkout.js';
import { CheckoutService } from '../services/checkout-service.js';

const router = Router();
const service = new CheckoutService();

router.post('/authorize', authenticate('customer'), validate(authorizeRequestSchema), async (req, res, next) => {
  try {
    const data = await service.authorizePayment((req as any).userId, req.body);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
