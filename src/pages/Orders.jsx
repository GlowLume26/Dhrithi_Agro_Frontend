import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';

const STATUS_STEPS = ['PLACED','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED'];
const STATUS_LABELS = { PLACED:'🛒 Order Placed', CONFIRMED:'✅ Order Confirmed', PACKED:'📦 Packed & Ready', SHIPPED:'🚚 Shipped', OUT_FOR_DELIVERY:'🛵 Out for Delivery', DELIVERED:'🎉 Delivered', CANCELLED:'❌ Cancelled', RETURNED:'↩️ Returned' };
const STATUS_CSS = { PLACED:'status-PLACED', CONFIRMED:'status-CONFIRMED', PACKED:'status-PACKED', SHIPPED:'status-SHIPPED', OUT_FOR_DELIVERY:'status-OUT_FOR_DELIVERY', DELIVERED:'status-DELIVERED', CANCELLED:'status-CANCELLED', RETURNED:'status-RETURNED' };
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=80';

export default function Orders() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [trackOrder, setTrackOrder] = useState(null);

  useEffect(() => { if (isLoggedIn) loadOrders(''); else setLoading(false); }, [isLoggedIn]);

  async function loadOrders(status) {
    setLoading(true);
    const res = await api.get('orders', status ? { status } : {});
    setOrders(res.success ? res.data : []);
    setLoading(false);
  }

  async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    const res = await api.put('orders', {}, { id: orderId });
    if (res.success) { toast('✅ Order cancelled successfully.'); loadOrders(statusFilter); }
    else toast('❌ ' + (res.message || 'Could not cancel order.'));
  }

  if (!isLoggedIn) return (
    <div className="orders-page">
      <div className="login-prompt">
        <div style={{ fontSize: 60 }}>📦</div>
        <h3>Login to view your orders</h3>
        <p>Please login to see your order history and track deliveries.</p>
        <Link to="/login">🔐 Login / Sign Up</Link>
      </div>
    </div>
  );

  return (
    <div className="orders-page">
      <h1>📦 My Orders</h1>

      <div className="order-filter">
        {['', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
          <button key={s} className={'of-btn' + (statusFilter === s ? ' active' : '')} onClick={() => { setStatusFilter(s); loadOrders(s); }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Loading...</div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <div style={{ fontSize: 64 }}>📭</div>
          <h3>{statusFilter ? `No ${statusFilter.toLowerCase()} orders` : 'No orders yet'}</h3>
          <p>You haven't placed any orders yet. Start shopping!</p>
          <Link to="/categories">🌾 Browse Products</Link>
        </div>
      ) : (
        orders.map(o => {
          const date = new Date(o.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const canCancel = ['PLACED', 'CONFIRMED'].includes(o.order_status);
          return (
            <div key={o.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{o.order_number}</div>
                  <div className="order-date">Placed on {date} • {o.item_count || (o.items?.length || 0)} item(s)</div>
                </div>
                <span className={`order-status ${STATUS_CSS[o.order_status] || ''}`}>{STATUS_LABELS[o.order_status] || o.order_status}</span>
              </div>
              <div className="order-items">
                {(o.items || []).map((item, i) => (
                  <div key={i} className="order-item-row">
                    <img src={item.product_image || FALLBACK_IMG} alt={item.product_name} onError={e => e.target.src = FALLBACK_IMG} />
                    <div><h5>{item.product_name}</h5><span>Qty: {item.quantity} • ₹{Number(item.unit_price).toLocaleString('en-IN')} each</span></div>
                    <span className="item-price">₹{Number(item.total_price).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <div>
                  <div className="order-total">Total: ₹{Number(o.total_amount).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{o.payment_method} • {o.payment_status}</div>
                </div>
                <div className="order-actions">
                  <button className="oa-btn primary" onClick={() => setTrackOrder(o)}>📍 Track</button>
                  {canCancel && <button className="oa-btn danger" onClick={() => cancelOrder(o.id)}>✕ Cancel</button>}
                  {o.order_status === 'DELIVERED' && <button className="oa-btn primary" onClick={() => navigate('/categories')}>🔄 Buy Again</button>}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* TRACKING MODAL */}
      {trackOrder && (
        <div className="tracking-modal show">
          <div className="tracking-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>📍 Order Tracking</h3>
              <button onClick={() => setTrackOrder(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
              <b>{trackOrder.order_number}</b> • ₹{Number(trackOrder.total_amount).toLocaleString('en-IN')}
            </div>
            {trackOrder.order_status === 'CANCELLED' ? (
              <div className="track-step">
                <div className="track-left"><div className="track-dot" style={{ background: '#e53935' }} /></div>
                <div className="track-info"><h5>❌ Order Cancelled</h5><p>This order has been cancelled.</p></div>
              </div>
            ) : (
              STATUS_STEPS.map((step, i) => {
                const curIdx = STATUS_STEPS.indexOf(trackOrder.order_status);
                const isDone = i < curIdx, isActive = i === curIdx, isLast = i === STATUS_STEPS.length - 1;
                return (
                  <div key={step} className="track-step">
                    <div className="track-left">
                      <div className={`track-dot${isDone ? ' done' : isActive ? ' active' : ''}`} />
                      {!isLast && <div className={`track-line${isDone ? ' done' : ''}`} />}
                    </div>
                    <div className="track-info">
                      <h5>{(isDone || isActive) ? '✅ ' : '⬜ '}{STATUS_LABELS[step]}</h5>
                      <p>{(isDone || isActive) ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                );
              })
            )}
            <button onClick={() => setTrackOrder(null)} style={{ width: '100%', background: '#2e7d32', color: 'white', border: 'none', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
