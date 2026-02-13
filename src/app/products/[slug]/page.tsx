import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // TODO: Fetch product from API route /api/catalog/products/:id
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/products" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Products
        </Link>
        
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">Product: {slug}</h1>
          <p className="text-gray-600">Product detail implementation in progress...</p>
        </div>
      </div>
    </main>
  );
}
