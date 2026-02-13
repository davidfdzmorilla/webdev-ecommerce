import { eq } from 'drizzle-orm';
import { db } from '@/shared/infrastructure/db';
import { users } from '@/shared/infrastructure/db/schema';
import type { IUserRepository } from '../domain/repositories/IUserRepository';
import { User } from '../domain/entities/User';
import { Email } from '../domain/value-objects/Email';
import type { UserRole } from '../domain/entities/User';
import { Result, Ok, Err } from '@/shared/kernel';

export class DrizzleUserRepository implements IUserRepository {
  async save(user: User): Promise<Result<void>> {
    try {
      const data = {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: user.role,
        emailVerified: false,
        image: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await db
        .insert(users)
        .values(data)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: data.name,
            role: data.role,
            updatedAt: data.updatedAt,
          },
        });

      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<User | null>> {
    try {
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const user = this.toDomain(rows[0]);
      return Ok(user);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const user = this.toDomain(rows[0]);
      return Ok(user);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(row: any): User {
    const email = Email.create(row.email);

    return User.fromData(
      {
        email,
        name: row.name,
        role: row.role as UserRole,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      row.id
    );
  }
}
