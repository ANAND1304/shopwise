import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../context/cartStore';
import { useAuthStore } from '../../context/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const image = product.images?.[0] || 'https://placehold.co/400x400?text=No+Image';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    addItem(product.id, 1);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <span className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Featured
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute top-2 right-2 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Out of stock
          </span>
        )}
        {typeof product.score === 'number' && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full">
            {Math.round(product.score * 100)}% match
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 gap-1">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">{product.category}</span>
        <h3 className="text-sm font-medium line-clamp-2 leading-snug">{product.title}</h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span>{product.rating?.toFixed(1) ?? '—'}</span>
          {product.reviewCount > 0 && <span>({product.reviewCount})</span>}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-semibold">${product.price?.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
