'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('crossbar_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    setIsMounted(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('crossbar_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product: Product, quantity: number = 1, color?: string) => {
    setCart((prevCart) => {
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
    });
  };

  const removeFromCart = (productId: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedColor === color))
    );
  };

  const updateQuantity = (productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
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
