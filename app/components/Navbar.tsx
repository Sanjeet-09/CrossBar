'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="logo">
          CROSSBAR
          <span className="logo-dot"></span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link href="/" className="nav-link active">
              Products
            </Link>
          </li>
          <li>
            <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
              Curated
            </a>
          </li>
          <li>
            <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
              Story
            </a>
          </li>
        </ul>

        <div className="nav-actions">
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="cart-button"
            aria-label="Toggle Shopping Cart"
            id="navbar-cart-btn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};
