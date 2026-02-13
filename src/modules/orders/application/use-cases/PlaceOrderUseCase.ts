import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import type { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import type { ICartRepository } from '../../domain/repositories/ICartRepository';
import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { Result, Ok, Err } from '@/shared/kernel';
import type { CreateOrderDTO, OrderDTO } from '../dto/OrderDTO';
import { createOrderPlacedEvent } from '../../domain/events/OrderPlaced';

export class PlaceOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private cartRepository: ICartRepository,
    private eventBus: IEventBus
  ) {}

  async execute(dto: CreateOrderDTO): Promise<Result<OrderDTO, Error>> {
    try {
      // Get user's cart
      const cartResult = await this.cartRepository.findByUserId(dto.userId);
      
      if (!cartResult.success) {
        return Err(cartResult.error);
      }

      const cart = cartResult.data;

      if (!cart || cart.isEmpty()) {
        return Err(new Error('Cart is empty'));
      }

      if (cart.isExpired()) {
        return Err(new Error('Cart has expired'));
      }

      // Create order items from cart
      const orderItems = cart.items.map((item) =>
        OrderItem.create(
          item.productId,
          item.productName,
          item.quantity,
          item.priceAtOrder
        )
      );

      // Create order aggregate
      const order = Order.create(dto.userId, orderItems, dto.shippingAddress);

      // Save order
      const saveResult = await this.orderRepository.save(order);
      if (!saveResult.success) {
        return Err(saveResult.error);
      }

      // Clear cart after successful order
      cart.clear();
      await this.cartRepository.save(cart);

      // Publish domain events
      const events = order.getDomainEvents();
      await this.eventBus.publishAll(events);
      order.clearDomainEvents();

      // Publish OrderPlaced event for other modules (inventory, payments)
      await this.eventBus.publish(
        createOrderPlacedEvent({
          orderId: order.id,
          userId: order.userId,
          items: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          total: order.total,
        })
      );

      return Ok(this.toDTO(order));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDTO(order: Order): OrderDTO {
    return {
      id: order.id,
      userId: order.userId,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        subtotal: item.subtotal,
      })),
      status: order.status,
      total: order.total,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
