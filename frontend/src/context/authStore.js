import { create } from 'zustand';
import { authApi } from '../api';

const loadUser = () => {
  try {
    const raw = localStorage.getItem('shopwise_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: loadUser(),
  token: localStorage.getItem('shopwise_token') || null,
  loading: false,
  error: null,

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.roles?.includes('ADMIN') ?? false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      persist(data);
      set({ user: toUser(data), token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.register({ name, email, password });
      persist(data);
      set({ user: toUser(data), token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message
        || Object.values(err.response?.data || {})[0]
        || 'Registration failed';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('shopwise_token');
    localStorage.removeItem('shopwise_user');
    set({ user: null, token: null });
  },
}));

function toUser(data) {
  return { id: data.id, name: data.name, email: data.email, roles: data.roles };
}

function persist(data) {
  localStorage.setItem('shopwise_token', data.token);
  localStorage.setItem('shopwise_user', JSON.stringify(toUser(data)));
}
