import { NextRequest, NextResponse } from 'next/server';
import { PlaceOrderUseCase } from '@/modules/orders/application/use-cases/PlaceOrderUseCase';
import { DrizzleOrderRepository } from '@/modules/orders/infrastructure/DrizzleOrderRepository';
import { DrizzleCartRepository } from '@/modules/orders/infrastructure/DrizzleCartRepository';
import { InMemoryEventBus } from '@/shared/domain-events/InMemoryEventBus';
import { EventHandlerRegistry } from '@/shared/infrastructure/events/EventHandlerRegistry';

const eventBus = new InMemoryEventBus();
EventHandlerRegistry.register(eventBus); // Register event handlers

const orderRepository = new DrizzleOrderRepository();
const cartRepository = new DrizzleCartRepository();

/**
 * GET /api/orders
 * Get current user's orders
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'temp-user-id';

    const result = await orderRepository.findByUserId(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    // Convert to DTOs
    const orders = result.data.map((order) => ({
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: order.total,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        subtotal: item.subtotal,
      })),
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return NextResponse.json({ orders, total: orders.length });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Place a new order
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'temp-user-id';
    const body = await request.json();

    const useCase = new PlaceOrderUseCase(orderRepository, cartRepository, eventBus);
    const result = await useCase.execute({
      userId,
      shippingAddress: body.shippingAddress,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
