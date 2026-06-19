import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute } from './components/common/index.jsx';
import { useAuthStore } from './context/authStore';
import { useCartStore } from './context/cartStore';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { OrdersPage, OrderDetailPage, OrderSuccessPage } from './pages/OrderPages';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="/order-success/:orderId" element={
            <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>
          } />
          <Route path="/orders/:orderId" element={
            <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
