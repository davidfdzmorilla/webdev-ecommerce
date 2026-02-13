import { Entity } from '@/shared/kernel';

export interface OrderItemProps {
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number; // Capture price at order time
  subtotal: number;
}

/**
 * OrderItem entity
 * Represents a line item in an order
 * Part of the Order aggregate (not a root)
 */
export class OrderItem extends Entity<OrderItemProps> {
  private constructor(props: OrderItemProps, id: string) {
    super(props, id);
  }

  static create(
    productId: string,
    productName: string,
    quantity: number,
    price: number
  ): OrderItem {
    if (quantity <= 0) {
      throw new Error('Order quantity must be positive');
    }

    if (price < 0) {
      throw new Error('Price cannot be negative');
    }

    const subtotal = quantity * price;

    return new OrderItem(
      {
        productId,
        productName,
        quantity,
        priceAtOrder: price,
        subtotal,
      },
      crypto.randomUUID()
    );
  }

  static fromData(props: OrderItemProps, id: string): OrderItem {
    return new OrderItem(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get priceAtOrder(): number {
    return this.props.priceAtOrder;
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  /**
   * Update quantity and recalculate subtotal
   */
  updateQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    this.props.quantity = newQuantity;
    this.props.subtotal = newQuantity * this.props.priceAtOrder;
  }
}
