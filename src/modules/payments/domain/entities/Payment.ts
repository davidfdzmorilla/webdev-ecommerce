import { AggregateRoot } from '@/shared/kernel';
import type { PaymentStatus } from '../value-objects/PaymentStatus';
import { canTransitionTo } from '../value-objects/PaymentStatus';

export interface PaymentProps {
  orderId: string;
  amount: number;
  status: PaymentStatus;
  provider: string; // 'stripe', 'paypal', etc.
  transactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment aggregate root
 * Manages payment lifecycle and integrations
 */
export class Payment extends AggregateRoot<PaymentProps> {
  private constructor(props: PaymentProps, id: string) {
    super(props, id);
  }

  static create(orderId: string, amount: number, provider: string): Payment {
    if (amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    const now = new Date();
    const payment = new Payment(
      {
        orderId,
        amount,
        status: 'PENDING',
        provider,
        createdAt: now,
        updatedAt: now,
      },
      crypto.randomUUID()
    );

    payment.addDomainEvent({
      aggregateId: payment.id,
      aggregateType: 'Payment',
      eventType: 'PaymentInitiated',
      eventData: JSON.stringify({ orderId, amount, provider }),
      occurredAt: new Date(),
    });

    return payment;
  }

  static fromData(props: PaymentProps, id: string): Payment {
    return new Payment(props, id);
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get provider(): string {
    return this.props.provider;
  }

  get transactionId(): string | undefined {
    return this.props.transactionId;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Mark payment as processing
   */
  markAsProcessing(transactionId: string): void {
    this.updateStatus('PROCESSING');
    this.props.transactionId = transactionId;
  }

  /**
   * Mark payment as succeeded
   */
  markAsSucceeded(transactionId?: string): void {
    this.updateStatus('SUCCEEDED');
    if (transactionId) {
      this.props.transactionId = transactionId;
    }

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Payment',
      eventType: 'PaymentSucceeded',
      eventData: JSON.stringify({
        paymentId: this.id,
        orderId: this.props.orderId,
        amount: this.props.amount,
      }),
      occurredAt: new Date(),
    });
  }

  /**
   * Mark payment as failed
   */
  markAsFailed(reason: string): void {
    this.updateStatus('FAILED');
    this.props.metadata = { ...this.props.metadata, failureReason: reason };

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Payment',
      eventType: 'PaymentFailed',
      eventData: JSON.stringify({
        paymentId: this.id,
        orderId: this.props.orderId,
        reason,
      }),
      occurredAt: new Date(),
    });
  }

  /**
   * Mark payment as refunded
   */
  markAsRefunded(): void {
    if (this.props.status !== 'SUCCEEDED') {
      throw new Error('Can only refund succeeded payments');
    }

    this.updateStatus('REFUNDED');

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Payment',
      eventType: 'PaymentRefunded',
      eventData: JSON.stringify({
        paymentId: this.id,
        orderId: this.props.orderId,
        amount: this.props.amount,
      }),
      occurredAt: new Date(),
    });
  }

  private updateStatus(newStatus: PaymentStatus): void {
    if (!canTransitionTo(this.props.status, newStatus)) {
      throw new Error(
        `Invalid payment status transition: ${this.props.status} -> ${newStatus}`
      );
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }
}
