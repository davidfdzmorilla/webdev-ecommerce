import { db } from '../db';
import { domainEvents } from '../db/schema';
import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export class EventStore {
  async save(event: DomainEvent): Promise<void> {
    await db.insert(domainEvents).values({
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      eventType: event.eventType,
      eventData: event.eventData,
      occurredAt: event.occurredAt,
      processed: false,
    });
  }

  async saveAll(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    await db.insert(domainEvents).values(
      events.map((event) => ({
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: event.eventData,
        occurredAt: event.occurredAt,
        processed: false,
      }))
    );
  }

  async getUnprocessed(): Promise<DomainEvent[]> {
    const results = await db.query.domainEvents.findMany({
      where: (events, { eq }) => eq(events.processed, false),
      orderBy: (events, { asc }) => asc(events.occurredAt),
    });

    return results.map((r) => ({
      aggregateId: r.aggregateId,
      aggregateType: r.aggregateType,
      eventType: r.eventType,
      eventData: r.eventData,
      occurredAt: r.occurredAt,
    }));
  }
}

export const eventStore = new EventStore();
