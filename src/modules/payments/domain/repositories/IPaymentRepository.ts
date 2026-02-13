import type { Payment } from '../entities/Payment';
import type { Result } from '@/shared/kernel';

/**
 * Payment repository interface (port)
 * Infrastructure layer must implement this
 */
export interface IPaymentRepository {
  save(payment: Payment): Promise<Result<void>>;
  findById(id: string): Promise<Result<Payment | null>>;
  findByOrderId(orderId: string): Promise<Result<Payment | null>>;
  findByTransactionId(transactionId: string): Promise<Result<Payment | null>>;
}
