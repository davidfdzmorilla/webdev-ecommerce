import type { Order } from '../entities/Order';
import type { Result } from '@/shared/kernel';

/**
 * Order repository interface (port)
 */
export interface IOrderRepository {
  save(order: Order): Promise<Result<void>>;
  findById(id: string): Promise<Result<Order | null>>;
  findByUserId(userId: string, limit?: number): Promise<Result<Order[]>>;
}
