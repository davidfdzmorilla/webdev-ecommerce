import { Price } from '../value-objects/Price';
import { SKU } from '../value-objects/SKU';
import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface ProductProps {
  id: string;
  sku: SKU;
  name: string;
  slug: string;
  description?: string;
  price: Price;
  categoryId?: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private domainEvents: DomainEvent[] = [];

  constructor(private props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }

  get sku(): SKU {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get price(): Price {
    return this.props.price;
  }

  get categoryId(): string | undefined {
    return this.props.categoryId;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updatePrice(newPrice: Price): void {
    const oldPrice = this.props.price;
    this.props.price = newPrice;
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Product',
      eventType: 'ProductPriceChanged',
      eventData: JSON.stringify({ oldPrice, newPrice }),
      occurredAt: new Date(),
    });
  }

  updateStatus(newStatus: ProductStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Product',
      eventType: 'ProductStatusChanged',
      eventData: JSON.stringify({ status: newStatus }),
      occurredAt: new Date(),
    });
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  static create(props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date();
    return new Product({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }
}
