'use client';

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { Product, useCart } from './context/CartContext';
import { useRouter } from 'next/navigation';

const PRODUCTS: Product[] = [
  {
    id: 'crossbar-sound-x',
    name: 'CrossBar Sound-X Headphones',
    price: 349.00,
    category: 'Audio',
    description: 'Immersive hybrid active noise-cancelling headphones featuring bespoke dynamic drivers, 40-hour battery life, and space-grade materials for ultimate sonic luxury.',
    image: '🎧',
    rating: 4.9,
    reviews: 124,
    colors: ['#1e1b4b', '#e2e8f0', '#451a03'],
    specs: ['Active Noise Cancelling', 'Hi-Res Audio Certified', '40h Battery Life', 'Bluetooth 5.3']
  },
  {
    id: 'keeb-pro-85',
    name: 'Keeb-Pro 85 Keyboard',
    price: 189.00,
    category: 'Peripherals',
    description: 'Bespoke mechanical keyboard with hot-swappable tactile switches, solid milled aluminum casing, dynamic RGB underglow, and fine-tuned dampening layers.',
    image: '⌨️',
    rating: 4.8,
    reviews: 86,
    colors: ['#1e293b', '#f8fafc', '#064e3b'],
    specs: ['Gasket Mounted', 'Hot-Swappable Switches', 'CNC Aluminum Case', 'Triple-Mode Connection']
  },
  {
    id: 'chronos-active',
    name: 'Chronos Smartwatch',
    price: 299.00,
    category: 'Wearables',
    description: 'Precision-engineered titanium smartwatch featuring an always-on AMOLED sapphire display, advanced biometric tracking, and modular design.',
    image: '⌚',
    rating: 4.7,
    reviews: 95,
    colors: ['#0f172a', '#cbd5e1', '#7c2d12'],
    specs: ['Titanium Grade-5 Casing', 'Sapphire Glass Screen', 'Biometric Sensors', '50m Water Resistance']
  },
  {
    id: 'opal-ambient',
    name: 'Opal Ambient Lamp',
    price: 129.00,
    category: 'Lifestyle',
    description: 'Sleek smart lamp offering customized circadian lighting spectrums, integrated fast wireless charging base, and touch-sensitive intensity slide.',
    image: '💡',
    rating: 4.9,
    reviews: 43,
    colors: ['#f8fafc', '#0f172a', '#b45309'],
    specs: ['Circadian Light Cycle', '15W Wireless Charger', 'Touch Control Strip', 'Smart App Integration']
  }
];

export default function Home() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    router.push('/payment');
  };

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <span className="hero-tag">CrossBar Design Lab</span>
            <h1 className="hero-title">
              Designed to Inspire.<br />
              <span>Curated to Perfection.</span>
            </h1>
            <p className="hero-desc">
              Upgrade your environment with our collection of luxury tech accessories. 
              Minimal aesthetics meet high performance engineering.
            </p>
            <button 
              className="glow-btn"
              onClick={() => {
                const element = document.getElementById('catalog');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Collection
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </button>
          </div>
        </section>

        {/* Product Catalog Section */}
        <section id="catalog" className="products-section container">
          <div className="section-header">
            <div>
              <h2 className="section-title">The Collection</h2>
              <p className="section-subtitle">Handpicked luxury items for your workspace and home</p>
            </div>
          </div>

          <div className="product-grid">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleCardClick(product)}
              >
                <span className="product-card-category">{product.category}</span>
                <div className="product-image-container">
                  <div className="product-image-mock">
                    {product.image}
                  </div>
                </div>

                <div className="product-card-info">
                  <div className="product-card-rating">
                    ★ {product.rating} <span>({product.reviews})</span>
                  </div>
                  <h3 className="product-card-title">{product.name}</h3>
                  <p className="product-card-desc">{product.description}</p>
                  
                  <div className="product-card-footer">
                    <span className="product-card-price">${product.price.toFixed(2)}</span>
                  </div>

                  <div className="product-card-actions">
                    <button
                      className="secondary-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="glow-btn"
                      onClick={(e) => handleBuyNow(e, product)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} CrossBar Inc. Crafted for modern aesthetics.</p>
        </div>
      </footer>
    </>
  );
}
