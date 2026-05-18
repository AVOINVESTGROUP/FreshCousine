import type { AuthorizeRequest } from '../validators/checkout.js';
import { AppError, ERROR_CODES } from '../lib/errors.js';
import { collection, db } from '../lib/firestore.js';
import { nowIso, generateId } from '../lib/utils.js';
import { stripe, isStripeEnabled } from '../lib/stripe.js';
import type { IdempotencyRecord, Order, OrderItem, Payment, Quote } from '../types/models.js';

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

    const keyRef = collection<IdempotencyRecord>('idempotency_keys').doc(payload.idempotencyKey);

    const response = await db.runTransaction(async transaction => {
      const existingKey = await transaction.get(keyRef);
      if (existingKey.exists) {
        const record = existingKey.data() as IdempotencyRecord;
        if (record.quoteId !== payload.quoteId) {
          throw new AppError(ERROR_CODES.IDEMPOTENCY_CONFLICT, 409, 'errors.idempotencyConflict', 'Idempotency key conflict with a different quote');
        }

        return record.responsePayload;
      }

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

      transaction.set(collection<Order>('orders').doc(orderId), order);
      transaction.set(collection<Payment>('payments').doc(paymentId), payment);
      transaction.update(collection<Quote>('quotes').doc(quote.quoteId), {
        status: 'USED',
        usedAt: nowIso(),
        updatedAt: nowIso()
      });

      const record: IdempotencyRecord = {
        idempotencyKey: payload.idempotencyKey,
        userId,
        quoteId: payload.quoteId,
        orderId,
        responsePayload: {
          orderId,
          clientSecret,
          paymentIntentId: providerPaymentIntentId,
          authorizedAmountMinor: quote.maxAuthorizedAmountMinor
        },
        createdAt: nowIso()
      };

      transaction.set(keyRef, record);

      const eventRef = collection<Order>('orders').doc(orderId).collection('events').doc(generateId('event'));
      transaction.set(eventRef, {
        type: 'payment_authorization_created',
        actorType: 'system',
        actorId: 'system',
        payload: {
          quoteId: quote.quoteId,
          orderId,
          authorizedAmountMinor: quote.maxAuthorizedAmountMinor
        },
        createdAt: nowIso()
      });

      return record.responsePayload;
    });

    return response;
  }
}
