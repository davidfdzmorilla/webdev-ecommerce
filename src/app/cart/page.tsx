import { getCart, getCartTotal } from '@/modules/orders/application/Cart';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const cart = await getCart();
  const total = await getCartTotal();

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/products" className="text-blue-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="bg-white rounded-lg shadow">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-6 border-b">
              <div className="w-24 h-24 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.productName}</h3>
                <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                <p className="text-blue-600 font-semibold mt-1">{item.unitPrice.toString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Qty: {item.quantity}</span>
              </div>
              <div className="text-right">
                <p className="font-bold">{item.unitPrice.multiply(item.quantity).toString()}</p>
              </div>
            </div>
          ))}

          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">{total.toString()}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
