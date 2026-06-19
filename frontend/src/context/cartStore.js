import { create } from 'zustand';
import { cartApi } from '../api';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  items: [],
  totalAmount: 0,
  loading: false,

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await cartApi.get();
      set({ items: data.items || [], totalAmount: data.totalAmount || 0, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      const { data } = await cartApi.addItem({ productId, quantity });
      set({ items: data.items || [], totalAmount: data.totalAmount || 0 });
      toast.success('Added to cart');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Could not add to cart';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const { data } = await cartApi.updateItem(productId, quantity);
      set({ items: data.items || [], totalAmount: data.totalAmount || 0 });
    } catch {
      toast.error('Could not update cart');
    }
  },

  removeItem: async (productId) => {
    try {
      const { data } = await cartApi.removeItem(productId);
      set({ items: data.items || [], totalAmount: data.totalAmount || 0 });
      toast.success('Removed from cart');
    } catch {
      toast.error('Could not remove item');
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ items: [], totalAmount: 0 });
    } catch {
      // non-fatal
    }
  },

  reset: () => set({ items: [], totalAmount: 0 }),
}));
