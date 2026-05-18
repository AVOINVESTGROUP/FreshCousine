export type AvailabilityStatus = 'LIKELY_AVAILABLE' | 'CONFIRM_REQUIRED' | 'UNAVAILABLE_TODAY' | 'SEASONAL';
export type PriceMode = 'FIXED' | 'VARIABLE_WEIGHT';
export type SubstitutionPolicy = 'ASK_EVERY_TIME' | 'ALLOW_SIMILAR' | 'REMOVE_UNAVAILABLE';
export type OrderPaymentStatus =
  | 'AUTHORIZATION_PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'AUTHORIZATION_FAILED'
  | 'AUTHORIZATION_EXPIRED'
  | 'CAPTURE_FAILED'
  | 'CANCELLED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';
export type ProcurementStatus =
  | 'NOT_STARTED'
  | 'ASSIGNED'
  | 'AT_MARKET'
  | 'BUYING'
  | 'NEEDS_APPROVAL'
  | 'PURCHASED'
  | 'FAILED'
  | 'CANCELLED';
export type DeliveryStatus =
  | 'NOT_STARTED'
  | 'READY_FOR_DELIVERY'
  | 'PICKED_UP_FROM_MARKET'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export interface Product {
  productId: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
  images?: string[];
  defaultUnit: string;
  baseUnit: string;
  handlingType?: string;
  allergens?: string[];
  isOrganic?: boolean;
  isActive: boolean;
}

export interface Market {
  marketId: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  operatingHours: string;
  isActive: boolean;
}

export interface ServiceZone {
  zoneId: string;
  name: string;
  marketId: string;
  polygon: unknown;
  minOrderMinor: number;
  deliveryFeeMinor: number;
  serviceFeeMinor: number;
  promisedEtaMin: number;
  promisedEtaMax: number;
  isActive: boolean;
}

export interface MarketProduct {
  marketProductId: string;
  productId: string;
  marketId: string;
  vendorId: string;
  estimatedMinPriceMinor: number;
  estimatedMaxPriceMinor: number;
  estimatedUnit: string;
  priceMode: PriceMode;
  estimatedWeightMin?: number;
  estimatedWeightMax?: number;
  availabilityStatus: AvailabilityStatus;
  lastObservedAt: string;
  isActive: boolean;
}

export interface QuoteItem {
  marketProductId: string;
  productId: string;
  requestedQty: number;
  requestedUnit: string;
  estimatedUnitPriceMinor: number;
  estimatedLineTotalMinor: number;
  substitutionAllowed: boolean;
  availabilityStatus: AvailabilityStatus;
  warnings: string[];
}

export interface QuoteRequestItem {
  marketProductId: string;
  productId: string;
  requestedQty: number;
  requestedUnit: string;
  substitutionAllowed: boolean;
}

export interface QuoteRequest {
  items: QuoteRequestItem[];
  addressId: string;
  marketId: string;
  zoneId: string;
  substitutionPolicy: SubstitutionPolicy;
}

export interface Quote {
  quoteId: string;
  userId: string;
  marketId: string;
  zoneId: string;
  addressId: string;
  items: QuoteItem[];
  estimatedSubtotalMinor: number;
  estimatedDeliveryFeeMinor: number;
  estimatedServiceFeeMinor: number;
  estimatedTotalMinor: number;
  maxAuthorizedAmountMinor: number;
  warnings: string[];
  substitutionPolicy: SubstitutionPolicy;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  orderItemId: string;
  marketProductId: string;
  productId: string;
  nameSnapshot: string;
  priceMode: PriceMode;
  requestedQty: number;
  requestedUnit: string;
  estimatedWeightMin?: number;
  estimatedWeightMax?: number;
  purchasedQty?: number;
  purchasedUnit?: string;
  purchasedWeight?: number;
  estimatedUnitPriceMinor: number;
  estimatedLineTotalMinor: number;
  finalUnitPriceMinor?: number;
  finalLineTotalMinor?: number;
  substitutionStatus: 'NONE' | 'REQUIRED' | 'APPROVED' | 'REJECTED' | 'AUTO_ALLOWED' | 'REMOVED';
  vendorId?: string;
  shopperNote?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  marketId: string;
  sourceType: 'MARKET_DIRECT';
  status: string;
  paymentStatus: OrderPaymentStatus;
  procurementStatus: ProcurementStatus;
  deliveryStatus: DeliveryStatus;
  items: OrderItem[];
  estimatedSubtotalMinor: number;
  estimatedDeliveryFeeMinor: number;
  estimatedServiceFeeMinor: number;
  estimatedTotalMinor: number;
  maxAuthorizedAmountMinor: number;
  finalSubtotalMinor?: number;
  finalDeliveryFeeMinor?: number;
  finalServiceFeeMinor?: number;
  finalTotalMinor?: number;
  taxMinor?: number;
  taxInvoiceId?: string;
  substitutionPolicy: SubstitutionPolicy;
  addressSnapshot: unknown;
  etaMin?: number;
  etaMax?: number;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  paymentId: string;
  orderId: string;
  provider: 'stripe';
  providerPaymentIntentId: string;
  providerCheckoutSessionId?: string;
  status: OrderPaymentStatus;
  authorizedAmountMinor: number;
  capturedAmountMinor?: number;
  refundedAmountMinor?: number;
  currency: 'AED';
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequestItem {
  marketProductId: string;
  productId: string;
  requestedQty: number;
  requestedUnit: string;
  substitutionAllowed: boolean;
}
