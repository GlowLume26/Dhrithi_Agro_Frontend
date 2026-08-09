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
  const [buyWithUsOpen, setBuyWithUsOpen] = useState(false);
  const [openCat, setOpenCat] = useState(null);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;
  const initial = user?.full_name ? user.full_name[0].toUpperCase() : '👤';

  // active check helper
  const isActive = (path) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const activeStyle = { background: 'rgba(249,168,37,0.22)', borderRadius: '50%' };

  useEffect(() => { if (isLoggedIn) refreshCart(); }, [isLoggedIn, refreshCart]);

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
          <button className="hamburger" onClick={openDrawer} aria-label="Open menu">☰</button>
          <Link to="/" className="logo">
            <div className="logo-icon">🌿</div>
            <div className="logo-text"><h1>Drithi Agro</h1><span>Farm to Future</span></div>
          </Link>
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

          {/* Search bar inside drawer */}
          <div className="drawer-search">
            <input
              type="text" placeholder="Search seeds, fertilizers, tools..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { doSearch(); setDrawerOpen(false); } }}
            />
            <button onClick={() => { doSearch(); setDrawerOpen(false); }} aria-label="Search">🔍</button>
          </div>

          {/* Action icons inside drawer */}
          <div className="drawer-actions">
            <button className="drawer-action-btn sell" aria-label="Buy with us" onClick={() => { setBuyWithUsOpen(true); setDrawerOpen(false); }}>🤝 <span>Buy with us</span></button>
            <Link to="/contact" aria-label="Contact" className={`drawer-action-btn${isActive('/contact') ? ' hdr-active' : ''}`} onClick={() => setDrawerOpen(false)}>📞 <span>Contact</span></Link>
            <button
              className={`drawer-action-btn${notifOpen ? ' hdr-active' : ''}`}
              aria-label="Notifications"
              onClick={() => { setNotifOpen(true); loadNotifications(); setDrawerOpen(false); }}
            >
              <span style={{position:'relative', display:'inline-flex'}}>🔔{isLoggedIn && unreadCount > 0 && <span className="notif-dot" style={{top:0,right:-2}}></span>}</span>
              <span>Notifications</span>
            </button>
            <Link to="/orders" aria-label="Orders" className={`drawer-action-btn${isActive('/orders') ? ' hdr-active' : ''}`} onClick={() => setDrawerOpen(false)}>📦 <span>Orders</span></Link>
            <Link to="/wishlist" aria-label="Wishlist" className={`drawer-action-btn${isActive('/wishlist') ? ' hdr-active' : ''}`} onClick={() => setDrawerOpen(false)}>❤️ <span>Wishlist</span></Link>
            <Link to="/account" aria-label="Account" className={`drawer-action-btn${isActive('/account') ? ' hdr-active' : ''}`} onClick={() => setDrawerOpen(false)}>
              {isLoggedIn ? <span className="user-avatar" style={{width:22,height:22,fontSize:11}}>{initial}</span> : '👤'} <span>Account</span>
            </Link>
            <Link to="/cart" aria-label="Cart" className={`drawer-action-btn${isActive('/cart') ? ' hdr-active' : ''}`} onClick={() => setDrawerOpen(false)}>
              <span style={{position:'relative', display:'inline-flex'}}>🛒<span className="cart-count">{cartCount}</span></span>
              <span>Cart</span>
            </Link>
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
                        <Link key={k.id} to={`/categories?category_slug=${k.slug}`} onClick={() => setDrawerOpen(false)}>{k.name}</Link>
                      ))}
                      <Link to={`/categories?category_slug=${p.slug}`} className="view-all-link" onClick={() => setDrawerOpen(false)}>View All {p.name} →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {drawerOpen && <div className="cat-drawer-overlay open" onClick={() => setDrawerOpen(false)}></div>}

      {/* BUY WITH US MODAL */}
      {buyWithUsOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setBuyWithUsOpen(false)}>
          <div style={{ background:'white', borderRadius:20, padding:'36px 32px', maxWidth:440, width:'100%', boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🤝</div>
              <h2 style={{ fontSize:22, fontWeight:900, color:'#1b5e20', marginBottom:6 }}>Join Drithi Agro</h2>
              <p style={{ fontSize:13, color:'#888' }}>Choose how you want to get started</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <button onClick={() => { setBuyWithUsOpen(false); navigate('/login?role=buyer'); }}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', border:'2px solid #e0e0e0', borderRadius:14, background:'white', cursor:'pointer', textAlign:'left', transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#2e7d32'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#e0e0e0'}>
                <div style={{ width:48, height:48, borderRadius:12, background:'#e8f5e9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🛒</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:'#1b5e20' }}>I'm a Buyer</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>Shop quality agri products, seeds, fertilizers & more</div>
                </div>
              </button>
              <button onClick={() => { setBuyWithUsOpen(false); navigate('/vendor/register?role=seller'); }}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', border:'2px solid #e0e0e0', borderRadius:14, background:'white', cursor:'pointer', textAlign:'left', transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#2e7d32'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#e0e0e0'}>
                <div style={{ width:48, height:48, borderRadius:12, background:'#fff8e1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🏪</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:'#1b5e20' }}>I'm a Seller</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>List your products & reach 5 lakh+ farmers across India</div>
                </div>
              </button>
            </div>
            <button onClick={() => setBuyWithUsOpen(false)}
              style={{ display:'block', width:'100%', marginTop:20, background:'none', border:'none', color:'#aaa', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      </header>
    </>
  );
}
