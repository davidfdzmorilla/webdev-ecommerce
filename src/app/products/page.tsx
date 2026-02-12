import { searchProducts } from '@/modules/catalog/application/GetProducts';
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await searchProducts('');

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4"
              >
                <div className="aspect-square bg-gray-200 rounded-md mb-4"></div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description || 'No description available'}
                </p>
                <p className="text-xl font-bold text-blue-600">{product.price.toString()}</p>
                <p className="text-xs text-gray-500 mt-1">SKU: {product.sku.value}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
