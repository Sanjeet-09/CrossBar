'use client';

import React, { useState } from 'react';
import { Product, useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : ''
  );
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    // Visual feedback could be added here
  };

  const handlePayment = () => {
    addToCart(product, quantity, selectedColor);
    onClose();
    router.push('/payment');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close details">
          &times;
        </button>

        <div className="modal-grid">
          <div className="modal-left">
            <div className="modal-image-mock">
              {product.image}
            </div>
          </div>

          <div className="modal-right">
            <div className="modal-category">{product.category}</div>
            <h2 className="modal-title">{product.name}</h2>
            
            <div className="modal-meta">
              <span className="modal-price">${product.price.toFixed(2)}</span>
              <div className="product-card-rating">
                ★ {product.rating} <span>({product.reviews} reviews)</span>
              </div>
            </div>

            <p className="modal-desc">{product.description}</p>

            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="modal-option-title">Select Color</h4>
                <div className="modal-colors">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-dot ${selectedColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <h4 className="modal-option-title">Quantity</h4>
              <div className="quantity-control" style={{ width: '120px' }}>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="qty-val" style={{ width: '64px' }}>
                  {quantity}
                </span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            {product.specs && product.specs.length > 0 && (
              <div className="modal-specs">
                <h4 className="modal-option-title">Specifications</h4>
                <ul className="specs-list">
                  {product.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              <button className="secondary-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="glow-btn" onClick={handlePayment}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
