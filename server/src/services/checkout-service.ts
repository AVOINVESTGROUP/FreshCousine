import type { AuthorizeRequest } from '../validators/checkout.js';
import { AppError, ERROR_CODES } from '../lib/errors.js';
import { collection } from '../lib/firestore.js';
import { nowIso, generateId } from '../lib/utils.js';
import { stripe, isStripeEnabled } from '../lib/stripe.js';
import type { Order, OrderItem, Payment, Quote } from '../types/models.js';

export class CheckoutService {
  async authorizePayment(userId: string, payload: AuthorizeRequest) {
    const quoteSnapshot = await collection<Quote>('quotes').doc(payload.quoteId).get();
    if (!quoteSnapshot.exists) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'errors.quoteNotFound', 'Quote not found');
    }

    const quote = quoteSnapshot.data();
    if (!quote) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'errors.quoteNotFound', 'Quote not found');
    }

    if (quote.userId !== userId) {
      throw new AppError(ERROR_CODES.QUOTE_NOT_OWNED, 403, 'errors.quoteNotOwned', 'Quote does not belong to the current user');
    }

    if (quote.status !== 'ACTIVE') {
      throw new AppError(ERROR_CODES.QUOTE_ALREADY_USED, 400, 'errors.quoteAlreadyUsed', 'Quote has already been used or expired');
    }

    if (new Date(quote.expiresAt).getTime() < Date.now()) {
      throw new AppError(ERROR_CODES.QUOTE_EXPIRED, 400, 'errors.quoteExpired', 'Quote has expired');
    }

    const orderId = generateId('order');
    const items: OrderItem[] = quote.items.map((item, index) => ({
      orderItemId: `${orderId}_item_${index + 1}`,
      marketProductId: item.marketProductId,
      productId: item.productId,
      nameSnapshot: item.productId,
      priceMode: 'FIXED',
      requestedQty: item.requestedQty,
      requestedUnit: item.requestedUnit,
      estimatedUnitPriceMinor: item.estimatedUnitPriceMinor,
      estimatedLineTotalMinor: item.estimatedLineTotalMinor,
      substitutionStatus: 'NONE'
    }));

    const userAddress = { addressId: quote.addressId };
    const order: Order = {
      orderId,
      userId,
      marketId: quote.marketId,
      sourceType: 'MARKET_DIRECT',
      status: 'PAYMENT_AUTHORIZATION_PENDING',
      paymentStatus: 'AUTHORIZATION_PENDING',
      procurementStatus: 'NOT_STARTED',
      deliveryStatus: 'NOT_STARTED',
      items,
      estimatedSubtotalMinor: quote.estimatedSubtotalMinor,
      estimatedDeliveryFeeMinor: quote.estimatedDeliveryFeeMinor,
      estimatedServiceFeeMinor: quote.estimatedServiceFeeMinor,
      estimatedTotalMinor: quote.estimatedTotalMinor,
      maxAuthorizedAmountMinor: quote.maxAuthorizedAmountMinor,
      substitutionPolicy: quote.substitutionPolicy,
      addressSnapshot: userAddress,
      etaMin: 23,
      etaMax: 28,
      idempotencyKey: payload.idempotencyKey,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    const paymentId = generateId('payment');
    let providerPaymentIntentId = `pi_stub_${paymentId}`;
    let clientSecret = 'test_client_secret';

    if (isStripeEnabled() && stripe) {
      try {
        const intent = await stripe.paymentIntents.create({
          amount: quote.maxAuthorizedAmountMinor,
          currency: 'aed',
          capture_method: 'manual',
          payment_method_types: ['card'],
          metadata: {
            quoteId: quote.quoteId,
            orderId
          }
        });
        providerPaymentIntentId = intent.id;
        clientSecret = intent.client_secret ?? 'missing_client_secret';
      } catch (error) {
        throw new AppError(ERROR_CODES.AUTHORIZATION_FAILED, 502, 'errors.authorizationFailed', 'Stripe authorization failed', error);
      }
    }

    const payment: Payment = {
      paymentId,
      orderId,
      provider: 'stripe',
      providerPaymentIntentId,
      status: 'AUTHORIZATION_PENDING',
      authorizedAmountMinor: quote.maxAuthorizedAmountMinor,
      currency: 'AED',
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    await collection<Order>('orders').doc(orderId).set(order);
    await collection<Payment>('payments').doc(paymentId).set(payment);
    await collection<Quote>('quotes').doc(quote.quoteId).update({
      status: 'USED',
      usedAt: nowIso(),
      updatedAt: nowIso()
    });

    return {
      orderId,
      clientSecret,
      paymentIntentId: providerPaymentIntentId,
      authorizedAmountMinor: quote.maxAuthorizedAmountMinor
    };
  }
}
