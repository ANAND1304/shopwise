import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Sun, Moon, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../context/authStore';
import { useCartStore } from '../../context/cartStore';
import { useThemeStore } from '../../context/themeStore';

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const { theme, toggleTheme } = useThemeStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              SW
            </div>
            <span className="text-lg font-semibold hidden sm:block">ShopWise</span>
          </Link>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products with AI... e.g. 'cozy winter sweater'"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated() ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="Admin dashboard"
                  >
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title="My orders"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title="Log out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden pb-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </form>

            {isAuthenticated() ? (
              <div className="flex flex-col gap-2">
                {isAdmin() && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                    Admin dashboard
                  </Link>
                )}
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  My orders
                </Link>
                <button onClick={handleLogout} className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg"
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
