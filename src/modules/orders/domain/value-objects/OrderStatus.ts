export type OrderStatusValue = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export class OrderStatus {
  private constructor(public readonly value: OrderStatusValue) {}

  static pending(): OrderStatus {
    return new OrderStatus('pending');
  }

  static confirmed(): OrderStatus {
    return new OrderStatus('confirmed');
  }

  static processing(): OrderStatus {
    return new OrderStatus('processing');
  }

  static shipped(): OrderStatus {
    return new OrderStatus('shipped');
  }

  static delivered(): OrderStatus {
    return new OrderStatus('delivered');
  }

  static cancelled(): OrderStatus {
    return new OrderStatus('cancelled');
  }

  canTransitionTo(newStatus: OrderStatusValue): boolean {
    const transitions: Record<OrderStatusValue, OrderStatusValue[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    return transitions[this.value].includes(newStatus);
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }
}
