import type { Order } from '../entities/Order';
import type { Result } from '@/shared/kernel/Result';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  save(order: Order): Promise<Result<void>>;
}
