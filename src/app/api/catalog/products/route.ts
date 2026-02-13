import { NextRequest, NextResponse } from 'next/server';
import { CreateProductUseCase } from '@/modules/catalog/application/use-cases/CreateProductUseCase';
import { ListProductsUseCase } from '@/modules/catalog/application/use-cases/ListProductsUseCase';
import { DrizzleProductRepository } from '@/modules/catalog/infrastructure/DrizzleProductRepository';
import { InMemoryEventBus } from '@/shared/domain-events/InMemoryEventBus';

// TODO: Use dependency injection container instead of direct instantiation
const eventBus = new InMemoryEventBus();
const productRepository = new DrizzleProductRepository();

/**
 * GET /api/catalog/products
 * List products with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20');
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    const status = searchParams.get('status') as 'active' | 'inactive' | 'out_of_stock' | undefined;

    const useCase = new ListProductsUseCase(productRepository);
    const result = await useCase.execute({ page, pageSize, categoryId, search, status });

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('GET /api/catalog/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/catalog/products
 * Create new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication and authorization middleware
    const body = await request.json();

    const useCase = new CreateProductUseCase(productRepository, eventBus);
    const result = await useCase.execute(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('POST /api/catalog/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
