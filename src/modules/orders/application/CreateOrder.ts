'use server';

import { Order } from '../domain/entities/Order';
import type { OrderItemData, ShippingAddressData } from '../domain/entities/Order';
import { DrizzleOrderRepository } from '../infrastructure/DrizzleOrderRepository';
import type { Result } from '@/shared/kernel/Result';
import { Err } from '@/shared/kernel/Result';

export interface CreateOrderInput {
  userId: string;
  items: OrderItemData[];
  shippingAddress: ShippingAddressData;
}

export async function createOrder(input: CreateOrderInput): Promise<Result<Order, string>> {
  try {
    if (input.items.length === 0) {
      return Err('Order must have at least one item');
    }

    const order = Order.create(input.userId, input.items, input.shippingAddress);

    const repository = new DrizzleOrderRepository();
    const result = await repository.save(order);

    if (!result.success) {
      return Err(result.error.message);
    }

    return { success: true, data: order };
  } catch (error) {
    return Err(error instanceof Error ? error.message : 'Failed to create order');
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const repository = new DrizzleOrderRepository();
  return repository.findByUserId(userId);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const repository = new DrizzleOrderRepository();
  return repository.findById(id);
}
