import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { OrderPlacedHandler } from '@/modules/catalog/infrastructure/event-handlers/OrderPlacedHandler';
import { PaymentSucceededHandler } from '@/modules/orders/infrastructure/event-handlers/PaymentSucceededHandler';

/**
 * Central registry for all event handlers
 * Called at application startup to wire up domain event subscriptions
 */
export class EventHandlerRegistry {
  static register(eventBus: IEventBus): void {
    // Catalog module handlers
    const orderPlacedHandler = new OrderPlacedHandler(eventBus);
    eventBus.subscribe('OrderPlaced', (event) => orderPlacedHandler.handle(event));

    // Orders module handlers
    const paymentSucceededHandler = new PaymentSucceededHandler();
    eventBus.subscribe('PaymentSucceeded', (event) => paymentSucceededHandler.handle(event));

    console.log('✅ Event handlers registered');
  }
}
