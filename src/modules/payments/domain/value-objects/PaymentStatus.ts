export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED';

export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED'].includes(
    status
  );
}

export function canTransitionTo(
  from: PaymentStatus,
  to: PaymentStatus
): boolean {
  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    PENDING: ['PROCESSING', 'FAILED'],
    PROCESSING: ['SUCCEEDED', 'FAILED'],
    SUCCEEDED: ['REFUNDED'],
    FAILED: [],
    REFUNDED: [],
  };

  return validTransitions[from].includes(to);
}
