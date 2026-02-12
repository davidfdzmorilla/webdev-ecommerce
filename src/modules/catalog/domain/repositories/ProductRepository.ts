import type { Product } from '../entities/Product';
import type { Result } from '@/shared/kernel/Result';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findByCategory(categoryId: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  save(product: Product): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}
