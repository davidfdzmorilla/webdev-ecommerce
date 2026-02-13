import { NextRequest, NextResponse } from 'next/server';
import { ProcessPaymentUseCase } from '@/modules/payments/application/use-cases/ProcessPaymentUseCase';
import { DrizzlePaymentRepository } from '@/modules/payments/infrastructure/DrizzlePaymentRepository';
import { InMemoryEventBus } from '@/shared/domain-events/InMemoryEventBus';
import { EventHandlerRegistry } from '@/shared/infrastructure/events/EventHandlerRegistry';

const eventBus = new InMemoryEventBus();
EventHandlerRegistry.register(eventBus);

const paymentRepository = new DrizzlePaymentRepository();

/**
 * POST /api/payments/webhook
 * Handle Stripe payment webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Verify Stripe webhook signature
    const body = await request.json();

    // Stripe webhook event structure
    const eventType = body.type;
    const paymentIntent = body.data.object;

    if (eventType === 'payment_intent.succeeded') {
      const useCase = new ProcessPaymentUseCase(paymentRepository, eventBus);
      const result = await useCase.execute({
        paymentId: paymentIntent.metadata.paymentId,
        transactionId: paymentIntent.id,
        success: true,
      });

      if (!result.success) {
        console.error('Payment processing failed:', result.error.message);
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      return NextResponse.json({ received: true });
    }

    if (eventType === 'payment_intent.payment_failed') {
      const useCase = new ProcessPaymentUseCase(paymentRepository, eventBus);
      const result = await useCase.execute({
        paymentId: paymentIntent.metadata.paymentId,
        transactionId: paymentIntent.id,
        success: false,
        failureReason: paymentIntent.last_payment_error?.message ?? 'Unknown error',
      });

      if (!result.success) {
        console.error('Payment failure processing failed:', result.error.message);
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      return NextResponse.json({ received: true });
    }

    // Ignore other event types
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('POST /api/payments/webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
