import { AggregateRoot } from '@/shared/kernel';
import { OrderItem } from './OrderItem';

export interface CartProps {
  userId: string;
  items: OrderItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart aggregate root
 * Manages shopping cart before order placement
 */
export class Cart extends AggregateRoot<CartProps> {
  private constructor(props: CartProps, id: string) {
    super(props, id);
  }

  static create(userId: string, expiresInHours: number = 24): Cart {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const cart = new Cart(
      {
        userId,
        items: [],
        expiresAt,
        createdAt: now,
        updatedAt: now,
      },
      crypto.randomUUID()
    );

    cart.addDomainEvent({
      aggregateId: cart.id,
      aggregateType: 'Cart',
      eventType: 'CartCreated',
      eventData: JSON.stringify({ userId }),
      occurredAt: new Date(),
    });

    return cart;
  }

  static fromData(props: CartProps, id: string): Cart {
    return new Cart(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Calculate total cart value
   */
  getTotal(): number {
    return this.props.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  /**
   * Get total item count
   */
  getItemCount(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Add item to cart or update quantity if exists
   */
  addItem(productId: string, productName: string, quantity: number, price: number): void {
    const existingItem = this.props.items.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.updateQuantity(existingItem.quantity + quantity);
    } else {
      const newItem = OrderItem.create(productId, productName, quantity, price);
      this.props.items.push(newItem);
    }

    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Cart',
      eventType: 'CartItemAdded',
      eventData: JSON.stringify({ productId, quantity }),
      occurredAt: new Date(),
    });
  }

  /**
   * Remove item from cart
   */
  removeItem(productId: string): void {
    const index = this.props.items.findIndex((item) => item.productId === productId);

    if (index === -1) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    this.props.items.splice(index, 1);
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Cart',
      eventType: 'CartItemRemoved',
      eventData: JSON.stringify({ productId }),
      occurredAt: new Date(),
    });
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(productId: string, quantity: number): void {
    const item = this.props.items.find((item) => item.productId === productId);

    if (!item) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    item.updateQuantity(quantity);
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Cart',
      eventType: 'CartItemUpdated',
      eventData: JSON.stringify({ productId, quantity }),
      occurredAt: new Date(),
    });
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.props.items = [];
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Cart',
      eventType: 'CartCleared',
      eventData: JSON.stringify({}),
      occurredAt: new Date(),
    });
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.props.items.length === 0;
  }

  /**
   * Check if cart is expired
   */
  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
