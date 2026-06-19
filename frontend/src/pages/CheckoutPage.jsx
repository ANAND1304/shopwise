import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../context/cartStore';
import { orderApi } from '../api';
import { EmptyState } from '../components/common/index.jsx';
import { ShoppingBag } from 'lucide-react';

const initialAddress = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount } = useCartStore();
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add some products before checking out."
        action={
          <Link to="/products" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            Browse products
          </Link>
        }
      />
    );
  }

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const { data } = await orderApi.create({ items: orderItems, shippingAddress: address });
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data.id}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not place order';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const shipping = totalAmount >= 50 ? 0 : 5;
  const total = totalAmount + shipping;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-medium">Shipping address</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" name="fullName" value={address.fullName} onChange={handleChange} required />
            <Field label="Phone" name="phone" value={address.phone} onChange={handleChange} />
            <Field label="Address line 1" name="addressLine1" value={address.addressLine1} onChange={handleChange} required className="sm:col-span-2" />
            <Field label="Address line 2 (optional)" name="addressLine2" value={address.addressLine2} onChange={handleChange} className="sm:col-span-2" />
            <Field label="City" name="city" value={address.city} onChange={handleChange} required />
            <Field label="State / Province" name="state" value={address.state} onChange={handleChange} required />
            <Field label="Postal code" name="postalCode" value={address.postalCode} onChange={handleChange} required />
            <Field label="Country" name="country" value={address.country} onChange={handleChange} required />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-2">
          <h2 className="font-medium mb-2">Payment</h2>
          <p className="text-sm text-gray-500">
            This is a demo checkout. Orders are marked as paid automatically — no real payment is processed.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Place order — ${total.toFixed(2)}
        </button>
      </form>

      {/* Order summary */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-fit space-y-4">
        <h2 className="text-lg font-semibold">Order summary</h2>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 text-sm">
              <img
                src={item.image || 'https://placehold.co/60x60?text=No+Image'}
                alt={item.title}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
              />
              <div className="flex-1">
                <p className="line-clamp-1">{item.title}</p>
                <p className="text-gray-500">Qty {item.quantity}</p>
              </div>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  );
}
