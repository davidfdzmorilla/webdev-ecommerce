import type { User } from '../entities/User';
import type { Result } from '@/shared/kernel';

/**
 * User repository interface (port)
 * Infrastructure layer must implement this
 */
export interface IUserRepository {
  save(user: User): Promise<Result<void>>;
  findById(id: string): Promise<Result<User | null>>;
  findByEmail(email: string): Promise<Result<User | null>>;
}
