import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { productApi, categoryApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton';
import CategoryFilter from '../components/product/CategoryFilter';
import { Pagination, EmptyState } from '../components/common/index.jsx';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi.getAll({ page, size: 12, category: category || undefined, sort })
      .then(({ data }) => setData(data))
      .catch(() => setData({ content: [], totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [category, sort, page]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v); else next.delete(k);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {category ? <span className="capitalize">{category}</span> : 'All products'}
        </h1>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-400" />
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <CategoryFilter
        categories={categories}
        selected={category}
        onSelect={(cat) => updateParams({ category: cat })}
      />

      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : data.content.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try a different category or check back later."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.content.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(p) => updateParams({ page: p || undefined })}
          />
        </>
      )}
    </div>
  );
}
