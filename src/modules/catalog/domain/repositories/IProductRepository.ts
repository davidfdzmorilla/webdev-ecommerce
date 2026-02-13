import type { Product } from '../entities/Product';
import type { Result } from '@/shared/kernel';

export interface FindManyQuery {
  skip?: number;
  take?: number;
  categoryId?: string;
  search?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

/**
 * Product repository interface (port)
 * Infrastructure layer must implement this
 */
export interface IProductRepository {
  save(product: Product): Promise<Result<void>>;
  findById(id: string): Promise<Result<Product | null>>;
  findBySKU(sku: string): Promise<Result<Product | null>>;
  findMany(query: FindManyQuery): Promise<Result<Product[]>>;
  count(query: Omit<FindManyQuery, 'skip' | 'take'>): Promise<Result<number>>;
}
