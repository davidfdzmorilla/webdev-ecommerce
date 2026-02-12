import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">WebDev Shop</h1>
        <p className="text-xl text-gray-600 mb-2">Level 3: DDD E-Commerce Platform</p>
        <p className="text-gray-500 mb-8">
          Domain-Driven Design with Bounded Contexts, Hexagonal Architecture, and Domain Events
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
          <Link
            href="/admin"
            className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Admin Dashboard
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-sm">
          <div className="bg-white/50 backdrop-blur p-4 rounded-lg">
            <h3 className="font-semibold mb-1">Catalog Context</h3>
            <p className="text-gray-600">Product management</p>
          </div>
          <div className="bg-white/50 backdrop-blur p-4 rounded-lg">
            <h3 className="font-semibold mb-1">Orders Context</h3>
            <p className="text-gray-600">Order processing</p>
          </div>
          <div className="bg-white/50 backdrop-blur p-4 rounded-lg">
            <h3 className="font-semibold mb-1">Identity Context</h3>
            <p className="text-gray-600">Authentication</p>
          </div>
        </div>
      </div>
    </main>
  );
}
