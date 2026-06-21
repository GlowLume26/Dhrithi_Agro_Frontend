import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { cartCount, refreshCart } = useCart();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [openCat, setOpenCat] = useState(null);
  const initial = user?.full_name ? user.full_name[0].toUpperCase() : '👤';

  useEffect(() => { refreshCart(); }, [refreshCart]);

  async function loadCategories() {
    if (categories.length) return;
    const res = await api.get('categories');
    if (res.success) setCategories(res.data);
  }

  async function loadNotifications() {
    if (!isLoggedIn) return;
    try {
      const res = await api.get('orders');
      if (res.success && res.data?.length) setNotifications(res.data.slice(0, 5));
    } catch {}
  }

  function openDrawer() { setDrawerOpen(true); loadCategories(); }

  function doSearch() {
    if (!search.trim()) return;
    navigate('/categories?search=' + encodeURIComponent(search.trim()));
    setSearch('');
  }

  const parents = categories.filter(c => !c.parent_id);
  const kids    = categories.filter(c =>  c.parent_id);
  const catIcons = { 'Irrigation': '💧', 'Gardening': '🌿', 'Cattle & Bird Care': '🐄', 'default': '📦' };

  return (
    <>
      <header>
        <div className="header-top">
          <button className="hamburger" onClick={openDrawer}>☰</button>

          <Link to="/" className="logo">
            <div className="logo-icon">🌿</div>
            <div className="logo-text"><h1>Drithi Agro</h1><span>Farm to Future</span></div>
          </Link>

          <div className="search-bar">
            <input
              type="text" placeholder="Search seeds, fertilizers, tools..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            <button onClick={doSearch}>🔍</button>
          </div>

          <div className="header-actions">
            <Link to="/vendor/register" className="action-btn sell">🤝 <span className="sell-txt">Sell</span></Link>
            <Link to="/contact" className="action-btn"><span className="icon">📞</span></Link>

            <div className="action-btn notif-wrap" onClick={() => { setNotifOpen(true); loadNotifications(); }}>
              <span className="icon">🔔</span>
              {isLoggedIn && <span className="notif-dot"></span>}
            </div>

            <Link to="/orders" className="action-btn"><span className="icon">📦</span></Link>
            <Link to="/wishlist" className="action-btn"><span className="icon">❤️</span></Link>
            <Link to="/account" className="action-btn">
              <span className="icon">{isLoggedIn ? <span className="user-avatar">{initial}</span> : '👤'}</span>
            </Link>
            <Link to="/cart" className="action-btn cart-wrap">
              <span className="icon">🛒</span>
              <span className="cart-count">{cartCount}</span>
            </Link>
          </div>
        </div>

        {/* Notification Panel */}
        {notifOpen && (
          <>
            <div className="notif-panel open">
              <div className="notif-header">
                <span>🔔 Notifications</span>
                <button onClick={() => setNotifOpen(false)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#666' }}>✕</button>
              </div>
              <div className="notif-body">
                {!isLoggedIn
                  ? <div className="notif-empty">Please <Link to="/login" style={{color:'#2e7d32'}}>login</Link> to see notifications.</div>
                  : notifications.length === 0
                  ? <div className="notif-empty">No orders yet.</div>
                  : notifications.map(o => (
                      <Link key={o.id} to="/orders" className="notif-item" onClick={() => setNotifOpen(false)}>
                        <div className="notif-icon">📦</div>
                        <div>
                          <div className="notif-title">Order #{o.order_number}</div>
                          <div className="notif-sub">Status: <b>{o.order_status}</b> • ₹{Number(o.total_amount).toLocaleString('en-IN')}</div>
                          <div className="notif-time">{new Date(o.placed_at).toLocaleDateString('en-IN')}</div>
                        </div>
                      </Link>
                    ))
                }
              </div>
            </div>
            <div className="notif-overlay open" onClick={() => setNotifOpen(false)}></div>
          </>
        )}

        {/* Category Drawer */}
        <div className={'cat-drawer' + (drawerOpen ? ' open' : '')}>
          <div className="cat-drawer-head">
            <span>☰ Menu</span>
            <button onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="cat-drawer-body">
            <div className="cat-accordion">
              <span className="drawer-section-label">Categories</span>
              {parents.map(p => {
                const children = kids.filter(c => String(c.parent_id) === String(p.id));
                return (
                  <div key={p.id} className={'cat-accordion-item' + (openCat === p.id ? ' active' : '')}>
                    <div className="cat-accordion-header" onClick={() => setOpenCat(openCat === p.id ? null : p.id)}>
                      <span className="cat-accordion-title">{catIcons[p.name] || catIcons.default} {p.name}</span>
                      <span className="cat-accordion-icon">▼</span>
                    </div>
                    <div className="cat-accordion-content" style={{ maxHeight: openCat === p.id ? '500px' : '0' }}>
                      {children.map(k => (
                        <Link key={k.id} to={`/categories?category_id=${k.id}`} onClick={() => setDrawerOpen(false)}>{k.name}</Link>
                      ))}
                      <Link to={`/categories?category_id=${p.id}`} className="view-all-link" onClick={() => setDrawerOpen(false)}>View All {p.name} →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {drawerOpen && <div className="cat-drawer-overlay open" onClick={() => setDrawerOpen(false)}></div>}
      </header>
    </>
  );
}
