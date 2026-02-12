import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-gray-600">Manage product catalog</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-gray-600">View and manage orders</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            <p className="text-gray-600">Manage product categories</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
