import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ChevronRight } from 'lucide-react';
import { orderApi } from '../api';
import { Spinner, EmptyState, Pagination } from '../components/common/index.jsx';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function OrdersPage() {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderApi.getAll({ page, size: 10 })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spinner />;

  if (data.content.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will show up here."
        action={
          <Link to="/products" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-2">My orders</h1>

      {data.content.map((order) => (
        <Link
          key={order.id}
          to={`/orders/${order.id}`}
          className="flex items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-brand-400 transition"
        >
          <div>
            <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {order.status}
            </span>
            <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </Link>
      ))}

      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(orderId)
      .then(({ data }) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Spinner />;
  if (!order) return <EmptyState title="Order not found" />;

  return <OrderDetailView order={order} />;
}

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(orderId)
      .then(({ data }) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto text-center py-8 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Order placed successfully!</h1>
        <p className="text-gray-500 mt-1">
          Thanks for your order. We've sent a confirmation to your email.
        </p>
      </div>

      {order && <OrderDetailView order={order} compact />}

      <div className="flex justify-center gap-3 pt-4">
        <Link to="/products" className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition">
          Continue shopping
        </Link>
        <Link to="/orders" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
          View my orders
        </Link>
      </div>
    </div>
  );
}

function OrderDetailView({ order, compact = false }) {
  return (
    <div className="space-y-6 text-left">
      {!compact && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 space-y-4">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex gap-3 text-sm">
              <img
                src={item.image || 'https://placehold.co/60x60?text=No+Image'}
                alt={item.title}
                className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
              />
              <div className="flex-1">
                <p className="font-medium line-clamp-1">{item.title}</p>
                <p className="text-gray-500">Qty {item.quantity} × ${item.price.toFixed(2)}</p>
              </div>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6">
          <h2 className="font-medium mb-2">Shipping address</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && <>, {order.shippingAddress.addressLine2}</>}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}
            {order.shippingAddress.phone && <><br />{order.shippingAddress.phone}</>}
          </p>
        </div>
      )}
    </div>
  );
}
