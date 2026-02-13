import { AggregateRoot } from '@/shared/kernel';
import { OrderItem } from './OrderItem';
import type { OrderStatus } from '../value-objects/OrderStatus';
import { canTransitionOrderStatus } from '../value-objects/OrderStatus';

export interface OrderProps {
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order aggregate root
 * Manages order lifecycle through state machine
 */
export class Order extends AggregateRoot<OrderProps> {
  private constructor(props: OrderProps, id: string) {
    super(props, id);
  }

  static create(
    userId: string,
    items: OrderItem[],
    shippingAddress?: OrderProps['shippingAddress']
  ): Order {
    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const now = new Date();

    const order = new Order(
      {
        userId,
        items,
        status: 'PENDING',
        total,
        shippingAddress,
        createdAt: now,
        updatedAt: now,
      },
      crypto.randomUUID()
    );

    order.addDomainEvent({
      aggregateId: order.id,
      aggregateType: 'Order',
      eventType: 'OrderCreated',
      eventData: JSON.stringify({ orderId: order.id, userId, total }),
      occurredAt: new Date(),
    });

    return order;
  }

  static fromData(props: OrderProps, id: string): Order {
    return new Order(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get total(): number {
    return this.props.total;
  }

  get shippingAddress(): OrderProps['shippingAddress'] {
    return this.props.shippingAddress;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Update order status with validation
   */
  updateStatus(newStatus: OrderStatus): void {
    if (!canTransitionOrderStatus(this.props.status, newStatus)) {
      throw new Error(
        `Invalid order status transition: ${this.props.status} -> ${newStatus}`
      );
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Order',
      eventType: 'OrderStatusChanged',
      eventData: JSON.stringify({ orderId: this.id, status: newStatus }),
      occurredAt: new Date(),
    });
  }

  /**
   * Mark order as paid
   */
  markAsPaid(): void {
    this.updateStatus('PAID');

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Order',
      eventType: 'OrderPaid',
      eventData: JSON.stringify({ orderId: this.id }),
      occurredAt: new Date(),
    });
  }

  /**
   * Cancel order
   */
  cancel(): void {
    if (this.props.status !== 'PENDING' && this.props.status !== 'PAYMENT_PENDING') {
      throw new Error('Can only cancel pending orders');
    }

    this.updateStatus('CANCELLED');

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Order',
      eventType: 'OrderCancelled',
      eventData: JSON.stringify({ orderId: this.id }),
      occurredAt: new Date(),
    });
  }
}
