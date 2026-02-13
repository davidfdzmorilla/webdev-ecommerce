import type { DomainEvent } from './DomainEvent';

/**
 * Event handler function type
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void> | void;

/**
 * Event Bus interface (port)
 * Infrastructure implementations (adapters) must implement this
 */
export interface IEventBus {
  /**
   * Publish a domain event
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Publish multiple domain events
   */
  publishAll(events: readonly DomainEvent[]): Promise<void>;

  /**
   * Subscribe to an event type
   */
  subscribe(eventType: string, handler: EventHandler): void;

  /**
   * Unsubscribe from an event type
   */
  unsubscribe(eventType: string, handler: EventHandler): void;
}
