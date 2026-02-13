import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export interface OrderPlacedData {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  total: number;
}

export function createOrderPlacedEvent(data: OrderPlacedData): DomainEvent {
  return {
    aggregateId: data.orderId,
    aggregateType: 'Order',
    eventType: 'OrderPlaced',
    eventData: JSON.stringify(data),
    occurredAt: new Date(),
  };
}
