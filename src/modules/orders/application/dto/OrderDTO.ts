import type { OrderStatus } from '../../domain/value-objects/OrderStatus';

export interface OrderItemDTO {
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
}

export interface OrderDTO {
  id: string;
  userId: string;
  items: OrderItemDTO[];
  status: OrderStatus;
  total: number;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  userId: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface OrderListDTO {
  orders: OrderDTO[];
  total: number;
  page: number;
  pageSize: number;
}
