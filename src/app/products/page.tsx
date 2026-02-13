import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  // TODO: Fetch products from API route /api/catalog/products
  const products: any[] = [];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No products available yet</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold">{product.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
