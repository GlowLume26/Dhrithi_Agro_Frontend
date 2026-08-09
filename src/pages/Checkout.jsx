import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Checkout() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [cartData, setCartData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [newAddr, setNewAddr] = useState({ full_name: '', mobile: '', address_line1: '', address_line2: '', city: '', pincode: '', state: 'Maharashtra', address_type: 'home' });

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    api.get('cart').then(r => r.success && setCartData(r.data));
    api.get('customer', { section: 'addresses' }).then(r => r.success && setAddresses(r.data || []));
  }, [isLoggedIn]);

  const PAYMENT_OPTS = [
    { icon: '📱', label: 'UPI Payment',         sub: 'Google Pay, PhonePe, Paytm, BHIM UPI', method: 'upi' },
    { icon: '💳', label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, RuPay',              method: 'card' },
    { icon: '🏦', label: 'Net Banking',           sub: 'All major Indian banks',               method: 'net_banking' },
    { icon: '💰', label: 'Cash on Delivery',      sub: 'Pay when your order arrives',          method: 'cod' },
  ];

  async function placeOrder() {
    if (!addr && !addresses.length) { alert('Please add a delivery address first.'); return; }
    if (!addr) { alert('Please select a delivery address.'); return; }
    setLoading(true);
    const res = await api.post('orders', {
      address_id: addr.id,
      payment_method: PAYMENT_OPTS[selectedPayment].method,
      coupon_code: localStorage.getItem('da_coupon') || '',
    });
    setLoading(false);
    localStorage.removeItem('da_coupon');
    if (res.success) { setOrderNum(res.data?.order_number || 'DA-' + Date.now()); setSuccess(true); }
    else alert(res.message || 'Failed to place order.');
  }

  const items = cartData?.items || [];

  return (
    <>
      <div style={{ background: '#f5f5f5', padding: '12px 40px', fontSize: 13, color: '#666' }}>
        <Link to="/" style={{ color: '#2e7d32' }}>Home</Link> › <Link to="/cart" style={{ color: '#2e7d32' }}>Cart</Link> › Checkout
      </div>

      <div className="checkout-page">
        <div>
          {/* STEPS */}
          <div className="checkout-steps">
            {[['Cart', true, true], ['Address', true, false], ['Payment', false, false], ['Confirm', false, false]].map(([l, done, isDone], i) => (
              <>
                {i > 0 && <div key={`line${i}`} className={'cs-line' + (done && isDone ? ' done' : '')} />}
                <div key={l} className={'cs' + (i === 1 ? ' active' : done && i === 0 ? ' done' : '')}>
                  <div className="cs-num">{i === 0 ? '✓' : i + 1}</div><span>{l}</span>
                </div>
              </>
            ))}
          </div>

          {/* ADDRESS */}
          <div className="section-card">
            <h3>📍 Delivery Address</h3>
            {addresses.length === 0 && !showNewAddr && (
              <p style={{ color: '#999', fontSize: 14 }}>No saved addresses. Please add one below.</p>
            )}
            {addresses.map((a, i) => (
              <div key={a.id} className={'address-card' + (selectedAddr === i ? ' selected' : '')} onClick={() => setSelectedAddr(i)}>
                <span className="addr-tag">{a.address_type}</span>
                <h4>{a.full_name}</h4>
                <p>{a.address_line1}{a.address_line2 ? ', ' + a.address_line2 : ''}, {a.city}, {a.state} — {a.pincode}</p>
                <p style={{ marginTop: 4, fontSize: 12, color: '#2e7d32' }}>📱 {a.mobile}</p>
              </div>
            ))}
            <button onClick={() => setShowNewAddr(!showNewAddr)} style={{ background: '#f9fbe7', border: '2px dashed #2e7d32', color: '#2e7d32', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 16 }}>+ Add New Address</button>
            {showNewAddr && (
              <div style={{ marginTop: 16 }}>
                <div className="form-grid">
                  {[['Full Name', 'full_name', 'text'], ['Mobile', 'mobile', 'tel'], ['Address Line 1', 'address_line1', 'text'], ['Address Line 2', 'address_line2', 'text'], ['City', 'city', 'text'], ['Pincode', 'pincode', 'text']].map(([l, k, t]) => (
                    <div key={k} className={'form-group' + (['address_line1', 'address_line2'].includes(k) ? ' full' : '')}>
                      <label>{l}</label>
                      <input type={t} value={newAddr[k]} onChange={e => setNewAddr(a => ({ ...a, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="form-group"><label>State</label>
                    <select value={newAddr.state} onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))}>
                      {['Maharashtra', 'Uttar Pradesh', 'Punjab', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Address Type</label>
                    <select value={newAddr.address_type} onChange={e => setNewAddr(a => ({ ...a, address_type: e.target.value }))}>
                      {['HOME', 'FARM', 'OFFICE', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group full">
                    <button style={{ background: '#2e7d32', color: 'white', border: 'none', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onClick={async () => {
                      const res = await api.post('customer', newAddr, { section: 'addresses' });
                      if (res.success) { setShowNewAddr(false); api.get('customer', { section: 'addresses' }).then(r => r.success && setAddresses(r.data || [])); }
                    }}>Save Address</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="section-card">
            <h3>💳 Payment Method</h3>
            {PAYMENT_OPTS.map((p, i) => (
              <div key={i} className={'payment-option' + (selectedPayment === i ? ' selected' : '')} onClick={() => setSelectedPayment(i)}>
                <input type="radio" name="payment" readOnly checked={selectedPayment === i} style={{ accentColor: '#2e7d32', width: 18, height: 18 }} />
                <span className="po-icon">{p.icon}</span>
                <div className="po-info"><h4>{p.label}</h4><p>{p.sub}</p></div>
              </div>
            ))}
            <div style={{ marginTop: 12, background: '#e8f5e9', borderRadius: 10, padding: 12, fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>🔒 Payments secured by Razorpay — PCI DSS Compliant</div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="order-summary">
          <h3>📦 Order Summary</h3>
          {items.map(item => (
            <div key={item.id} className="order-item">
              <img src={item.image || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=80'} alt={item.name} />
              <div className="order-item-info"><h5>{item.name}</h5><span>Qty: {item.quantity} × ₹{Number(item.selling_price).toLocaleString('en-IN')}</span></div>
              <span className="order-item-price">₹{Number(item.selling_price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>₹{Number(cartData?.subtotal || 0).toLocaleString('en-IN')}</span></div>
          <div className="summary-row" style={{ color: '#2e7d32', fontWeight: 600 }}><span>Discount</span><span>− ₹{Number(cartData?.savings || 0).toLocaleString('en-IN')}</span></div>
          <div className="summary-row"><span>Delivery</span><span style={{ color: '#2e7d32', fontWeight: 600 }}>{cartData?.delivery === 0 ? 'FREE' : `₹${cartData?.delivery || 0}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{Number(cartData?.total || 0).toLocaleString('en-IN')}</span></div>
          <button className="place-order-btn" disabled={loading} onClick={placeOrder}>{loading ? '⏳ Placing Order...' : `🔒 Place Order — ₹${Number(cartData?.total || 0).toLocaleString('en-IN')}`}</button>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 10 }}>By placing order, you agree to our Terms & Conditions</div>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="success-overlay show">
          <div className="success-box">
            <div className="s-icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your order. Your farm supplies are on the way!</p>
            <div className="order-id">Order #{orderNum}</div>
            <p style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>Expected Delivery: 2-5 Business Days</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
              <button onClick={() => navigate('/orders')} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>📦 Track Order</button>
              <button onClick={() => navigate('/')} style={{ background: '#f5f5f5', color: '#333', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>🏠 Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
