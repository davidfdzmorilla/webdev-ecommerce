'use server';

import { DrizzleProductRepository } from '../infrastructure/DrizzleProductRepository';
import type { Product } from '../domain/entities/Product';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const repository = new DrizzleProductRepository();
  return repository.findBySlug(slug);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const repository = new DrizzleProductRepository();
  return repository.search(query);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const repository = new DrizzleProductRepository();
  return repository.findByCategory(categoryId);
}
