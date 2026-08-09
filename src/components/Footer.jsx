import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function Footer() {
  const navigate = useNavigate();
  const [showTop, setShowTop] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  async function handleAdminLogin(e) {
    e.preventDefault();
    if (!email || !pass) { setErr('Enter email and password.'); return; }
    setLoading(true); setErr('');
    try {
      const res = await api.post('auth', { identifier: email, password: pass, action: 'login' });
      if (res.success && ['admin','owner','superadmin'].includes(res.data?.user?.role)) {
        localStorage.setItem('da_admin_token', res.data.token);
        localStorage.setItem('da_admin_user', JSON.stringify(res.data.user));
        setAdminModal(false);
        navigate('/admin/dashboard');
      } else if (res.success) {
        setErr('Access denied. Admin credentials required.');
      } else {
        setErr(res.message || 'Invalid credentials.');
      }
    } catch {
      setErr('Login failed. Try again.');
    }
    setLoading(false);
  }

  return (
    <>
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon" style={{ background:'#f9a825',width:'44px',height:'44px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px' }}>🌿</div>
              <div className="logo-text"><h1 style={{ fontSize:'20px' }}>Drithi Agro</h1><span style={{ fontSize:'11px',color:'#a5d6a7' }}>Farm to Future</span></div>
            </div>
            <p>India's trusted agri-commerce platform connecting farmers with quality products at the best prices.</p>
            <div className="footer-social">
              <div className="social-btn">📸</div><div className="social-btn">📷</div>
              <div className="social-btn">🐦</div><div className="social-btn">▶️</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Our Organization</h4>
            <ul>
              <li><Link to="/about">🌾 About Us</Link></li>
              <li><Link to="/about#mission">🎯 Our Mission</Link></li>
              <li><Link to="/about#team">👥 Our Team</Link></li>
              <li><Link to="/vendor/register">🤝 Partner With Us</Link></li>
              <li><Link to="/contact">📞 Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/explore">✨ Everything We Offer</Link></li>
              <li><Link to="/categories">🛒 Shop Now</Link></li>
              <li><Link to="/vendor/register">🏪 Sell With Us</Link></li>
              <li><Link to="/orders">🚚 Track Order</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/categories?category_slug=irrigation">💧 Irrigation</Link></li>
              <li><Link to="/categories?category_slug=gardening">🌿 Gardening</Link></li>
              <li><Link to="/categories?category_slug=cattle-bird-care">🐄 Cattle & Bird Care</Link></li>
              <li><Link to="/categories?offers=1">🏷️ Best Offers</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">🎓 Help Center</Link></li>
              <li><Link to="/orders">📌 Track Order</Link></li>
              <li><Link to="#">🔄 Returns Policy</Link></li>
              <li><Link to="#">🔒 Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
          <p>© 2025 Drithi Agro. All rights reserved. | Made with 💚 for Indian Farmers</p>
          {/* Hidden admin access icon */}
          <button
            onClick={() => { setAdminModal(true); setErr(''); setEmail(''); setPass(''); }}
            title="Admin Access"
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'4px 8px', cursor:'pointer', fontSize:14, color:'rgba(255,255,255,0.4)', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.18)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}
          >⚙️</button>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {adminModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setAdminModal(false)}>
          <div style={{ background:'linear-gradient(135deg,#1e293b,#0f2b14)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'36px 32px', width:'100%', maxWidth:400, boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ width:56, height:56, background:'linear-gradient(135deg,#2e7d32,#66bb6a)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(46,125,50,0.4)' }}>🛡️</div>
              <h2 style={{ fontSize:20, fontWeight:900, color:'#f8fafc', margin:0 }}>Admin Portal</h2>
              <p style={{ fontSize:12, color:'#64748b', marginTop:4, letterSpacing:1 }}>DRITHI AGRO</p>
            </div>

            <form onSubmit={handleAdminLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {err && (
                <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'9px 12px', fontSize:13, color:'#fca5a5' }}>{err}</div>
              )}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:5 }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder="admin@drithiagro.com"
                  style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:9, color:'#f8fafc', fontSize:14, outline:'none', boxSizing:'border-box' }}
                  onFocus={e => e.target.style.borderColor='#4caf50'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:5 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Enter password"
                    style={{ width:'100%', padding:'10px 40px 10px 12px', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:9, color:'#f8fafc', fontSize:14, outline:'none', boxSizing:'border-box' }}
                    onFocus={e => e.target.style.borderColor='#4caf50'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#64748b', fontSize:15, cursor:'pointer' }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                style={{ background:'linear-gradient(135deg,#2e7d32,#43a047)', color:'white', border:'none', padding:'12px', borderRadius:10, fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 20px rgba(46,125,50,0.4)', opacity:loading ? 0.7 : 1, marginTop:4 }}>
                {loading ? '⏳ Signing in...' : '🔐 Sign In to Admin'}
              </button>
            </form>

            <button onClick={() => setAdminModal(false)}
              style={{ display:'block', width:'100%', marginTop:14, background:'none', border:'none', color:'#475569', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <button
        className={'scroll-top' + (showTop ? ' show' : '')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >↑</button>
    </>
  );
}
