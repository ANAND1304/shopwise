import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useCartStore } from '../context/cartStore';
import toast from 'react-hot-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Welcome back!');
      await fetchCart();
      navigate(location.state?.from || '/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AuthCard title="Sign in to ShopWise" subtitle="Welcome back! Enter your details below.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField icon={Mail} type="email" label="Email" value={email} onChange={setEmail} required autoComplete="email" />
        <AuthField icon={Lock} type="password" label="Password" value={password} onChange={setPassword} required autoComplete="current-password" />

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 font-medium hover:underline">Create one</Link>
      </p>
    </AuthCard>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(name, email, password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Account created!');
      await fetchCart();
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Join ShopWise for AI-powered shopping.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField icon={UserIcon} type="text" label="Full name" value={name} onChange={setName} required autoComplete="name" />
        <AuthField icon={Mail} type="email" label="Email" value={email} onChange={setEmail} required autoComplete="email" />
        <AuthField icon={Lock} type="password" label="Password" value={password} onChange={setPassword} required autoComplete="new-password" hint="At least 8 characters" />

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Create account
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
      </p>
    </AuthCard>
  );
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
          SW
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}

function AuthField({ icon: Icon, label, value, onChange, hint, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          {...props}
        />
        <Icon size={16} className="absolute left-3 top-3 text-gray-400" />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
