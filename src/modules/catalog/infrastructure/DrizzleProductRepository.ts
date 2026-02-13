import { eq, like, and, sql } from 'drizzle-orm';
import { db } from '@/shared/infrastructure/db';
import { products } from '@/shared/infrastructure/db/schema';
import type { IProductRepository, FindManyQuery } from '../domain/repositories/IProductRepository';
import { Product } from '../domain/entities/Product';
import { SKU } from '../domain/value-objects/SKU';
import { Price } from '../domain/value-objects/Price';
import { Result, Ok, Err } from '@/shared/kernel';

export class DrizzleProductRepository implements IProductRepository {
  async save(product: Product): Promise<Result<void>> {
    try {
      const data = {
        id: product.id,
        sku: product.sku.value,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceAmount: product.price.amount.toString(),
        priceCurrency: product.price.currency,
        categoryId: product.categoryId,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      // Upsert (insert or update)
      await db
        .insert(products)
        .values(data)
        .onConflictDoUpdate({
          target: products.id,
          set: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            priceAmount: data.priceAmount,
            priceCurrency: data.priceCurrency,
            categoryId: data.categoryId,
            status: data.status,
            updatedAt: data.updatedAt,
          },
        });

      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<Product | null>> {
    try {
      const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const product = this.toDomain(rows[0]);
      return Ok(product);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findBySKU(sku: string): Promise<Result<Product | null>> {
    try {
      const rows = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const product = this.toDomain(rows[0]);
      return Ok(product);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findMany(query: FindManyQuery): Promise<Result<Product[]>> {
    try {
      const conditions = [];

      if (query.categoryId) {
        conditions.push(eq(products.categoryId, query.categoryId));
      }

      if (query.status) {
        conditions.push(eq(products.status, query.status));
      }

      if (query.search) {
        conditions.push(
          sql`${products.name} ILIKE ${`%${query.search}%`} OR ${products.description} ILIKE ${`%${query.search}%`}`
        );
      }

      let queryBuilder = db.select().from(products);

      if (conditions.length > 0) {
        queryBuilder = queryBuilder.where(and(...conditions)) as any;
      }

      const rows = await queryBuilder
        .limit(query.take ?? 20)
        .offset(query.skip ?? 0)
        .orderBy(products.createdAt);

      const productList = rows.map((row) => this.toDomain(row));
      return Ok(productList);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async count(query: Omit<FindManyQuery, 'skip' | 'take'>): Promise<Result<number>> {
    try {
      const conditions = [];

      if (query.categoryId) {
        conditions.push(eq(products.categoryId, query.categoryId));
      }

      if (query.status) {
        conditions.push(eq(products.status, query.status));
      }

      if (query.search) {
        conditions.push(
          sql`${products.name} ILIKE ${`%${query.search}%`} OR ${products.description} ILIKE ${`%${query.search}%`}`
        );
      }

      let queryBuilder = db.select({ count: sql<number>`count(*)` }).from(products);

      if (conditions.length > 0) {
        queryBuilder = queryBuilder.where(and(...conditions)) as any;
      }

      const result = await queryBuilder;
      return Ok(Number(result[0].count));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(row: any): Product {
    const sku = SKU.create(row.sku);
    const price = Price.create(parseFloat(row.priceAmount), row.priceCurrency);

    return Product.fromData({
      id: row.id,
      sku,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price,
      categoryId: row.categoryId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
