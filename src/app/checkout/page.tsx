import { getCart, getCartTotal } from '@/modules/orders/application/Cart';
import { redirect } from 'next/navigation';

export default async function CheckoutPage() {
  const cart = await getCart();
  const total = await getCartTotal();

  if (cart.items.length === 0) {
    redirect('/cart');
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    className="border rounded px-3 py-2"
                  />
                </div>
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Address Line 1"
                  required
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Address Line 2 (optional)"
                  className="w-full border rounded px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    required
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    required
                    className="border rounded px-3 py-2"
                  />
                </div>
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  required
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  className="w-full border rounded px-3 py-2"
                />
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <p className="text-gray-600">Payment integration coming soon...</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.productName} x {item.quantity}
                    </span>
                    <span>{item.unitPrice.multiply(item.quantity).toString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{total.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (21%)</span>
                  <span>{total.multiply(0.21).toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>5.99 EUR</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total.add(total.multiply(0.21)).add({ amount: 5.99, currency: 'EUR' } as any).toString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-6"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
