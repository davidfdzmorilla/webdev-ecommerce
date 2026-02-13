import { eq } from 'drizzle-orm';
import { db } from '@/shared/infrastructure/db';
import { payments } from '@/shared/infrastructure/db/schema';
import type { IPaymentRepository } from '../domain/repositories/IPaymentRepository';
import { Payment } from '../domain/entities/Payment';
import type { PaymentStatus } from '../domain/value-objects/PaymentStatus';
import { Result, Ok, Err } from '@/shared/kernel';

export class DrizzlePaymentRepository implements IPaymentRepository {
  async save(payment: Payment): Promise<Result<void>> {
    try {
      const data = {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount.toString(),
        status: payment.status,
        provider: payment.provider,
        transactionId: payment.transactionId,
        metadata: payment.metadata ? JSON.stringify(payment.metadata) : null,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };

      await db
        .insert(payments)
        .values(data)
        .onConflictDoUpdate({
          target: payments.id,
          set: {
            status: data.status,
            transactionId: data.transactionId,
            metadata: data.metadata,
            updatedAt: data.updatedAt,
          },
        });

      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<Payment | null>> {
    try {
      const rows = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const payment = this.toDomain(rows[0]);
      return Ok(payment);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByOrderId(orderId: string): Promise<Result<Payment | null>> {
    try {
      const rows = await db
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId))
        .limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const payment = this.toDomain(rows[0]);
      return Ok(payment);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByTransactionId(transactionId: string): Promise<Result<Payment | null>> {
    try {
      const rows = await db
        .select()
        .from(payments)
        .where(eq(payments.transactionId, transactionId))
        .limit(1);
      
      if (rows.length === 0) {
        return Ok(null);
      }

      const payment = this.toDomain(rows[0]);
      return Ok(payment);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(row: any): Payment {
    return Payment.fromData(
      {
        orderId: row.orderId,
        amount: parseFloat(row.amount),
        status: row.status as PaymentStatus,
        provider: row.provider,
        transactionId: row.transactionId,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      row.id
    );
  }
}
