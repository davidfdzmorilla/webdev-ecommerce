import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export interface InventoryReducedData {
  productId: string;
  quantity: number;
  orderId: string;
}

export function createInventoryReducedEvent(
  data: InventoryReducedData
): DomainEvent {
  return {
    aggregateId: data.productId,
    aggregateType: 'Inventory',
    eventType: 'InventoryReduced',
    eventData: JSON.stringify(data),
    occurredAt: new Date(),
  };
}
