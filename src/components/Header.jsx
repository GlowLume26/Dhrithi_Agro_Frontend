import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLoggedIn, user } = useAuth();
  const { cartCount, refreshCart } = useCart();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('da_read_notifs') || '[]')); } catch { return new Set(); }
  });
  const [openCat, setOpenCat] = useState(null);
  const initial = user?.full_name ? user.full_name[0].toUpperCase() : '👤';

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  // active check helper
  const isActive = (path) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const activeStyle = { background: 'rgba(249,168,37,0.22)', borderRadius: '50%' };

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

  function markAllRead() {
    const ids = new Set(notifications.map(n => n.id));
    setReadIds(ids);
    localStorage.setItem('da_read_notifs', JSON.stringify([...ids]));
  }

  function markOneRead(id) {
    setReadIds(prev => {
      const next = new Set(prev); next.add(id);
      localStorage.setItem('da_read_notifs', JSON.stringify([...next]));
      return next;
    });
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
            <Link to="/contact" className={`action-btn${isActive('/contact') ? ' hdr-active' : ''}`}><span className="icon">📞</span></Link>

            <div className={`action-btn notif-wrap${notifOpen ? ' hdr-active' : ''}`} onClick={() => { setNotifOpen(true); loadNotifications(); }}>
              <span className="icon">🔔</span>
              {isLoggedIn && unreadCount > 0 && <span className="notif-dot"></span>}
            </div>

            <Link to="/orders"  className={`action-btn${isActive('/orders')  ? ' hdr-active' : ''}`}><span className="icon">📦</span></Link>
            <Link to="/wishlist" className={`action-btn${isActive('/wishlist') ? ' hdr-active' : ''}`}><span className="icon">❤️</span></Link>
            <Link to="/account" className={`action-btn${isActive('/account') ? ' hdr-active' : ''}`}>
              <span className="icon">{isLoggedIn ? <span className="user-avatar">{initial}</span> : '👤'}</span>
            </Link>
            <Link to="/cart" className={`action-btn cart-wrap${isActive('/cart') ? ' hdr-active' : ''}`}>
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
                <span>🔔 Notifications {unreadCount > 0 && <span style={{ background:'#e53935', color:'white', fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:20, marginLeft:6 }}>{unreadCount}</span>}</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background:'#e8f5e9', border:'none', color:'#2e7d32', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>✓ Mark all read</button>
                  )}
                  <button onClick={() => setNotifOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#666' }}>✕</button>
                </div>
              </div>
              <div className="notif-body">
                {!isLoggedIn
                  ? <div className="notif-empty">Please <Link to="/login" style={{color:'#2e7d32'}}>login</Link> to see notifications.</div>
                  : notifications.length === 0
                  ? <div className="notif-empty">No orders yet.</div>
                  : notifications.map(o => {
                      const isRead = readIds.has(o.id);
                      return (
                        <div key={o.id} style={{ position:'relative' }}>
                          <Link to="/orders" className="notif-item"
                            style={{ background: isRead ? 'transparent' : 'rgba(46,125,50,0.04)' }}
                            onClick={() => { markOneRead(o.id); setNotifOpen(false); }}
                          >
                            {!isRead && <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:7, height:7, borderRadius:'50%', background:'#2e7d32', flexShrink:0 }} />}
                            <div className="notif-icon" style={{ marginLeft: isRead ? 0 : 14 }}>📦</div>
                            <div style={{ flex:1 }}>
                              <div className="notif-title">Order #{o.order_number}</div>
                              <div className="notif-sub">Status: <b>{o.order_status}</b> • ₹{Number(o.total_amount || o.final_amount).toLocaleString('en-IN')}</div>
                              <div className="notif-time">{new Date(o.placed_at || o.created_at).toLocaleDateString('en-IN')}</div>
                            </div>
                            {!isRead && (
                              <button onClick={e => { e.preventDefault(); e.stopPropagation(); markOneRead(o.id); }}
                                style={{ background:'none', border:'none', color:'#aaa', fontSize:11, cursor:'pointer', flexShrink:0, padding:'2px 6px' }}
                                title="Mark as read"
                              >✓</button>
                            )}
                          </Link>
                        </div>
                      );
                    })
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
