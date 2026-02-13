import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export interface OrderPaidData {
  orderId: string;
  paymentId: string;
  amount: number;
}

export function createOrderPaidEvent(data: OrderPaidData): DomainEvent {
  return {
    aggregateId: data.orderId,
    aggregateType: 'Order',
    eventType: 'OrderPaid',
    eventData: JSON.stringify(data),
    occurredAt: new Date(),
  };
}
