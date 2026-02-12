'use server';

import { Product } from '../domain/entities/Product';
import { Price } from '../domain/value-objects/Price';
import { SKU } from '../domain/value-objects/SKU';
import { DrizzleProductRepository } from '../infrastructure/DrizzleProductRepository';
import type { Result } from '@/shared/kernel/Result';
import { Err } from '@/shared/kernel/Result';

export interface CreateProductInput {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  priceAmount: number;
  priceCurrency?: string;
  categoryId?: string;
}

export async function createProduct(input: CreateProductInput): Promise<Result<Product, string>> {
  try {
    const sku = SKU.create(input.sku);
    const price = Price.create(input.priceAmount, input.priceCurrency);

    const product = Product.create({
      sku,
      name: input.name,
      slug: input.slug,
      description: input.description,
      price,
      categoryId: input.categoryId,
      status: 'active',
    });

    const repository = new DrizzleProductRepository();
    const result = await repository.save(product);

    if (!result.success) {
      return Err(result.error.message);
    }

    return { success: true, data: product };
  } catch (error) {
    return Err(error instanceof Error ? error.message : 'Failed to create product');
  }
}
