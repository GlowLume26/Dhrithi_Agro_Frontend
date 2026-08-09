import { useNavigate } from 'react-router-dom';

const STATS = [
  { icon: '💰', val: '₹2.4L', label: 'Total Revenue', chg: '↑ 18% this month', up: true },
  { icon: '🛒', val: '342', label: 'Total Orders', chg: '↑ 12% this month', up: true },
  { icon: '📦', val: '87', label: 'Active Products', chg: '↑ 5 new this week', up: true },
  { icon: '⭐', val: '4.8', label: 'Avg. Rating', chg: '↑ 0.2 this month', up: true },
];

const RECENT_ORDERS = [
  { id: '#DA-78432', product: 'Tomato Seeds F1 ×2', amount: '₹598', status: 'Shipped', cls: 'badge-blue' },
  { id: '#DA-78401', product: 'NPK 19:19:19 ×5', amount: '₹925', status: 'Processing', cls: 'badge-orange' },
  { id: '#DA-78389', product: 'Neem Oil 1L ×3', amount: '₹2,520', status: 'Delivered', cls: 'badge-green' },
  { id: '#DA-78350', product: 'Drip Kit 1 Acre ×1', amount: '₹3,499', status: 'Delivered', cls: 'badge-green' },
  { id: '#DA-78312', product: 'Humic Acid 300g ×4', amount: '₹1,044', status: 'Cancelled', cls: 'badge-red' },
];

const TOP_PRODUCTS = [
  { img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&q=80', name: 'Hybrid Tomato Seeds F1', sold: '142 sold this month', price: '₹299', stock: '48 left', stockClr: '#2e7d32' },
  { img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&q=80', name: 'NPK 19:19:19 1kg', sold: '98 sold this month', price: '₹185', stock: '8 left', stockClr: '#e65100' },
  { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=100&q=80', name: 'Neem Oil 10000 PPM 1L', sold: '76 sold this month', price: '₹840', stock: '32 left', stockClr: '#2e7d32' },
  { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=100&q=80', name: 'Drip Irrigation Kit 1 Acre', sold: '24 sold this month', price: '₹3,499', stock: '3 left', stockClr: '#e53935' },
];

const CHART_DATA = [
  { label: 'Aug', val: '₹18k', h: 60 }, { label: 'Sep', val: '₹22k', h: 74 }, { label: 'Oct', val: '₹19k', h: 63 },
  { label: 'Nov', val: '₹31k', h: 103 }, { label: 'Dec', val: '₹28k', h: 93 }, { label: 'Jan', val: '₹38k', h: 120 },
];

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', section: 'dashboard' },
  { icon: '📦', label: 'My Products', section: 'products' },
  { icon: '🛒', label: 'Orders', section: 'orders' },
  { icon: '📈', label: 'Analytics', section: 'analytics' },
  { icon: '🏪', label: 'Store Settings', section: 'store' },
  { icon: '💰', label: 'Payments', section: 'payments' },
  { icon: '⭐', label: 'Reviews', section: 'reviews' },
  { icon: '🔔', label: 'Notifications', section: 'notif' },
  { icon: '👤', label: 'Profile', section: 'profile' },
  { icon: '🚪', label: 'Logout', section: 'logout' },
];

export default function VendorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dash-layout">
      {/* SIDEBAR */}
      <div className="sidebar" style={{ background: '#1b5e20' }}>
        <div className="sidebar-logo">
          <h2>🌿 Drithi Agro</h2>
          <span>Vendor Portal</span>
        </div>
        <div className="vendor-info">
          <div className="vi-name">Syngenta India Ltd.</div>
          <div className="vi-id">Vendor ID: DA-VND-00142</div>
          <div className="vi-badge">✅ Verified Vendor</div>
        </div>
        <div className="nav-section">Main</div>
        {NAV_ITEMS.slice(0, 4).map((n, i) => (
          <div key={n.section} className={'nav-item' + (i === 0 ? ' active' : '')} onClick={() => n.section === 'logout' && navigate('/')}><span className="ni">{n.icon}</span> {n.label}</div>
        ))}
        <div className="nav-section">Management</div>
        {NAV_ITEMS.slice(4, 8).map(n => (
          <div key={n.section} className="nav-item"><span className="ni">{n.icon}</span> {n.label}</div>
        ))}
        <div className="nav-section">Account</div>
        {NAV_ITEMS.slice(8).map(n => (
          <div key={n.section} className="nav-item" onClick={() => n.section === 'logout' && navigate('/')}><span className="ni">{n.icon}</span> {n.label}</div>
        ))}
      </div>

      {/* MAIN */}
      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div className="page-title" style={{ marginBottom: 0 }}>📊 Vendor Dashboard</div>
          <button className="add-product-btn">+ Add Product</button>
        </div>

        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="sc-icon">{s.icon}</div>
              <div className="sc-val">{s.val}</div>
              <div className="sc-label">{s.label}</div>
              <div className={'sc-change' + (s.up ? ' up' : ' down')}>{s.chg}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>📈 Monthly Revenue <a href="#">View Report</a></h3>
            <div className="chart-bar">
              {CHART_DATA.map((d, i) => (
                <div key={d.label} className="bar-item">
                  <div className="bar-val">{d.val}</div>
                  <div className="bar" style={{ height: d.h, background: i === 5 ? 'linear-gradient(180deg,#f9a825,#e65100)' : undefined }} />
                  <div className="bar-label">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>🔔 Alerts & Notifications</h3>
            {[['warning','⚠️ 3 products are low on stock (< 10 units)'],['info','📦 12 new orders pending fulfillment'],['success','✅ ₹18,400 payout processed on 14 Jan'],['info','⭐ 5 new customer reviews received'],['warning','⚠️ 2 return requests need attention']].map(([t, m]) => (
              <div key={m} className={`alert-item ${t}`}>{m}</div>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>🛒 Recent Orders <a href="#">View All</a></h3>
            {RECENT_ORDERS.map(o => (
              <div key={o.id} className="order-row">
                <span className="or-id">{o.id}</span>
                <span className="or-product">{o.product}</span>
                <span className="or-amount">{o.amount}</span>
                <span className={`badge ${o.cls}`}>{o.status}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>🔥 Top Products <a href="#">Manage</a></h3>
            {TOP_PRODUCTS.map(p => (
              <div key={p.name} className="product-row">
                <img src={p.img} alt={p.name} />
                <div className="pr-info"><h5>{p.name}</h5><span>{p.sold}</span></div>
                <span className="pr-price">{p.price}</span>
                <span className="pr-stock" style={{ color: p.stockClr }}>{p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
