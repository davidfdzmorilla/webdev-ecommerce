import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/ProductRepository';
import { Result, Ok, Err } from '@/shared/kernel';
import type { ProductDTO } from '../dto/ProductDTO';

export class GetProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async byId(id: string): Promise<Result<ProductDTO | null, Error>> {
    try {
      const result = await this.productRepository.findById(id);
      
      if (!result.success) {
        return Err(result.error);
      }

      if (!result.data) {
        return Ok(null);
      }

      return Ok(this.toDTO(result.data));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async bySKU(sku: string): Promise<Result<ProductDTO | null, Error>> {
    try {
      const result = await this.productRepository.findBySKU(sku);
      
      if (!result.success) {
        return Err(result.error);
      }

      if (!result.data) {
        return Ok(null);
      }

      return Ok(this.toDTO(result.data));
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
