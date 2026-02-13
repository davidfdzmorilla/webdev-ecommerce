import { eq } from 'drizzle-orm';
import { db } from '@/shared/infrastructure/db';
import { carts } from '@/shared/infrastructure/db/schema';
import type { ICartRepository } from '../domain/repositories/ICartRepository';
import { Cart } from '../domain/entities/Cart';
import { OrderItem } from '../domain/entities/OrderItem';
import { Result, Ok, Err } from '@/shared/kernel';

export class DrizzleCartRepository implements ICartRepository {
  async save(cart: Cart): Promise<Result<void>> {
    try {
      const items = cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        subtotal: item.subtotal,
      }));

      const data = {
        id: cart.id,
        userId: cart.userId,
        items: JSON.stringify(items),
        expiresAt: cart.expiresAt,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };

      await db
        .insert(carts)
        .values(data)
        .onConflictDoUpdate({
          target: carts.id,
          set: {
            items: data.items,
            updatedAt: data.updatedAt,
          },
        });

      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<Cart | null>> {
    try {
      const rows = await db.select().from(carts).where(eq(carts.id, id)).limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const cart = this.toDomain(rows[0]);
      return Ok(cart);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByUserId(userId: string): Promise<Result<Cart | null>> {
    try {
      const rows = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const cart = this.toDomain(rows[0]);
      return Ok(cart);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await db.delete(carts).where(eq(carts.id, id));
      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(row: any): Cart {
    const items = JSON.parse(row.items).map((item: any) =>
      OrderItem.fromData(
        {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
          subtotal: item.subtotal,
        },
        item.id
      )
    );

    return Cart.fromData(
      {
        userId: row.userId,
        items,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      row.id
    );
  }
}
