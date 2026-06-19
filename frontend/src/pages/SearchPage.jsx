import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Search as SearchIcon } from 'lucide-react';
import { aiSearchApi, productApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton';
import { EmptyState } from '../components/common/index.jsx';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setInputValue(query);
    if (!query) {
      setResults([]);
      setSearchType(null);
      return;
    }

    setLoading(true);
    setError(null);

    aiSearchApi.semanticSearch(query, 16)
      .then(({ data }) => {
        setResults(data.results || []);
        setSearchType(data.searchType);
      })
      .catch(async () => {
        // AI service unreachable — fall back to Java backend keyword search
        try {
          const { data } = await productApi.keywordSearch(query, { size: 16 });
          setResults(data.content || []);
          setSearchType('keyword');
        } catch {
          setError('Search is currently unavailable. Please try again.');
          setResults([]);
        }
      })
      .finally(() => setLoading(false));
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search with AI... e.g. 'something warm for winter hikes'"
            className="w-full pl-10 pr-24 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <SearchIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-lg font-medium">
            Results for <span className="text-brand-600">&ldquo;{query}&rdquo;</span>
          </h1>
          {searchType && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {searchType === 'vector' ? (
                <><Sparkles size={12} /> Semantic AI search</>
              ) : (
                <>Keyword search</>
              )}
            </span>
          )}
        </div>
      )}

      {!query ? (
        <EmptyState
          icon={Sparkles}
          title="Search with natural language"
          description="Try descriptive phrases like 'cozy sweater for cold mornings' or 'gift for a coffee lover' — our AI understands meaning, not just keywords."
        />
      ) : loading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : results.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="Try rephrasing your search or browsing categories instead."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
