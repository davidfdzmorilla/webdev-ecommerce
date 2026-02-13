import { OrderStatus, type OrderStatusValue } from '../value-objects/OrderStatus';
import { Price } from '@/modules/catalog/domain/value-objects/Price';
import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export interface OrderItemData {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: Price;
}

export interface ShippingAddressData {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderProps {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemData[];
  shippingAddress: ShippingAddressData;
  subtotal: Price;
  tax: Price;
  shipping: Price;
  total: Price;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private domainEvents: DomainEvent[] = [];

  constructor(private props: OrderProps) {}

  static fromData(props: OrderProps): Order {
    return new Order(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get items(): OrderItemData[] {
    return [...this.props.items];
  }

  get shippingAddress(): ShippingAddressData {
    return { ...this.props.shippingAddress };
  }

  get subtotal(): Price {
    return this.props.subtotal;
  }

  get tax(): Price {
    return this.props.tax;
  }

  get shipping(): Price {
    return this.props.shipping;
  }

  get total(): Price {
    return this.props.total;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  confirm(): void {
    if (!this.props.status.canTransitionTo('confirmed')) {
      throw new Error(`Cannot confirm order with status ${this.props.status.value}`);
    }

    this.props.status = OrderStatus.confirmed();
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Order',
      eventType: 'OrderConfirmed',
      eventData: JSON.stringify({ orderId: this.id }),
      occurredAt: new Date(),
    });
  }

  cancel(): void {
    if (!this.props.status.canTransitionTo('cancelled')) {
      throw new Error(`Cannot cancel order with status ${this.props.status.value}`);
    }

    this.props.status = OrderStatus.cancelled();
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Order',
      eventType: 'OrderCancelled',
      eventData: JSON.stringify({ orderId: this.id }),
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

  static create(
    userId: string,
    items: OrderItemData[],
    shippingAddress: ShippingAddressData
  ): Order {
    const subtotal = items.reduce((sum, item) => sum.add(item.unitPrice.multiply(item.quantity)), Price.create(0));
    const tax = subtotal.multiply(0.21); // 21% VAT
    const shipping = Price.create(5.99); // Fixed shipping
    const total = subtotal.add(tax).add(shipping);

    const now = new Date();
    const order = new Order({
      id: crypto.randomUUID(),
      userId,
      status: OrderStatus.pending(),
      items,
      shippingAddress,
      subtotal,
      tax,
      shipping,
      total,
      createdAt: now,
      updatedAt: now,
    });

    order.addDomainEvent({
      aggregateId: order.id,
      aggregateType: 'Order',
      eventType: 'OrderCreated',
      eventData: JSON.stringify({ orderId: order.id, userId }),
      occurredAt: now,
    });

    return order;
  }
}
