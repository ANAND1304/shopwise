import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, X, Package, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi, adminApi, categoryApi } from '../api';
import { Spinner, Pagination, EmptyState } from '../components/common/index.jsx';

const TABS = ['Products', 'Orders'];

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Products');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <ReindexButton />
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === t
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Products' ? <ProductsTab /> : <OrdersTab />}
    </div>
  );
}

function ReindexButton() {
  const [loading, setLoading] = useState(false);

  const handleReindex = async () => {
    setLoading(true);
    try {
      await adminApi.reindex();
      toast.success('Reindexing started — this runs in the background');
    } catch {
      toast.error('Could not trigger reindex');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReindex}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-60"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
      Re-index embeddings
    </button>
  );
}

// ---------------- Products Tab ----------------

function ProductsTab() {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | product object

  const load = () => {
    setLoading(true);
    productApi.getAll({ page, size: 10, sort: 'newest' })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await productApi.delete(id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Could not delete product');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : data.content.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to get started." />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.content.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://placehold.co/40x40?text=No+Image'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
                        />
                        <span className="line-clamp-1 font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{p.stock}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(p)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      {editing && (
        <ProductFormModal
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price ?? '',
    category: product?.category || '',
    brand: product?.brand || '',
    stock: product?.stock ?? 0,
    images: (product?.images || []).join('\n'),
    tags: (product?.tags || []).join(', '),
    featured: product?.featured || false,
  });

  useEffect(() => {
    categoryApi.getAll().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category.toLowerCase().trim(),
      brand: form.brand,
      stock: parseInt(form.stock, 10) || 0,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
    };

    try {
      if (isEdit) {
        await productApi.update(product.id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created — generating AI embedding in background');
      }
      onSaved();
    } catch (err) {
      const message = err.response?.data?.message
        || Object.values(err.response?.data || {})[0]
        || 'Could not save product';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="font-semibold text-lg">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={handleChange} required />
          <FormField label="Description" name="description" value={form.description} onChange={handleChange} required textarea rows={3} />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price ($)" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
            <FormField label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" name="category" value={form.category} onChange={handleChange} required list="categories" />
            <FormField label="Brand" name="brand" value={form.brand} onChange={handleChange} required />
          </div>
          <datalist id="categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>

          <FormField
            label="Image URLs (one per line)"
            name="images"
            value={form.images}
            onChange={handleChange}
            textarea
            rows={3}
            placeholder="https://example.com/image1.jpg"
          />

          <FormField
            label="Tags (comma-separated)"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="cotton, casual, breathable"
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="rounded" />
            Featured product
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, textarea, rows, ...props }) {
  const Component = textarea ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Component
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        {...props}
      />
    </div>
  );
}

// ---------------- Orders Tab ----------------

function OrdersTab() {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getAllOrders({ page, size: 10 })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      load();
    } catch {
      toast.error('Could not update status');
    }
  };

  if (loading) return <Spinner />;

  if (data.content.length === 0) {
    return <EmptyState icon={ShoppingBag} title="No orders yet" />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.content.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">${order.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}
