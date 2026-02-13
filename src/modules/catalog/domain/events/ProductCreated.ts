import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export interface ProductCreatedData {
  productId: string;
  sku: string;
  name: string;
  price: number;
}

export function createProductCreatedEvent(data: ProductCreatedData): DomainEvent {
  return {
    aggregateId: data.productId,
    aggregateType: 'Product',
    eventType: 'ProductCreated',
    eventData: JSON.stringify(data),
    occurredAt: new Date(),
  };
}
