import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import api from '../api';

const FALLBACK = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&q=80';

export default function Cart() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { setCartCount } = useCart();
  const toast = useToast();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  useEffect(() => { if (isLoggedIn) loadCart(); else setLoading(false); }, [isLoggedIn]);

  async function loadCart() {
    setLoading(true);
    const res = await api.get('cart');
    if (res.success) { setCartData(res.data); setCartCount(res.data?.items?.length || 0); }
    setLoading(false);
  }

  async function updateQty(cartId, newQty, maxStock) {
    if (newQty < 1) { removeItem(cartId); return; }
    if (newQty > maxStock) { toast('❌ Only ' + maxStock + ' units available in stock.'); return; }
    await api.put('cart', { quantity: newQty }, { id: cartId });
    loadCart();
  }

  async function removeItem(cartId) {
    if (!confirm('Remove this item from cart?')) return;
    await api.delete('cart', { id: cartId });
    loadCart();
  }

  function applyCoupon() {
    if (!coupon.trim()) { setCouponMsg({ t: 'error', m: 'Please enter a coupon code.' }); return; }
    localStorage.setItem('da_coupon', coupon.toUpperCase());
    setCouponMsg({ t: 'ok', m: `✅ Coupon "${coupon.toUpperCase()}" will be applied at checkout.` });
  }

  if (!isLoggedIn) return (
    <div className="cart-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="login-prompt-cart">
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
        <h3>Login to view your cart</h3>
        <p>Please login to add products and place orders.</p>
        <Link to="/login">🔐 Login / Sign Up</Link>
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#888', fontSize: 16 }}>⏳ Loading your cart...</div>;

  const items = cartData?.items || [];
  const isEmpty = items.length === 0;

  return (
    <>
      <div style={{ background: '#f5f5f5', padding: '12px 40px', fontSize: 13, color: '#666' }}>
        <Link to="/" style={{ color: '#2e7d32' }}>Home</Link> › My Cart
      </div>

      <div className="cart-page">
        <div>
          {isEmpty ? (
            <div className="empty-cart">
              <div className="ec-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet. Start shopping!</p>
              <Link to="/categories">🌾 Browse Products</Link>
            </div>
          ) : (
            <>
              <div className="cart-header">
                <h2>🛒 My Cart <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({items.length} item{items.length > 1 ? 's' : ''})</span></h2>
                <Link to="/categories" style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>+ Continue Shopping</Link>
              </div>
              {cartData?.delivery === 0
                ? <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>🎉 Free delivery applied on this order!</div>
                : <div style={{ background: '#fff3e0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#e65100', fontWeight: 600 }}>🚚 Add ₹{(499 - (cartData?.subtotal || 0)).toFixed(0)} more for FREE delivery!</div>
              }
              {items.map(item => {
                const disc = item.mrp > item.selling_price ? Math.round((item.mrp - item.selling_price) / item.mrp * 100) : 0;
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-img"><img src={item.image || FALLBACK} alt={item.name} onError={e => e.target.src = FALLBACK} /></div>
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <div className="brand">{item.vendor_name || ''}</div>
                      <div>
                        <span className="item-price">₹{Number(item.selling_price).toLocaleString('en-IN')}</span>
                        {disc > 0 && <><span className="item-old">₹{Number(item.mrp).toLocaleString('en-IN')}</span><span className="item-disc">{disc}% OFF</span></>}
                      </div>
                      <div style={{ fontSize: 12, color: '#2e7d32', marginTop: 4 }}>{item.stock_qty > 0 ? '✅ In Stock' : '❌ Out of Stock'}</div>
                      <div className="item-qty">
                        <button className="iq-btn" onClick={() => updateQty(item.id, item.quantity - 1, item.stock_qty)}>−</button>
                        <input className="iq-val" value={item.quantity} readOnly />
                        <button className="iq-btn" onClick={() => updateQty(item.id, item.quantity + 1, item.stock_qty)}>+</button>
                      </div>
                    </div>
                    <div className="item-actions">
                      <span className="item-total">₹{Number(item.selling_price * item.quantity).toLocaleString('en-IN')}</span>
                      <button className="item-del" onClick={() => removeItem(item.id)}>🗑️ Remove</button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* SUMMARY */}
        <div className="cart-summary">
          <h3>📋 Order Summary</h3>
          <div className="summary-row"><span>Price ({items.length} item{items.length !== 1 ? 's' : ''})</span><span>₹{Number(cartData?.mrp_total || 0).toLocaleString('en-IN')}</span></div>
          <div className="summary-row save"><span>Discount</span><span>− ₹{Number(cartData?.savings || 0).toLocaleString('en-IN')}</span></div>
          <div className="summary-row"><span>Delivery Charges</span><span>{cartData?.delivery === 0 ? '🎉 FREE' : `₹${cartData?.delivery || 0}`}</span></div>
          <div className="summary-row total"><span>Total Amount</span><span>₹{Number(cartData?.total || 0).toLocaleString('en-IN')}</span></div>
          {(cartData?.savings || 0) > 0 && <div style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600, marginTop: 8 }}>🎉 You save ₹{Number(cartData.savings).toLocaleString('en-IN')} on this order!</div>}

          <div className="coupon-box">
            <label>🏷️ Apply Coupon</label>
            <div className="coupon-input">
              <input type="text" placeholder="Enter coupon code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} />
              <button onClick={applyCoupon}>Apply</button>
            </div>
            {couponMsg && <div style={{ fontSize: 12, marginTop: 6, color: couponMsg.t === 'ok' ? '#2e7d32' : '#c62828' }}>{couponMsg.m}</div>}
          </div>

          <button className="checkout-btn" disabled={isEmpty} onClick={() => navigate('/checkout')}>🔒 Proceed to Checkout</button>
          <div className="safe-badge">🔒 100% Secure Checkout • Razorpay Protected</div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8f5e9' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>ACCEPTED PAYMENTS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['💳 Cards', '📱 UPI', '🏦 Net Banking', '💰 COD'].map(m => <span key={m} style={{ background: '#f5f5f5', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{m}</span>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
