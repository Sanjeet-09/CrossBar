'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { Product, useCart } from './context/CartContext';
import productsData from '../shared/products.json';
import { useRouter } from 'next/navigation';

const PRODUCTS: Product[] = productsData as Product[];

export default function Home() {
  const { addToCart } = useCart();
  const router = useRouter();
  const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000';
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await fetch(`${gatewayUrl}/api/products`);
        if (!response.ok) {
          throw new Error(`Failed to load products: ${response.status}`);
        }

        const data = (await response.json()) as { products?: Product[] };
        if (!cancelled && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (error) {
        console.warn('Using local product fallback:', error);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [gatewayUrl]);

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, product: Product) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick(product);
    }
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
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleCardClick(product)}
                onKeyDown={(event) => handleCardKeyDown(event, product)}
                role="button"
                tabIndex={0}
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
