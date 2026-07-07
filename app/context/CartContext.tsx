'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore, useState } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  colors?: string[];
  specs?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  removeFromCart: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'crossbar_cart';
const CART_CHANGE_EVENT = 'crossbar-cart-change';
const EMPTY_CART: CartItem[] = [];

let cartSnapshot: CartItem[] = EMPTY_CART;
let cartSeededFromStorage = false;

const readCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return EMPTY_CART;
  }

  const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) {
    return EMPTY_CART;
  }

  try {
    return JSON.parse(savedCart) as CartItem[];
  } catch (e) {
    console.error('Failed to parse cart from localStorage:', e);
    return [];
  }
};

const readCartSnapshot = () => cartSnapshot;

const readServerSnapshot = () => EMPTY_CART;

const writeCartToStorage = (cart: CartItem[]) => {
  cartSnapshot = cart;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
};

const subscribeToCartChanges = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener(CART_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CART_CHANGE_EVENT, callback);
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cart = useSyncExternalStore(subscribeToCartChanges, readCartSnapshot, readServerSnapshot);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (cartSeededFromStorage) {
      return;
    }

    cartSeededFromStorage = true;
    const savedCart = readCartFromStorage();

    if (savedCart !== cartSnapshot) {
      cartSnapshot = savedCart;
      window.dispatchEvent(new Event(CART_CHANGE_EVENT));
    }
  }, []);

  const addToCart = (product: Product, quantity: number = 1, color?: string) => {
    const prevCart = readCartSnapshot();
    const nextCart = (() => {
      const selectedColor = color || (product.colors && product.colors[0]) || '';
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [...prevCart, { product, quantity, selectedColor }];
    })();

    writeCartToStorage(nextCart);
  };

  const removeFromCart = (productId: string, color?: string) => {
    const nextCart = readCartSnapshot().filter(
      (item) => !(item.product.id === productId && item.selectedColor === color)
    );
    writeCartToStorage(nextCart);
  };

  const updateQuantity = (productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }

    const nextCart = readCartSnapshot().map((item) =>
      item.product.id === productId && item.selectedColor === color
        ? { ...item, quantity }
        : item
    );
    writeCartToStorage(nextCart);
  };

  const clearCart = () => {
    writeCartToStorage([]);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
