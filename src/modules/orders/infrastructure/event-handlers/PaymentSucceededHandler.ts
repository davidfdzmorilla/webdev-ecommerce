import type { DomainEvent } from '@/shared/domain-events/DomainEvent';
import { db } from '@/shared/infrastructure/db';
import { orders } from '@/shared/infrastructure/db/schema';
import { eq } from 'drizzle-orm';

interface PaymentSucceededData {
  paymentId: string;
  orderId: string;
  amount: number;
}

/**
 * Event handler: PaymentSucceeded → UpdateOrderStatus
 * When payment succeeds, update order status to PAID
 */
export class PaymentSucceededHandler {
  async handle(event: DomainEvent): Promise<void> {
    const data: PaymentSucceededData = JSON.parse(event.eventData);

    try {
      // Update order status to PAID
      await db
        .update(orders)
        .set({
          status: 'PAID',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, data.orderId));

      console.log(`Order ${data.orderId} marked as PAID (payment ${data.paymentId})`);
    } catch (error) {
      console.error(`Error updating order ${data.orderId} status:`, error);
      // In production: retry or publish OrderStatusUpdateFailed event
    }
  }
}
