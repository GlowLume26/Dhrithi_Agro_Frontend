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
  const [removing, setRemoving] = useState(null);

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
    setRemoving(cartId);
    await api.delete('cart', { id: cartId });
    await loadCart();
    setRemoving(null);
  }

  function applyCoupon() {
    if (!coupon.trim()) { setCouponMsg({ t: 'error', m: 'Please enter a coupon code.' }); return; }
    localStorage.setItem('da_coupon', coupon.toUpperCase());
    setCouponMsg({ t: 'ok', m: `✅ Coupon "${coupon.toUpperCase()}" applied at checkout.` });
  }

  if (!isLoggedIn) return (
    <div className="cart-empty-wrap">
      <div className="cart-empty-box">
        <div className="cart-empty-icon">🛒</div>
        <h3>Login to view your cart</h3>
        <p>Please login to add products and place orders.</p>
        <Link to="/login" className="cart-empty-btn">🔐 Login / Sign Up</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="cart-loading">
      <div className="cart-loading-spinner">🌿</div>
      <p>Loading your cart...</p>
    </div>
  );

  const items = cartData?.items || [];
  const isEmpty = items.length === 0;
  const savings = cartData?.savings || 0;
  const freeDeliveryThreshold = 499;
  const remaining = freeDeliveryThreshold - (cartData?.subtotal || 0);

  return (
    <>
      {/* Breadcrumb */}
      <div className="cart-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span>My Cart</span>
        {!isEmpty && <span className="cart-bc-count">{items.length} item{items.length > 1 ? 's' : ''}</span>}
      </div>

      <div className="cart-page">
        {/* LEFT — Items */}
        <div className="cart-left">
          {isEmpty ? (
            <div className="cart-empty-box" style={{ margin: 0 }}>
              <div className="cart-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
              <Link to="/categories" className="cart-empty-btn">🌾 Browse Products</Link>
            </div>
          ) : (
            <>
              {/* Delivery progress bar */}
              {remaining > 0 ? (
                <div className="cart-delivery-bar">
                  <div className="cdb-top">
                    <span>🚚 Add <b>₹{Math.ceil(remaining)}</b> more for <b>FREE delivery</b></span>
                    <span className="cdb-pct">{Math.min(100, Math.round((cartData?.subtotal || 0) / freeDeliveryThreshold * 100))}%</span>
                  </div>
                  <div className="cdb-track">
                    <div className="cdb-fill" style={{ width: `${Math.min(100, (cartData?.subtotal || 0) / freeDeliveryThreshold * 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="cart-free-delivery">🎉 <b>Free delivery</b> applied on this order!</div>
              )}

              {/* Cart items */}
              <div className="cart-items-list">
                {items.map((item, i) => {
                  const disc = item.mrp > item.selling_price ? Math.round((item.mrp - item.selling_price) / item.mrp * 100) : 0;
                  const isRemoving = removing === item.id;
                  return (
                    <div key={item.id} className={`cart-item${isRemoving ? ' removing' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                      {/* Image */}
                      <Link to={`/product/${item.product_id}`} className="cart-item-img">
                        <img src={item.image || FALLBACK} alt={item.name} onError={e => e.target.src = FALLBACK} />
                        {disc > 0 && <span className="cart-item-badge">{disc}%<br/>OFF</span>}
                      </Link>

                      {/* Info */}
                      <div className="cart-item-info">
                        <Link to={`/product/${item.product_id}`} className="cart-item-name">{item.name}</Link>
                        {item.vendor_name && <div className="cart-item-brand">by {item.vendor_name}</div>}
                        <div className="cart-item-pricing">
                          <span className="cip-price">₹{Number(item.selling_price).toLocaleString('en-IN')}</span>
                          {disc > 0 && <span className="cip-mrp">₹{Number(item.mrp).toLocaleString('en-IN')}</span>}
                          {disc > 0 && <span className="cip-save">Save ₹{Number((item.mrp - item.selling_price) * item.quantity).toLocaleString('en-IN')}</span>}
                        </div>
                        <div className={`cart-item-stock ${item.stock_qty > 0 ? 'in' : 'out'}`}>
                          {item.stock_qty > 0 ? '● In Stock' : '● Out of Stock'}
                        </div>

                        {/* Qty + Remove row */}
                        <div className="cart-item-actions">
                          <div className="cart-qty">
                            <button className="cq-btn" onClick={() => updateQty(item.id, item.quantity - 1, item.stock_qty)}>−</button>
                            <span className="cq-val">{item.quantity}</span>
                            <button className="cq-btn" onClick={() => updateQty(item.id, item.quantity + 1, item.stock_qty)}>+</button>
                          </div>
                          <button className="cart-remove-btn" onClick={() => removeItem(item.id)} disabled={isRemoving}>
                            {isRemoving ? '...' : '🗑 Remove'}
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="cart-item-total">
                        ₹{Number(item.selling_price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-continue">
                <Link to="/categories">← Continue Shopping</Link>
              </div>
            </>
          )}
        </div>

        {/* RIGHT — Summary */}
        <div className="cart-summary">
          {/* Savings highlight */}
          {savings > 0 && (
            <div className="cart-savings-badge">
              🎉 You're saving <b>₹{Number(savings).toLocaleString('en-IN')}</b> on this order!
            </div>
          )}

          <div className="cs-title">Order Summary</div>

          <div className="cs-rows">
            <div className="cs-row">
              <span>Price ({items.length} item{items.length !== 1 ? 's' : ''})</span>
              <span>₹{Number(cartData?.mrp_total || 0).toLocaleString('en-IN')}</span>
            </div>
            {savings > 0 && (
              <div className="cs-row cs-discount">
                <span>Discount</span>
                <span>− ₹{Number(savings).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="cs-row">
              <span>Delivery</span>
              <span className={cartData?.delivery === 0 ? 'cs-free' : ''}>
                {cartData?.delivery === 0 ? 'FREE' : `₹${cartData?.delivery || 0}`}
              </span>
            </div>
          </div>

          <div className="cs-total">
            <span>Total Amount</span>
            <span>₹{Number(cartData?.total || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Coupon */}
          <div className="cs-coupon">
            <div className="cs-coupon-label">🏷️ Have a coupon?</div>
            <div className="cs-coupon-row">
              <input type="text" placeholder="Enter code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} />
              <button onClick={applyCoupon}>Apply</button>
            </div>
            {couponMsg && (
              <div className={`cs-coupon-msg ${couponMsg.t}`}>{couponMsg.m}</div>
            )}
          </div>

          <button className="cs-checkout-btn" disabled={isEmpty} onClick={() => navigate('/checkout')}>
            🔒 Proceed to Checkout
          </button>

          <div className="cs-secure">🔒 100% Secure • Razorpay Protected</div>

          <div className="cs-payments">
            <div className="cs-pay-label">We accept</div>
            <div className="cs-pay-methods">
              {['💳 Cards', '📱 UPI', '🏦 Net Banking', '💰 COD'].map(m => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
