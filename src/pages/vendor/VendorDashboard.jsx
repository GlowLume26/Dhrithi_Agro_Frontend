import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    api.get('vendors', { action: 'dashboard' }).then(res => {
      if (res.status === 401) { logout(); navigate('/login'); return; }
      if (res.success) setData(res.data);
      else setError(res.message || 'Failed to load dashboard');
      setLoading(false);
    }).catch(() => { setError('Network error'); setLoading(false); });
  }, [isLoggedIn]);

  const NAV = [
    ['📊', 'Dashboard',   () => navigate('/vendor/dashboard'), true],
    ['📦', 'My Products', () => navigate('/vendor/products'),  false],
    ['🚪', 'Logout',      () => { logout(); navigate('/'); },  false],
  ];

  return (
    <div className="dash-layout">
      <div className="sidebar" style={{ background: '#1b5e20' }}>
        <div className="sidebar-logo"><h2>🌿 Drithi Agro</h2><span>Vendor Portal</span></div>
        {NAV.map(([icon, label, fn, active]) => (
          <div key={label} className={'nav-item' + (active ? ' active' : '')} onClick={fn}>
            <span className="ni">{icon}</span> {label}
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="page-title">📊 Vendor Dashboard</div>

        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>⏳ Loading...</div>}
        {error   && <div style={{ padding: 20, color: '#c62828', background: '#ffebee', borderRadius: 10 }}>❌ {error}</div>}

        {data && (
          <>
            <div className="stats-grid">
              {[
                ['💰', 'Total Revenue',   '₹' + Number(data.stats?.total_revenue || 0).toLocaleString('en-IN')],
                ['🛒', 'Total Orders',    data.stats?.total_orders || 0],
                ['📦', 'Active Products', data.stats?.total_products || 0],
                ['⭐', 'Avg. Rating',     Number(data.stats?.avg_rating || 0).toFixed(1)],
              ].map(([icon, label, val]) => (
                <div key={label} className="stat-card">
                  <div className="sc-icon">{icon}</div>
                  <div className="sc-val">{val}</div>
                  <div className="sc-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="card">
                <h3>🛒 Recent Orders</h3>
                {(data.recentOrders || []).length === 0
                  ? <p style={{ color: '#aaa', fontSize: 13 }}>No orders yet.</p>
                  : (data.recentOrders || []).map(o => (
                    <div key={o.id} className="order-row">
                      <span className="or-id">#{o.order_number}</span>
                      <span className="or-product">{o.product_name}</span>
                      <span className="or-amount">₹{Number(o.total).toLocaleString('en-IN')}</span>
                      <span className="badge">{o.payment_status}</span>
                    </div>
                  ))
                }
              </div>

              <div className="card">
                <h3>🔥 Top Products</h3>
                {(data.topProducts || []).length === 0
                  ? <p style={{ color: '#aaa', fontSize: 13 }}>No products yet.</p>
                  : (data.topProducts || []).map(p => (
                    <div key={p.id} className="product-row">
                      {p.image && <img src={p.image} alt={p.name} />}
                      <div className="pr-info"><h5>{p.name}</h5><span>{p.sold_count} sold</span></div>
                      <span className="pr-price">₹{Number(p.selling_price).toLocaleString('en-IN')}</span>
                      <span className="pr-stock" style={{ color: p.stock_qty < 5 ? '#e53935' : '#2e7d32' }}>{p.stock_qty} left</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
