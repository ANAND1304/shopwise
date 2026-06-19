import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import { EmptyState, Spinner } from '../components/common/index.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalAmount, loading, fetchCart, updateItem, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) fetchCart();
  }, []);

  if (!isAuthenticated()) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Sign in to view your cart"
        description="Your cart items are saved to your account so you can shop across devices."
        action={
          <Link to="/login" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            Sign in
          </Link>
        }
      />
    );
  }

  if (loading && items.length === 0) return <Spinner />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Start exploring our products."
        action={
          <Link to="/products" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold mb-2">Shopping cart</h1>

        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
          >
            <img
              src={item.image || 'https://placehold.co/100x100?text=No+Image'}
              alt={item.title}
              className="w-20 h-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
            />

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <h3 className="font-medium line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)} each</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => updateItem(item.productId, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.productId, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="font-semibold w-20 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-fit space-y-4">
        <h2 className="text-lg font-semibold">Order summary</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{totalAmount >= 50 ? 'Free' : '$5.00'}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>${(totalAmount + (totalAmount >= 50 ? 0 : 5)).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition"
        >
          Proceed to checkout <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
