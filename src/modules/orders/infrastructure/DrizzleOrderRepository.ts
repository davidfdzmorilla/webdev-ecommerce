import { eq } from 'drizzle-orm';
import { db } from '@/shared/infrastructure/db';
import { orders, orderItems, shippingAddresses } from '@/shared/infrastructure/db/schema';
import type { IOrderRepository } from '../domain/repositories/IOrderRepository';
import { Order } from '../domain/entities/Order';
import { OrderItem } from '../domain/entities/OrderItem';
import { Result, Ok, Err } from '@/shared/kernel';

export class DrizzleOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<Result<void>> {
    try {
      // Start transaction
      await db.transaction(async (tx) => {
        // Upsert order
        const orderData = {
          id: order.id,
          userId: order.userId,
          status: order.status,
          subtotalAmount: order.total.toString(),
          taxAmount: '0.00',
          shippingAmount: '0.00',
          totalAmount: order.total.toString(),
          currency: 'USD',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };

        await tx
          .insert(orders)
          .values(orderData)
          .onConflictDoUpdate({
            target: orders.id,
            set: {
              status: orderData.status,
              updatedAt: orderData.updatedAt,
            },
          });

        // Delete existing order items (for updates)
        await tx.delete(orderItems).where(eq(orderItems.orderId, order.id));

        // Insert order items
        if (order.items.length > 0) {
          const itemsData = order.items.map((item) => ({
            id: item.id,
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productSku: '', // Would need to fetch from product
            quantity: item.quantity,
            unitPriceAmount: item.priceAtOrder.toString(),
            totalAmount: item.subtotal.toString(),
            createdAt: new Date(),
          }));

          await tx.insert(orderItems).values(itemsData);
        }

        // Upsert shipping address
        if (order.shippingAddress) {
          const addressData = {
            id: crypto.randomUUID(),
            orderId: order.id,
            fullName: '', // Would come from user
            addressLine1: order.shippingAddress.street,
            addressLine2: null,
            city: order.shippingAddress.city,
            state: null,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
            phone: null,
          };

          // Delete existing address
          await tx.delete(shippingAddresses).where(eq(shippingAddresses.orderId, order.id));
          // Insert new address
          await tx.insert(shippingAddresses).values(addressData);
        }
      });

      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<Order | null>> {
    try {
      const orderRows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
      
      if (orderRows.length === 0) {
        return Ok(null);
      }

      const orderRow = orderRows[0];

      // Fetch order items
      const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

      // Fetch shipping address
      const addressRows = await db
        .select()
        .from(shippingAddresses)
        .where(eq(shippingAddresses.orderId, id))
        .limit(1);

      const order = this.toDomain(orderRow, itemRows, addressRows[0]);
      return Ok(order);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Result<Order[]>> {
    try {
      const orderRows = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(orders.createdAt)
        .limit(limit);

      const orderList = await Promise.all(
        orderRows.map(async (orderRow) => {
          // Fetch items for each order
          const itemRows = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderRow.id));

          // Fetch address
          const addressRows = await db
            .select()
            .from(shippingAddresses)
            .where(eq(shippingAddresses.orderId, orderRow.id))
            .limit(1);

          return this.toDomain(orderRow, itemRows, addressRows[0]);
        })
      );

      return Ok(orderList);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(orderRow: any, itemRows: any[], addressRow?: any): Order {
    const items = itemRows.map((item) =>
      OrderItem.fromData(
        {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          priceAtOrder: parseFloat(item.unitPriceAmount),
          subtotal: parseFloat(item.totalAmount),
        },
        item.id
      )
    );

    const shippingAddress = addressRow
      ? {
          street: addressRow.addressLine1,
          city: addressRow.city,
          postalCode: addressRow.postalCode,
          country: addressRow.country,
        }
      : undefined;

    return Order.fromData(
      {
        userId: orderRow.userId,
        items,
        status: orderRow.status,
        total: parseFloat(orderRow.totalAmount),
        shippingAddress,
        createdAt: orderRow.createdAt,
        updatedAt: orderRow.updatedAt,
      },
      orderRow.id
    );
  }
}
