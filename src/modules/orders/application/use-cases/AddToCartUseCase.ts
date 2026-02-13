import { Cart } from '../../domain/entities/Cart';
import type { ICartRepository } from '../../domain/repositories/ICartRepository';
import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { Result, Ok, Err } from '@/shared/kernel';
import type { AddToCartDTO, CartDTO } from '../dto/CartDTO';

export class AddToCartUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private eventBus: IEventBus
  ) {}

  async execute(userId: string, dto: AddToCartDTO): Promise<Result<CartDTO, Error>> {
    try {
      // Get or create cart
      let cartResult = await this.cartRepository.findByUserId(userId);
      
      if (!cartResult.success) {
        return Err(cartResult.error);
      }

      let cart = cartResult.data;

      if (!cart) {
        // Create new cart if doesn't exist
        cart = Cart.create(userId);
      } else if (cart.isExpired()) {
        // Clear expired cart
        cart.clear();
      }

      // Add item to cart
      cart.addItem(dto.productId, dto.productName, dto.quantity, dto.price);

      // Save cart
      const saveResult = await this.cartRepository.save(cart);
      if (!saveResult.success) {
        return Err(saveResult.error);
      }

      // Publish domain events
      const events = cart.getDomainEvents();
      await this.eventBus.publishAll(events);
      cart.clearDomainEvents();

      return Ok(this.toDTO(cart));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDTO(cart: Cart): CartDTO {
    return {
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
    };
  }
}
