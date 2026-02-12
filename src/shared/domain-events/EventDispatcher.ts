import type { DomainEvent } from './DomainEvent';

type EventHandler = (event: DomainEvent) => Promise<void>;

export class EventDispatcher {
  private handlers: Map<string, EventHandler[]> = new Map();

  register(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}

export const eventDispatcher = new EventDispatcher();
