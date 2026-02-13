import type { Payment } from '../../domain/entities/Payment';
import type { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { Result, Ok, Err } from '@/shared/kernel';
import type { ProcessPaymentDTO, PaymentDTO } from '../dto/PaymentDTO';

/**
 * Process payment result from webhook (Stripe, PayPal, etc.)
 */
export class ProcessPaymentUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private eventBus: IEventBus
  ) {}

  async execute(dto: ProcessPaymentDTO): Promise<Result<PaymentDTO, Error>> {
    try {
      // Get payment
      const paymentResult = await this.paymentRepository.findById(dto.paymentId);
      
      if (!paymentResult.success) {
        return Err(paymentResult.error);
      }

      const payment = paymentResult.data;

      if (!payment) {
        return Err(new Error(`Payment not found: ${dto.paymentId}`));
      }

      // Update payment status based on webhook result
      if (dto.success) {
        payment.markAsSucceeded(dto.transactionId);
      } else {
        payment.markAsFailed(dto.failureReason ?? 'Unknown error');
      }

      // Save updated payment
      const saveResult = await this.paymentRepository.save(payment);
      if (!saveResult.success) {
        return Err(saveResult.error);
      }

      // Publish domain events (PaymentSucceeded or PaymentFailed)
      const events = payment.getDomainEvents();
      await this.eventBus.publishAll(events);
      payment.clearDomainEvents();

      return Ok(this.toDTO(payment));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDTO(payment: Payment): PaymentDTO {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      provider: payment.provider,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}
