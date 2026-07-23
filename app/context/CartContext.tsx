'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000';
const CART_SESSION_KEY = 'crossbar_cart_session_id';

const getSessionId = () => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const existingSessionId = window.localStorage.getItem(CART_SESSION_KEY);
  if (existingSessionId) {
    return existingSessionId;
  }

  const generatedSessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(CART_SESSION_KEY, generatedSessionId);
  return generatedSessionId;
};

const persistCart = async (cart: CartItem[]) => {
  const sessionId = getSessionId();

  try {
    await fetch(`${API_GATEWAY_URL}/api/cart/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart }),
    });
  } catch (error) {
    console.error('Failed to sync cart:', error);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      const sessionId = getSessionId();

      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/cart/${sessionId}`);
        if (!response.ok) {
          throw new Error(`Failed to load cart: ${response.status}`);
        }

        const data = (await response.json()) as { cart?: CartItem[] };
        if (Array.isArray(data.cart)) {
          setCart((currentCart) => (currentCart.length > 0 ? currentCart : data.cart as CartItem[]));
        }
      } catch (error) {
        console.warn('Falling back to empty cart because the cart service could not be loaded:', error);
      }
    };

    void loadCart();
  }, []);

  const addToCart = (product: Product, quantity: number = 1, color?: string) => {
    setCart((prevCart) => {
      const selectedColor = color || (product.colors && product.colors[0]) || '';
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor
      );

      const nextCart = [...prevCart];
      if (existingItemIndex > -1) {
        nextCart[existingItemIndex] = {
          ...nextCart[existingItemIndex],
          quantity: nextCart[existingItemIndex].quantity + quantity,
        };
      } else {
        nextCart.push({ product, quantity, selectedColor });
      }

      void persistCart(nextCart);
      return nextCart;
    });
  };

  const removeFromCart = (productId: string, color?: string) => {
    setCart((prevCart) => {
      const nextCart = prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedColor === color)
      );

      void persistCart(nextCart);
      return nextCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }

    setCart((prevCart) => {
      const nextCart = prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color
          ? { ...item, quantity }
          : item
      );

      void persistCart(nextCart);
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart(() => {
      void persistCart([]);
      return [];
    });
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
