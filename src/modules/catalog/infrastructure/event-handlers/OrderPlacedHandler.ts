import type { DomainEvent } from '@/shared/domain-events/DomainEvent';
import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { db } from '@/shared/infrastructure/db';
import { inventory } from '@/shared/infrastructure/db/schema';
import { eq } from 'drizzle-orm';
import { createInventoryReducedEvent } from '../../domain/events/InventoryReduced';

interface OrderPlacedData {
  orderId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

/**
 * Event handler: OrderPlaced → ReduceInventory
 * When an order is placed, reduce inventory for each product
 */
export class OrderPlacedHandler {
  constructor(private eventBus: IEventBus) {}

  async handle(event: DomainEvent): Promise<void> {
    const data: OrderPlacedData = JSON.parse(event.eventData);

    for (const item of data.items) {
      try {
        // Fetch current inventory
        const inventoryRows = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId))
          .limit(1);

        if (inventoryRows.length === 0) {
          console.warn(`Inventory not found for product ${item.productId}`);
          continue;
        }

        const current = inventoryRows[0];
        const available = current.quantity - current.reserved;

        if (available < item.quantity) {
          // Insufficient inventory - should have been checked before order placement
          console.error(
            `Insufficient inventory for product ${item.productId}: available=${available}, requested=${item.quantity}`
          );
          // In production: publish InventoryInsufficient event → cancel order
          continue;
        }

        // Reserve inventory (reduce available, don't commit yet)
        await db
          .update(inventory)
          .set({
            reserved: current.reserved + item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(inventory.productId, item.productId));

        // Publish InventoryReduced event
        await this.eventBus.publish(
          createInventoryReducedEvent({
            productId: item.productId,
            quantity: item.quantity,
            orderId: data.orderId,
          })
        );
      } catch (error) {
        console.error(`Error reducing inventory for product ${item.productId}:`, error);
        // In production: implement compensating transaction (saga pattern)
      }
    }
  }
}
