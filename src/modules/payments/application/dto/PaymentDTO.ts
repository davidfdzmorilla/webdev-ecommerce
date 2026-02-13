import type { PaymentStatus } from '../../domain/value-objects/PaymentStatus';

export interface PaymentDTO {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentDTO {
  orderId: string;
  amount: number;
}

export interface ProcessPaymentDTO {
  paymentId: string;
  transactionId: string;
  success: boolean;
  failureReason?: string;
}
