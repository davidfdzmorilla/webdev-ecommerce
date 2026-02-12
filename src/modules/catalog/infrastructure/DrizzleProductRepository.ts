import { eq, like, ilike } from 'drizzle-orm';
import { db } from '@/shared/infrastructure/db';
import { products } from '@/shared/infrastructure/db/schema';
import type { ProductRepository } from '../domain/repositories/ProductRepository';
import type { Product } from '../domain/entities/Product';
import { Price } from '../domain/value-objects/Price';
import { SKU } from '../domain/value-objects/SKU';
import { Ok, Err, type Result } from '@/shared/kernel/Result';

export class DrizzleProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    return result ? this.toDomain(result) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const result = await db.query.products.findFirst({
      where: eq(products.sku, sku),
    });

    return result ? this.toDomain(result) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const result = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });

    return result ? this.toDomain(result) : null;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const results = await db.query.products.findMany({
      where: eq(products.categoryId, categoryId),
    });

    return results.map((r) => this.toDomain(r));
  }

  async search(query: string): Promise<Product[]> {
    const results = await db.query.products.findMany({
      where: ilike(products.name, `%${query}%`),
    });

    return results.map((r) => this.toDomain(r));
  }

  async save(product: Product): Promise<Result<void>> {
    try {
      await db
        .insert(products)
        .values({
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
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            name: product.name,
            description: product.description,
            priceAmount: product.price.amount.toString(),
            priceCurrency: product.price.currency,
            categoryId: product.categoryId,
            status: product.status,
            updatedAt: product.updatedAt,
          },
        });

      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await db.delete(products).where(eq(products.id, id));
      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private toDomain(data: any): Product {
    return new (Product as any)({
      id: data.id,
      sku: SKU.create(data.sku),
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Price.create(parseFloat(data.priceAmount), data.priceCurrency),
      categoryId: data.categoryId,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
