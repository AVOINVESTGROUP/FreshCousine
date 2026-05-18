import { AppError, ERROR_CODES } from '../lib/errors.js';
import { collection } from '../lib/firestore.js';
import { nowIso, generateId, roundUpMinor } from '../lib/utils.js';
import type { Market, MarketProduct, Quote, QuoteRequest, QuoteItem, ServiceZone } from '../types/models.js';

const FIXED_FEE = 150; // AED 1.50
const FIXED_SERVICE = 100; // AED 1.00

export class QuoteService {
  async createQuote(userId: string, payload: QuoteRequest) {
    const marketSnapshot = await collection<Market>('markets').doc(payload.marketId).get();
    if (!marketSnapshot.exists) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'errors.marketNotFound', 'Market not found');
    }

    const market = marketSnapshot.data();
    if (!market?.isActive) {
      throw new AppError(ERROR_CODES.MARKET_CLOSED, 400, 'errors.marketClosed', 'Market is closed or unavailable');
    }

    const zoneSnapshot = await collection<ServiceZone>('service_zones').doc(payload.zoneId).get();
    if (!zoneSnapshot.exists) {
      throw new AppError(ERROR_CODES.OUTSIDE_SERVICE_ZONE, 400, 'errors.zoneNotFound', 'Service zone not found');
    }

    const zone = zoneSnapshot.data();
    if (!zone?.isActive) {
      throw new AppError(ERROR_CODES.OUTSIDE_SERVICE_ZONE, 400, 'errors.zoneInactive', 'Service zone is currently inactive');
    }

    const items: QuoteItem[] = [];
    const warnings: string[] = [];
    let subtotal = 0;

    for (const item of payload.items) {
      const productSnapshot = await collection<MarketProduct>('market_products').doc(item.marketProductId).get();
      if (!productSnapshot.exists) {
        throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'errors.productNotFound', 'Requested market product not found');
      }

      const product = productSnapshot.data();
      if (!product?.isActive) {
        throw new AppError(ERROR_CODES.ITEM_UNAVAILABLE_TODAY, 400, 'errors.itemUnavailableToday', 'Requested item is unavailable today');
      }

      if (product.availabilityStatus === 'UNAVAILABLE_TODAY') {
        throw new AppError(ERROR_CODES.ITEM_UNAVAILABLE_TODAY, 400, 'errors.itemUnavailableToday', 'Requested item is unavailable today');
      }

      const estimatedUnitPriceMinor = product.priceMode === 'FIXED'
        ? product.estimatedMinPriceMinor
        : Math.round((product.estimatedMinPriceMinor + product.estimatedMaxPriceMinor) / 2);

      const lineTotal = roundUpMinor(estimatedUnitPriceMinor * item.requestedQty);
      subtotal += lineTotal;

      const itemWarnings: string[] = [];
      if (product.availabilityStatus === 'CONFIRM_REQUIRED') {
        itemWarnings.push('Availability at the market requires confirmation before procurement.');
      }
      if (product.priceMode === 'VARIABLE_WEIGHT') {
        itemWarnings.push('Final weight and price will be confirmed at the market.');
      }

      if (itemWarnings.length > 0) {
        warnings.push(...itemWarnings);
      }

      items.push({
        marketProductId: item.marketProductId,
        productId: item.productId,
        requestedQty: item.requestedQty,
        requestedUnit: item.requestedUnit,
        estimatedUnitPriceMinor,
        estimatedLineTotalMinor: lineTotal,
        substitutionAllowed: item.substitutionAllowed ?? true,
        availabilityStatus: product.availabilityStatus,
        warnings: itemWarnings
      });
    }

    const estimatedDeliveryFeeMinor = zone.deliveryFeeMinor || FIXED_FEE;
    const estimatedServiceFeeMinor = zone.serviceFeeMinor || FIXED_SERVICE;
    const estimatedTotalMinor = subtotal + estimatedDeliveryFeeMinor + estimatedServiceFeeMinor;
    const maxAuthorizedAmountMinor = roundUpMinor(estimatedTotalMinor * 1.15);

    const now = nowIso();
    const quoteId = generateId('quote');

    const quote: Quote = {
      quoteId,
      userId,
      marketId: payload.marketId,
      zoneId: payload.zoneId,
      addressId: payload.addressId,
      items,
      estimatedSubtotalMinor: subtotal,
      estimatedDeliveryFeeMinor,
      estimatedServiceFeeMinor,
      estimatedTotalMinor,
      maxAuthorizedAmountMinor,
      warnings: [...new Set(warnings.concat('Final availability, exact weight, and final price will be confirmed at the market.'))],
      substitutionPolicy: payload.substitutionPolicy,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now
    };

    await collection<Quote>('quotes').doc(quoteId).set(quote);

    return quote;
  }
}
