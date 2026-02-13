import { NextRequest, NextResponse } from 'next/server';
import { AddToCartUseCase } from '@/modules/orders/application/use-cases/AddToCartUseCase';
import { DrizzleCartRepository } from '@/modules/orders/infrastructure/DrizzleCartRepository';
import { InMemoryEventBus } from '@/shared/domain-events/InMemoryEventBus';

const eventBus = new InMemoryEventBus();
const cartRepository = new DrizzleCartRepository();

/**
 * GET /api/cart
 * Get current user's cart
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'temp-user-id';

    const result = await cartRepository.findByUserId(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json({ items: [], total: 0, itemCount: 0 });
    }

    // Convert to DTO
    const cart = result.data;
    return NextResponse.json({
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        subtotal: item.subtotal,
      })),
      total: cart.getTotal(),
      itemCount: cart.getItemCount(),
      expiresAt: cart.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'temp-user-id';
    const body = await request.json();

    const useCase = new AddToCartUseCase(cartRepository, eventBus);
    const result = await useCase.execute(userId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
