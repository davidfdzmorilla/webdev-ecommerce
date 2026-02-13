import { Entity } from '@/shared/kernel';

export interface InventoryProps {
  productId: string;
  quantity: number;
  reserved: number;
  updatedAt: Date;
}

/**
 * Inventory entity
 * Tracks available stock and reservations for a product
 * Note: This is an entity, not an aggregate root (Product is the aggregate root)
 */
export class Inventory extends Entity<InventoryProps> {
  private constructor(props: InventoryProps, id: string) {
    super(props, id);
  }

  static create(productId: string, quantity: number): Inventory {
    return new Inventory(
      {
        productId,
        quantity,
        reserved: 0,
        updatedAt: new Date(),
      },
      productId // Use productId as inventory ID (1-to-1 relationship)
    );
  }

  static fromData(props: InventoryProps, id: string): Inventory {
    return new Inventory(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get reserved(): number {
    return this.props.reserved;
  }

  get available(): number {
    return this.props.quantity - this.props.reserved;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Reserve quantity for an order (reduce available stock)
   * Throws if insufficient stock
   */
  reserve(amount: number): void {
    if (amount <= 0) {
      throw new Error('Reserve amount must be positive');
    }

    if (this.available < amount) {
      throw new Error(
        `Insufficient inventory: available=${this.available}, requested=${amount}`
      );
    }

    this.props.reserved += amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Release reserved quantity (e.g., order cancelled)
   */
  release(amount: number): void {
    if (amount <= 0) {
      throw new Error('Release amount must be positive');
    }

    if (this.props.reserved < amount) {
      throw new Error(
        `Cannot release more than reserved: reserved=${this.props.reserved}, release=${amount}`
      );
    }

    this.props.reserved -= amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Commit reserved quantity (e.g., order shipped)
   */
  commit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Commit amount must be positive');
    }

    if (this.props.reserved < amount) {
      throw new Error(
        `Cannot commit more than reserved: reserved=${this.props.reserved}, commit=${amount}`
      );
    }

    this.props.reserved -= amount;
    this.props.quantity -= amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Restock inventory
   */
  restock(amount: number): void {
    if (amount <= 0) {
      throw new Error('Restock amount must be positive');
    }

    this.props.quantity += amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if product is in stock
   */
  isInStock(): boolean {
    return this.available > 0;
  }
}
