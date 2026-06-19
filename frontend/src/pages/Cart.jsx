import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, placeOrder } from '../services/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentMethod: 'credit_card',
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      if (response.data && response.data.success) {
        setCartItems(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load cart', err);
      setError('Could not retrieve cart items.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0).toFixed(2);
  };

  const validatePayment = () => {
    const errs = {};
    if (!paymentForm.cardName.trim()) errs.cardName = 'Cardholder name is required';
    if (paymentForm.paymentMethod !== 'cod') {
      const rawCard = paymentForm.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(rawCard)) errs.cardNumber = 'Enter a valid 16-digit card number';
      if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiry)) errs.expiry = 'Enter expiry as MM/YY';
      if (!/^\d{3,4}$/.test(paymentForm.cvv)) errs.cvv = 'Enter a valid CVV (3–4 digits)';
    }
    return errs;
  };

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handlePaymentSubmit = async () => {
    const errs = validatePayment();
    if (Object.keys(errs).length > 0) {
      setPaymentErrors(errs);
      return;
    }
    setPaymentErrors({});
    setCheckoutLoading(true);
    setShowPaymentModal(false);
    setError('');
    try {
      const response = await placeOrder();
      if (response.data && response.data.success) {
        alert('✅ Payment successful! Your order has been placed. Thank you for shopping with us!');
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order placement failed. Please check inventory stock.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading your shopping cart...</span>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h1 className="page-title">Shopping Cart</h1>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: 'var(--danger)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '24px' }}>
            Your shopping cart is currently empty.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
          {/* Cart Items List */}
          <div style={{ flex: 2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartItems.map((item) => (
              <div key={item.id} className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '6px' }}>{item.productName}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Price: ${item.productPrice.toFixed(2)} | Quantity: {item.quantity}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ${(item.productPrice * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="glass-panel" style={{ flex: 1, minWidth: '300px', padding: '32px', position: 'sticky', top: '110px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '24px' }}>Order Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>${calculateTotal()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px', marginBottom: '32px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>${calculateTotal()}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: '700' }}
              onClick={() => setShowPaymentModal(true)}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Processing...' : '🔒 Proceed to Payment'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🔐 Secure checkout — your data is protected
            </p>
          </div>
        </div>
      )}

      {/* ─────── Payment Modal ─────── */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '500px',
            padding: '40px', position: 'relative',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            animation: 'fadeIn 0.3s ease'
          }}>
            {/* Close */}
            <button
              onClick={() => { setShowPaymentModal(false); setPaymentErrors({}); }}
              style={{
                position: 'absolute', top: '16px', right: '20px',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1
              }}
            >×</button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>💳 Payment Details</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
              Total to pay: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>${calculateTotal()}</strong>
            </p>

            {/* Payment Method Selector */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              {[
                { value: 'credit_card', label: '💳 Credit Card' },
                { value: 'debit_card', label: '🏦 Debit Card' },
                { value: 'cod', label: '💵 Cash on Delivery' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: paymentForm.paymentMethod === value
                      ? '2px solid var(--primary)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: paymentForm.paymentMethod === value
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    color: paymentForm.paymentMethod === value ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cardholder Name (always shown) */}
            <div className="form-group">
              <label className="form-label">
                {paymentForm.paymentMethod === 'cod' ? 'Full Name' : 'Cardholder Name'}
              </label>
              <input
                type="text"
                placeholder={paymentForm.paymentMethod === 'cod' ? 'Your full name' : 'Name on card'}
                value={paymentForm.cardName}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, cardName: e.target.value }))}
              />
              {paymentErrors.cardName && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{paymentErrors.cardName}</span>}
            </div>

            {/* Card fields — hidden for COD */}
            {paymentForm.paymentMethod !== 'cod' && (
              <>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                  />
                  {paymentErrors.cardNumber && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{paymentErrors.cardNumber}</span>}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentForm.expiry}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                    />
                    {paymentErrors.expiry && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{paymentErrors.expiry}</span>}
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      maxLength={4}
                    />
                    {paymentErrors.cvv && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{paymentErrors.cvv}</span>}
                  </div>
                </div>
              </>
            )}

            {paymentForm.paymentMethod === 'cod' && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '8px',
                padding: '14px',
                marginTop: '16px',
                fontSize: '0.9rem',
                color: 'var(--success)'
              }}>
                💵 You'll pay <strong>${calculateTotal()}</strong> in cash when your order is delivered.
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', marginTop: '28px', fontSize: '1rem', fontWeight: '700' }}
              onClick={handlePaymentSubmit}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Processing...' : `Confirm & Pay $${calculateTotal()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
