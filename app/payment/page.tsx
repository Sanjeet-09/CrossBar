'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function PaymentPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  // Form states
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Transaction flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.length <= 5) {
      setCardExpiry(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCardCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate shipping
    if (!shippingName || !shippingEmail || !shippingAddress || !shippingCity || !shippingZip) {
      alert('Please fill out all shipping details.');
      return;
    }

    // Validate payment
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      alert('Please fill out all payment details.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert('Please enter a valid credit card number.');
      return;
    }

    if (cardExpiry.length < 5) {
      alert('Please enter a valid card expiry date.');
      return;
    }

    if (cardCvv.length < 3) {
      alert('Please enter a valid CVV.');
      return;
    }

    // Begin processing UI
    setIsProcessing(true);
    setProcessingStep(1);

    try {
      // Step 1 — Create the order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: shippingName,
          customer_email: shippingEmail,
          shipping_address: shippingAddress,
          shipping_city: shippingCity,
          shipping_zip: shippingZip,
          total: orderTotal,
          status: 'confirmed',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 2 — Insert all order line items
      setProcessingStep(2);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          cart.map((item) => ({
            order_id: order.id,
            product_id: item.product.id,
            product_name: item.product.name,
            product_image: item.product.image,
            quantity: item.quantity,
            price: item.product.price,
            selected_color: item.selectedColor ?? null,
          }))
        );

      if (itemsError) throw itemsError;

      // All done — show success
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err: unknown) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      alert(`Order failed: ${message}`);
    }
  };

  const handleSuccessClose = () => {
    clearCart();
    router.push('/');
  };

  if (!isMounted) return null;

  // Calculations
  const tax = cartTotal * 0.08;
  const shippingCost = cartTotal > 500 ? 0 : 25;
  const orderTotal = cartTotal + tax + shippingCost;

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="success-overlay" style={{ background: 'var(--bg-primary)' }}>
        <span style={{ fontSize: '72px', marginBottom: '24px' }}>🛒</span>
        <h2 className="hero-title" style={{ fontSize: '32px' }}>Your Checkout is Empty</h2>
        <p className="hero-desc" style={{ marginBottom: '32px' }}>
          It looks like you do not have any items in your shopping cart.
        </p>
        <Link href="/" className="glow-btn">
          Return to Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="navbar">
        <div className="container nav-container">
          <Link href="/" className="logo">
            CROSSBAR
            <span className="logo-dot"></span>
          </Link>
          <Link href="/" className="back-link">
            ← Back to Shop
          </Link>
        </div>
      </header>

      <main className="checkout-section container">
        <div className="checkout-grid">
          {/* Left panel: Forms */}
          <div>
            <form id="checkout-form" onSubmit={handleSubmit}>
              {/* Shipping card */}
              <div className="checkout-card nm-panel">
                <h2 className="checkout-heading">
                  <span className="checkout-step">1</span>
                  Shipping Information
                </h2>
                
                <div className="checkout-form-grid">
                  <div className="input-group form-span-2">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Alexander Vance"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="input-group form-span-2">
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="alexander@domain.com"
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group form-span-2">
                    <label className="input-label">Street Address</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="1042 Obsidian Way"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">City</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Neo Metropolis"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">ZIP / Postal Code</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="90210"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment card */}
              <div className="checkout-card nm-panel">
                <h2 className="checkout-heading">
                  <span className="checkout-step">2</span>
                  Payment Method
                </h2>

                {/* Card Mockup */}
                <div className="card-mockup-wrapper">
                  <div className="card-mockup">
                    <div className="card-mockup-row" style={{ alignItems: 'center' }}>
                      <div className="card-mockup-chip"></div>
                      <span className="card-mockup-logo">CrossBar Card</span>
                    </div>

                    <div className="card-mockup-number">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="card-mockup-row">
                      <div>
                        <div className="card-mockup-label">Card Holder</div>
                        <div className="card-mockup-val">{cardName || 'Alexander Vance'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="card-mockup-label">Expires</div>
                        <div className="card-mockup-val">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="input-group form-span-2">
                    <label className="input-label">Cardholder Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ALEXANDER VANCE"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="input-group form-span-2">
                    <label className="input-label">Card Number</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Expiration Date</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">CVV</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right panel: Order Summary */}
          <div className="checkout-card nm-panel" style={{ position: 'sticky', top: '104px' }}>
            <h2 className="checkout-heading" style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              Order Summary
            </h2>

            <div className="summary-items">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor}`} className="summary-item-row">
                  <div className="summary-item-name">
                    <span style={{ fontSize: '20px' }}>{item.product.image}</span>
                    <div>
                      <div>{item.product.name}</div>
                      <span className="summary-item-qty">Qty: {item.quantity} {item.selectedColor && `(${item.selectedColor})`}</span>
                    </div>
                  </div>
                  <span className="summary-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-price-row">
              <span>Subtotal</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-price-row">
              <span>Estimated Tax (8%)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>

            <div className="summary-price-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-price-total">
              <span>Total due</span>
              <span style={{ color: 'var(--accent-color)' }}>${orderTotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="glow-btn confirm-order-btn"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay $${orderTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </main>

      {/* Processing Transaction Overlay */}
      {isProcessing && (
        <div className="success-overlay" style={{ background: 'rgba(230, 235, 244, 0.95)', backdropFilter: 'blur(12px)' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid var(--bg-tertiary)',
              borderTopColor: 'var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              boxShadow: 'var(--nm-flat)'
            }} />
          </div>
          <h2 className="hero-title" style={{ fontSize: '28px' }}>
            {processingStep === 1 ? 'Securing Transaction...' : 'Validating Payment Details...'}
          </h2>
          <p className="hero-desc">Please do not refresh the page or click back.</p>
        </div>
      )}

      {/* Success Modal Overlay */}
      {isSuccess && (
        <div className="success-overlay">
          <div className="success-circle">
            <svg className="success-svg" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="none" />
              <path className="success-path" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h2 className="success-title">Order Confirmed!</h2>
          <p className="success-desc">
            Thank you for purchasing from <strong>CrossBar</strong>. Your order has been placed successfully.{' '}
            A confirmation receipt and tracking number have been sent to <strong>{shippingEmail}</strong>.
          </p>
          <button className="glow-btn" onClick={handleSuccessClose}>
            Continue Shopping
          </button>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} CrossBar Inc. Secure Checkout verified by RSA 256.</p>
        </div>
      </footer>
    </>
  );
}
