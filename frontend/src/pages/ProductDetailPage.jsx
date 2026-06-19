import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingCart, ChevronLeft, Minus, Plus, Package, Truck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../api';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import { ProductDetailSkeleton } from '../components/product/ProductSkeleton';
import { EmptyState } from '../components/common/index.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    productApi.getBySlug(slug)
      .then(({ data }) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been removed or is no longer available."
        action={
          <Link to="/products" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            Browse products
          </Link>
        }
      />
    );
  }

  const images = product.images?.length ? product.images : ['https://placehold.co/600x600?text=No+Image'];

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    addItem(product.id, quantity);
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src={images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === activeImage ? 'border-brand-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-brand-600 font-medium">{product.category}</span>
            <h1 className="text-2xl sm:text-3xl font-semibold mt-1">{product.title}</h1>
            <p className="text-sm text-gray-500 mt-1">by {product.brand}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating?.toFixed(1) ?? '—'}</span>
            </div>
            {product.reviewCount > 0 && (
              <span className="text-gray-500">({product.reviewCount} reviews)</span>
            )}
          </div>

          <div className="text-3xl font-semibold">${product.price?.toFixed(2)}</div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className={product.stock > 0 ? 'text-emerald-500' : 'text-red-500'} />
            {product.stock > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                In stock {product.stock <= 5 && `— only ${product.stock} left`}
              </span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              Add to cart
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Truck size={16} /> Free shipping over $50
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
