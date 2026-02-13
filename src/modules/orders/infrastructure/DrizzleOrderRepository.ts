import { eq } from 'drizzle-orm';
import { db } from '@/shared/infrastructure/db';
import { orders, orderItems, shippingAddresses } from '@/shared/infrastructure/db/schema';
import type { OrderRepository } from '../domain/repositories/OrderRepository';
import type { Order } from '../domain/entities/Order';
import { OrderStatus } from '../domain/value-objects/OrderStatus';
import { Price } from '@/modules/catalog/domain/value-objects/Price';
import { Ok, Err, type Result } from '@/shared/kernel/Result';

export class DrizzleOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: true,
        shippingAddress: true,
      },
    });

    return order ? this.toDomain(order) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const results = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: true,
        shippingAddress: true,
      },
    });

    return results.map((r) => this.toDomain(r));
  }

  async save(order: Order): Promise<Result<void>> {
    try {
      await db.transaction(async (tx) => {
        // Insert/update order
        await tx
          .insert(orders)
          .values({
            id: order.id,
            userId: order.userId,
            status: order.status.value,
            subtotalAmount: order.subtotal.amount.toString(),
            taxAmount: order.tax.amount.toString(),
            shippingAmount: order.shipping.amount.toString(),
            totalAmount: order.total.amount.toString(),
            currency: order.total.currency,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          })
          .onConflictDoUpdate({
            target: orders.id,
            set: {
              status: order.status.value,
              updatedAt: order.updatedAt,
            },
          });

        // Insert order items
        for (const item of order.items) {
          await tx.insert(orderItems).values({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            unitPriceAmount: item.unitPrice.amount.toString(),
            totalAmount: item.unitPrice.multiply(item.quantity).amount.toString(),
          });
        }

        // Insert shipping address
        const addr = order.shippingAddress;
        await tx.insert(shippingAddresses).values({
          orderId: order.id,
          fullName: addr.fullName,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone,
        });
      });

      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private toDomain(data: any): Order {
    return Order.fromData({
      id: data.id,
      userId: data.userId,
      status: new OrderStatus(data.status),
      items: data.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: Price.create(parseFloat(item.unitPriceAmount)),
      })),
      shippingAddress: {
        fullName: data.shippingAddress.fullName,
        addressLine1: data.shippingAddress.addressLine1,
        addressLine2: data.shippingAddress.addressLine2,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        postalCode: data.shippingAddress.postalCode,
        country: data.shippingAddress.country,
        phone: data.shippingAddress.phone,
      },
      subtotal: Price.create(parseFloat(data.subtotalAmount)),
      tax: Price.create(parseFloat(data.taxAmount)),
      shipping: Price.create(parseFloat(data.shippingAmount)),
      total: Price.create(parseFloat(data.totalAmount)),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
