import { Payment } from '../../domain/entities/Payment';
import type { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { Result, Ok, Err } from '@/shared/kernel';
import type { CreatePaymentIntentDTO, PaymentDTO } from '../dto/PaymentDTO';

export class CreatePaymentIntentUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private eventBus: IEventBus
  ) {}

  async execute(dto: CreatePaymentIntentDTO): Promise<Result<PaymentDTO, Error>> {
    try {
      // Check if payment already exists for this order
      const existingResult = await this.paymentRepository.findByOrderId(dto.orderId);
      
      if (!existingResult.success) {
        return Err(existingResult.error);
      }

      if (existingResult.data) {
        // Return existing payment if already created
        return Ok(this.toDTO(existingResult.data));
      }

      // Create payment aggregate
      const payment = Payment.create(dto.orderId, dto.amount, 'stripe');

      // Save payment
      const saveResult = await this.paymentRepository.save(payment);
      if (!saveResult.success) {
        return Err(saveResult.error);
      }

      // Publish domain events
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
