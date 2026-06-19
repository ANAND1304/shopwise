import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Search } from 'lucide-react';
import { productApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton';

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    productApi.getFeatured()
      .then(({ data }) => setFeatured(data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white px-6 sm:px-12 py-14 sm:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium mb-4">
            <Sparkles size={14} />
            AI-powered semantic search
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight mb-4">
            Find exactly what you're picturing.
          </h1>
          <p className="text-brand-100 text-base sm:text-lg mb-8">
            Describe what you want in plain language — "a cozy sweater for cold mornings"
            or "shoes for trail running" — and our AI finds the best match.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: 'comfortable shoes for hiking'"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-white text-brand-700 font-medium rounded-lg hover:bg-brand-50 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured products</h2>
          <Link to="/products" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : featured.length === 0 ? (
          <p className="text-gray-500 text-sm">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Category highlights */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { name: 'Fashion', cat: 'fashion', color: 'from-pink-500 to-rose-500' },
          { name: 'Electronics', cat: 'electronics', color: 'from-blue-500 to-indigo-600' },
          { name: 'Footwear', cat: 'footwear', color: 'from-amber-500 to-orange-600' },
          { name: 'Home decor', cat: 'home decor', color: 'from-emerald-500 to-teal-600' },
          { name: 'Fitness', cat: 'fitness', color: 'from-purple-500 to-violet-600' },
          { name: 'Accessories', cat: 'accessories', color: 'from-cyan-500 to-sky-600' },
        ].map((c) => (
          <Link
            key={c.cat}
            to={`/products?category=${encodeURIComponent(c.cat)}`}
            className={`relative rounded-xl bg-gradient-to-br ${c.color} text-white p-6 h-28 flex items-end font-semibold text-lg hover:opacity-90 transition`}
          >
            {c.name}
          </Link>
        ))}
      </section>
    </div>
  );
}
