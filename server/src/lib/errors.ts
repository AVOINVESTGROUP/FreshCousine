export class AppError extends Error {
  public readonly statusCode: number;
  public readonly messageKey: string;
  public readonly details?: unknown;

  constructor(code: string, statusCode: number, messageKey: string, fallbackMessage: string, details?: unknown) {
    super(fallbackMessage);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.messageKey = messageKey;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  QUOTE_ALREADY_USED: 'QUOTE_ALREADY_USED',
  QUOTE_NOT_OWNED: 'QUOTE_NOT_OWNED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  ITEM_UNAVAILABLE_TODAY: 'ITEM_UNAVAILABLE_TODAY',
  MARKET_CLOSED: 'MARKET_CLOSED',
  OUTSIDE_SERVICE_ZONE: 'OUTSIDE_SERVICE_ZONE'
} as const;
