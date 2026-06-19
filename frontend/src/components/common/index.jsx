import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 0 && <span className="px-2 text-gray-400">...</span>}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
            p === page
              ? 'bg-brand-600 text-white'
              : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}

      <button
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="animate-spin rounded-full border-2 border-gray-300 border-t-brand-600 dark:border-gray-700 dark:border-t-brand-500"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && <Icon size={48} className="text-gray-300 dark:text-gray-700 mb-4" />}
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
