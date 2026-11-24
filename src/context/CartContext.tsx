'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/types';

const CART_STORAGE_KEY = 'pawpalace_cart_v1';
const FREE_SHIPPING_THRESHOLD = 500000;
const STANDARD_SHIPPING_FEE = 30000;

interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: CartItem, openCartDrawer?: boolean) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved) as CartItem[]);
      }
    } catch {
      // ignore storage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, isHydrated]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const addItem = useCallback((incoming: CartItem, openCartDrawer = true) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === incoming.productId &&
          i.variantId === incoming.variantId
      );

      if (existingIdx > -1) {
        const next = [...prev];
        const existing = next[existingIdx];
        next[existingIdx] = {
          ...existing,
          quantity: Math.min(
            existing.maxStock,
            existing.quantity + incoming.quantity
          ),
        };
        return next;
      }

      return [...prev, incoming];
    });

    if (openCartDrawer) {
      setIsDrawerOpen(true);
    }
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          )
        );
        return;
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            return {
              ...item,
              quantity: Math.min(item.maxStock, quantity),
            };
          }
          return item;
        })
      );
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const shippingFee = useMemo(() => {
    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return STANDARD_SHIPPING_FEE;
  }, [subtotal]);

  const totalAmount = subtotal + shippingFee;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isDrawerOpen,
      totalItems,
      subtotal,
      shippingFee,
      totalAmount,
      openDrawer,
      closeDrawer,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      isDrawerOpen,
      totalItems,
      subtotal,
      shippingFee,
      totalAmount,
      openDrawer,
      closeDrawer,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
