'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            Shopping Cart
            <span className="badge" style={{ padding: '4px 10px', fontSize: '12px' }}>
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </h2>
          <button className="close-drawer" onClick={() => setIsCartOpen(false)}>
            &times;
          </button>
        </div>

        <div className="cart-drawer-items">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <span className="empty-cart-icon">🛒</span>
              <p style={{ fontSize: '16px', fontWeight: 500 }}>Your cart is empty</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Add premium items to get started on your curated setup.
              </p>
              <button
                className="secondary-btn"
                style={{ marginTop: '12px', fontSize: '13px' }}
                onClick={() => setIsCartOpen(false)}
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedColor}`} className="cart-drawer-item">
                <div className="cart-item-image">
                  {item.product.image}
                </div>
                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.product.name}</h3>
                  {item.selectedColor && (
                    <div className="cart-item-color">
                      <span
                        className="cart-item-color-dot"
                        style={{ backgroundColor: item.selectedColor }}
                      ></span>
                      {item.selectedColor}
                    </div>
                  )}
                  <div className="cart-item-price-row">
                    <span className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)
                        }
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                  aria-label="Remove item"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Subtotal</span>
              <span className="cart-total-value">${cartTotal.toFixed(2)}</span>
            </div>
            <Link
              href="/payment"
              className="glow-btn"
              onClick={() => setIsCartOpen(false)}
            >
              Checkout
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
