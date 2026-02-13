import { Entity } from '@/shared/kernel';

export type RefundStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface RefundProps {
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund entity
 * Represents a refund for a payment
 */
export class Refund extends Entity<RefundProps> {
  private constructor(props: RefundProps, id: string) {
    super(props, id);
  }

  static create(paymentId: string, amount: number, reason: string): Refund {
    if (amount <= 0) {
      throw new Error('Refund amount must be positive');
    }

    const now = new Date();
    return new Refund(
      {
        paymentId,
        amount,
        reason,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
      crypto.randomUUID()
    );
  }

  static fromData(props: RefundProps, id: string): Refund {
    return new Refund(props, id);
  }

  get paymentId(): string {
    return this.props.paymentId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get reason(): string {
    return this.props.reason;
  }

  get status(): RefundStatus {
    return this.props.status;
  }

  get transactionId(): string | undefined {
    return this.props.transactionId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  markAsProcessing(transactionId: string): void {
    this.props.status = 'PROCESSING';
    this.props.transactionId = transactionId;
    this.props.updatedAt = new Date();
  }

  markAsCompleted(): void {
    this.props.status = 'COMPLETED';
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    this.props.status = 'FAILED';
    this.props.updatedAt = new Date();
  }
}
