import { NextRequest, NextResponse } from 'next/server';
import { GetProductUseCase } from '@/modules/catalog/application/use-cases/GetProductUseCase';
import { DrizzleProductRepository } from '@/modules/catalog/infrastructure/DrizzleProductRepository';

const productRepository = new DrizzleProductRepository();

/**
 * GET /api/catalog/products/:id
 * Get product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const useCase = new GetProductUseCase(productRepository);
    const result = await useCase.byId(params.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('GET /api/catalog/products/:id error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
