import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <CompassIcon size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
      <h1 className="text-3xl font-semibold mb-2">404</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
        Go home
      </Link>
    </div>
  );
}
