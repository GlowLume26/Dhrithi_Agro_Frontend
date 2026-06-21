import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { NAV_ITEMS } from '../utils/constants';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { admin, logout, can } = useAdminAuth();
  const { dark, toggle } = useAdminTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter(n => can(n.id));
  const initial = (admin?.name || admin?.email || 'A').charAt(0).toUpperCase();

  function doLogout() { logout(); navigate('/admin/login'); }

  return (
    <div className="admin-root a-layout">
      {/* MOBILE OVERLAY */}
      {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 199 }} onClick={() => setMobileOpen(false)} />}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`a-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="a-sb-logo">
          <div className="a-sb-logo-icon">🌿</div>
          {!collapsed && (
            <div className="a-sb-logo-text">
              <h2>Drithi Agro</h2>
              <span>Admin Portal</span>
            </div>
          )}
        </div>

        <nav className="a-sb-nav">
          {!collapsed && <div className="a-sb-section">Main</div>}
          {visibleNav.slice(0, 4).map(n => (
            <button key={n.id}
              className={`a-nav-item${pathname.startsWith(n.path) ? ' active' : ''}`}
              onClick={() => { navigate(n.path); setMobileOpen(false); }}
              title={collapsed ? n.label : ''}
            >
              <span style={{ fontSize: 18 }}>{navIcon(n.id)}</span>
              {!collapsed && <span className="a-nav-label">{n.label}</span>}
            </button>
          ))}

          {visibleNav.length > 4 && (
            <>
              {!collapsed && <div className="a-sb-section">Management</div>}
              {visibleNav.slice(4).map(n => (
                <button key={n.id}
                  className={`a-nav-item${pathname.startsWith(n.path) ? ' active' : ''}`}
                  onClick={() => { navigate(n.path); setMobileOpen(false); }}
                  title={collapsed ? n.label : ''}
                >
                  <span style={{ fontSize: 18 }}>{navIcon(n.id)}</span>
                  {!collapsed && <span className="a-nav-label">{n.label}</span>}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="a-sb-bottom">
          <button className="a-nav-item" onClick={doLogout} title={collapsed ? 'Logout' : ''}>
            <span style={{ fontSize: 18 }}>🚪</span>
            {!collapsed && <span className="a-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className={`a-main${collapsed ? ' sb-collapsed' : ''}`}>
        {/* TOPBAR */}
        <header className="a-topbar">
          <button className="a-icon-btn" style={{ border: 'none' }}
            onClick={() => { setCollapsed(c => !c); setMobileOpen(o => !o); }}>
            ☰
          </button>

          <div className="a-topbar-search">
            <span style={{ fontSize: 16, color: 'var(--atx3)' }}>🔍</span>
            <input placeholder="Search products, orders, customers..." />
          </div>

          <div className="a-topbar-actions">
            <button className="a-icon-btn" onClick={toggle} title="Toggle theme">
              {dark ? '☀️' : '🌙'}
            </button>
            <button className="a-icon-btn" title="Notifications">
              🔔<span className="a-notif-dot" />
            </button>

            {/* Profile dropdown */}
            <div style={{ position: 'relative' }}>
              <div className="a-avatar" onClick={() => setProfileOpen(o => !o)}>{initial}</div>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    style={{ position: 'absolute', top: 42, right: 0, background: 'var(--ab)', border: '1px solid var(--abord)', borderRadius: 12, padding: 8, minWidth: 180, boxShadow: 'var(--asha2)', zIndex: 300 }}
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--abord)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--atx)' }}>{admin?.name || 'Admin'}</div>
                      <div style={{ fontSize: 11, color: 'var(--atx2)', marginTop: 2, textTransform: 'capitalize' }}>{admin?.role}</div>
                    </div>
                    {[['👤','Profile'],['⚙️','Settings']].map(([ic, lb]) => (
                      <button key={lb} className="a-nav-item" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, color: 'var(--atx2)', fontSize: 13 }}>
                        <span>{ic}</span><span>{lb}</span>
                      </button>
                    ))}
                    <button className="a-nav-item" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, color: '#ef4444', fontSize: 13, marginTop: 2, borderTop: '1px solid var(--abord)' }} onClick={doLogout}>
                      <span>🚪</span><span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <motion.main className="a-page"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

function navIcon(id) {
  return { dashboard:'📊', products:'📦', orders:'🛒', customers:'👥', inventory:'🗄️', offers:'🏷️', reports:'📈', settings:'⚙️', admins:'🛡️' }[id] || '📌';
}
