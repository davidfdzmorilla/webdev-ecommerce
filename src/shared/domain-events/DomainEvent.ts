export interface DomainEvent {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: string;
  occurredAt: Date;
}
