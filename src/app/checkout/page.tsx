import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 mb-4">Checkout implementation in progress...</p>
          <Link href="/cart" className="text-blue-600 hover:underline">
            Back to Cart
          </Link>
        </div>
      </div>
    </main>
  );
}
