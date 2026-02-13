import type { Cart } from '../entities/Cart';
import type { Result } from '@/shared/kernel';

/**
 * Cart repository interface (port)
 */
export interface ICartRepository {
  save(cart: Cart): Promise<Result<void>>;
  findById(id: string): Promise<Result<Cart | null>>;
  findByUserId(userId: string): Promise<Result<Cart | null>>;
  delete(id: string): Promise<Result<void>>;
}
