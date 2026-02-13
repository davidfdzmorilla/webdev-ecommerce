import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/ProductRepository';
import { Result, Ok, Err } from '@/shared/kernel';
import type { ProductDTO, ProductListDTO } from '../dto/ProductDTO';

export interface ListProductsQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  search?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

export class ListProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(query: ListProductsQuery): Promise<Result<ProductListDTO, Error>> {
    try {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;

      const result = await this.productRepository.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        categoryId: query.categoryId,
        search: query.search,
        status: query.status,
      });

      if (!result.success) {
        return Err(result.error);
      }

      const products = result.data.map((p) => this.toDTO(p));

      // Get total count for pagination
      const countResult = await this.productRepository.count({
        categoryId: query.categoryId,
        search: query.search,
        status: query.status,
      });

      if (!countResult.success) {
        return Err(countResult.error);
      }

      return Ok({
        products,
        total: countResult.data,
        page,
        pageSize,
      });
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
