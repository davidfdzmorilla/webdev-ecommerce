import { Product } from '../../domain/entities/Product';
import { SKU } from '../../domain/value-objects/SKU';
import { Price } from '../../domain/value-objects/Price';
import type { IProductRepository } from '../../domain/repositories/ProductRepository';
import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { Result, Ok, Err } from '@/shared/kernel';
import type { CreateProductDTO, ProductDTO } from '../dto/ProductDTO';
import { createProductCreatedEvent } from '../../domain/events/ProductCreated';

export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private eventBus: IEventBus
  ) {}

  async execute(dto: CreateProductDTO): Promise<Result<ProductDTO, Error>> {
    try {
      // Create value objects
      const sku = SKU.create(dto.sku);
      const price = Price.create(dto.price, 'USD');

      // Create product aggregate
      const product = Product.create({
        sku,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price,
        categoryId: dto.categoryId,
        status: 'active',
      });

      // Save to repository
      const saveResult = await this.productRepository.save(product);
      if (!saveResult.success) {
        return Err(saveResult.error);
      }

      // Publish domain events
      const events = product.getDomainEvents();
      await this.eventBus.publishAll(events);
      product.clearDomainEvents();

      // Also publish ProductCreated event for other modules
      await this.eventBus.publish(
        createProductCreatedEvent({
          productId: product.id,
          sku: product.sku.value,
          name: product.name,
          price: product.price.amount,
        })
      );

      return Ok(this.toDTO(product));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDTO(product: Product): ProductDTO {
    return {
      id: product.id,
      sku: product.sku.value,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.amount,
      categoryId: product.categoryId,
      status: product.status,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
