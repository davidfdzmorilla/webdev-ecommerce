import { Redis } from 'ioredis';
import type { IEventBus, EventHandler } from './IEventBus';
import type { DomainEvent } from './DomainEvent';

/**
 * Redis-based event bus implementation
 * Uses Redis Pub/Sub for distributed event handling
 */
export class RedisEventBus implements IEventBus {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private initialized = false;

  constructor(redisUrl: string) {
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  /**
   * Initialize the event bus (call once at startup)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Listen for all messages
    this.subscriber.on('message', async (channel: string, message: string) => {
      try {
        const event: DomainEvent = JSON.parse(message);
        await this.handleEvent(event);
      } catch (error) {
        console.error(`Error processing event from channel ${channel}:`, error);
      }
    });

    this.initialized = true;
  }

  async publish(event: DomainEvent): Promise<void> {
    const channel = `domain-events:${event.eventType}`;
    const message = JSON.stringify(event);
    await this.publisher.publish(channel, message);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    const pipeline = this.publisher.pipeline();
    
    for (const event of events) {
      const channel = `domain-events:${event.eventType}`;
      const message = JSON.stringify(event);
      pipeline.publish(channel, message);
    }

    await pipeline.exec();
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
      // Subscribe to Redis channel
      const channel = `domain-events:${eventType}`;
      this.subscriber.subscribe(channel).catch((error) => {
        console.error(`Error subscribing to ${channel}:`, error);
      });
    }
    this.handlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
        // Unsubscribe from Redis channel
        const channel = `domain-events:${eventType}`;
        this.subscriber.unsubscribe(channel).catch((error) => {
          console.error(`Error unsubscribing from ${channel}:`, error);
        });
      }
    }
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    if (!handlers || handlers.size === 0) {
      return;
    }

    // Execute handlers concurrently
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
        // Continue processing other handlers
      }
    });

    await Promise.all(promises);
  }

  /**
   * Close Redis connections
   */
  async close(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}
