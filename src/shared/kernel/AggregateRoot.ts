import { Entity } from './Entity';
import type { DomainEvent } from '../domain-events/DomainEvent';

/**
 * Base AggregateRoot class for DDD aggregate roots
 * Aggregate roots manage domain events and enforce invariants
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  /**
   * Add a domain event to be published
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Get all domain events (for publishing)
   */
  getDomainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  /**
   * Clear domain events after publishing
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Check if aggregate has unpublished events
   */
  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }
}
