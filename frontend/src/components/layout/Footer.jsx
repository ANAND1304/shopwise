import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                SW
              </div>
              <span className="text-lg font-semibold">ShopWise</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered shopping with semantic search that understands what you mean.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/products" className="hover:text-brand-600">All products</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-brand-600">Fashion</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-brand-600">Electronics</Link></li>
              <li><Link to="/products?category=fitness" className="hover:text-brand-600">Fitness</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm">Account</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/login" className="hover:text-brand-600">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-brand-600">Create account</Link></li>
              <li><Link to="/orders" className="hover:text-brand-600">Order history</Link></li>
              <li><Link to="/cart" className="hover:text-brand-600">Cart</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} ShopWise. Built with React, Spring Boot &amp; MongoDB Atlas Vector Search.
        </div>
      </div>
    </footer>
  );
}
