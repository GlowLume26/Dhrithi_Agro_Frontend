import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Account() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [section, setSection] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Initialize form using values from localStorage (da_user) as a fallback
  const [form, setForm] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('da_user') || '{}');
    return {
      full_name: stored.name || stored.full_name || '',
      email: stored.email || '',
      dob: '',
      gender: '',
      occupation: '',
      farm_size: '',
      primary_crop: ''
    };
  });

  const [addrForm, setAddrForm] = useState({
    full_name: '',
    mobile: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'HOME'
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/drithi-agro-backend/index.php?route=customer&section=profile', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('da_token') }
    }).then(async r => {
      if (r.status === 401) { logout(); navigate('/login'); return; }
      const res = await r.json();
      if (!res.success) return;
      const d = res.data;
      setProfile(d);
      setStats(d.stats || {});
      setForm({
        full_name: d.full_name || '',
        email: d.email || '',
        dob: d.dob || '',
        gender: d.gender || '',
        occupation: d.occupation || '',
        farm_size: d.farm_size || '',
        primary_crop: d.primary_crop || ''
      });
    });
    api.get('customer', { section: 'addresses' }).then(res => res.success && setAddresses(res.data || []));
  }, [isLoggedIn]);

  // Dynamic Profile Completion Calculation Helper
  const getCompletionPercentage = () => {
    const fields = [
      form.full_name,
      form.email,
      profile?.mobile || user?.mobile,
      form.dob,
      form.gender,
      form.occupation,
      form.farm_size,
      form.primary_crop
    ];
    const filledFields = fields.filter(val => val !== null && val !== undefined && String(val).trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  async function saveProfile() {
    setSaving(true);
    const res = await api.put('customer', form, { section: 'profile' });
    setSaveMsg(res.success ? { t: 'ok', m: '✅ Profile updated successfully!' } : { t: 'err', m: '❌ ' + (res.message || 'Update failed.') });
    if (res.success) {
      if (res.data) {
        setProfile(res.data);
      } else {
        // Safe UI fallback state sync if backend returns null
        setProfile(prev => ({
          ...prev,
          full_name: form.full_name,
          email: form.email,
          dob: form.dob,
          gender: form.gender,
          occupation: form.occupation,
          farm_size: form.farm_size,
          primary_crop: form.primary_crop
        }));
      }

      // Update localStorage (da_user) to stay persistent
      const u = JSON.parse(localStorage.getItem('da_user') || '{}');
      u.name = form.full_name;
      u.full_name = form.full_name;
      u.email = form.email;
      localStorage.setItem('da_user', JSON.stringify(u));
    }
    setTimeout(() => setSaveMsg(null), 3000);
    setSaving(false);
  }

  async function saveAddress() {
    if (!addrForm.full_name || !addrForm.mobile || !addrForm.address_line1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      alert('Please fill all required fields.');
      return;
    }
    const res = await api.post('customer', addrForm, { section: 'addresses' });
    if (res.success) {
      setShowAddForm(false);
      setAddrForm({ full_name: '', mobile: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', address_type: 'HOME' });
      api.get('customer', { section: 'addresses' }).then(r => r.success && setAddresses(r.data || []));
    } else {
      alert(res.message || 'Failed to save address.');
    }
  }

  async function deleteAddress(id) {
    if (!confirm('Delete this address?')) return;
    const res = await api.delete('customer', { section: 'addresses', id });
    if (res.success) setAddresses(a => a.filter(x => x.id !== id));
  }

  function doLogout() { logout(); navigate('/login'); }

  if (!isLoggedIn) return (
    <div style={{ padding: 20 }}>
      <div className="login-prompt" style={{ maxWidth: 480, margin: '60px auto', background: 'white', borderRadius: 20, padding: '50px 40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1b5e20', marginBottom: 10 }}>Login to Your Account</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 28, lineHeight: 1.6 }}>Please login or create an account to view your profile, orders, wishlist and more.</p>
        <Link to="/login" style={{ display: 'inline-block', background: '#2e7d32', color: 'white', padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 700, margin: 6, textDecoration: 'none' }}>🔐 Login</Link>
        <Link to="/login" style={{ display: 'inline-block', background: 'white', color: '#2e7d32', border: '2px solid #2e7d32', padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 700, margin: 6, textDecoration: 'none' }}>📝 Sign Up</Link>
      </div>
    </div>
  );

  const initial = (profile?.full_name || user?.name || user?.full_name || '?').charAt(0).toUpperCase();

  return (
    <>
      <div style={{ background: '#f5f5f5', padding: '12px 40px', fontSize: 13, color: '#666' }}>
        <Link to="/" style={{ color: '#2e7d32' }}>Home</Link> › My Account
      </div>
      <div className="account-layout">
        {/* SIDEBAR */}
        <div className="account-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">{initial}</div>
            <div className="profile-name">{profile?.full_name || user?.name || user?.full_name || '—'}</div>
            <div className="profile-phone">📱 +91 {profile?.mobile || user?.mobile || ''}</div>
            <div className="profile-since">🌾 Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</div>
          </div>
          <div className="sidebar-nav">
            {[['👤', 'My Profile', () => setSection('profile'), section === 'profile'],
            ['📦', 'My Orders', () => navigate('/orders'), false],
            ['❤️', 'Wishlist', () => navigate('/wishlist'), false],
            ['🛒', 'My Cart', () => navigate('/cart'), false],
            ['📍', 'Addresses', () => setSection('addresses'), section === 'addresses'],
            ].map(([icon, label, fn, active]) => (
              <div key={label} className={'nav-item' + (active ? ' active' : '')} onClick={fn}>
                <span className="ni">{icon}</span> {label}
              </div>
            ))}
            <div className="nav-item" style={{ color: '#c62828' }} onClick={doLogout}><span className="ni">🚪</span> Logout</div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main-content">
          {/* STATS */}
          <div className="card">
            <div className="stats-row">
              {[['Total Orders', stats.total_orders || 0], ['Wishlist', stats.wishlist_count || 0], ['Reviews', stats.review_count || 0], ['Total Spent', stats.total_spent > 0 ? '₹' + Number(stats.total_spent).toLocaleString('en-IN') : '₹0']].map(([l, v]) => (
                <div key={l} className="mini-stat"><div className="ms-val">{v}</div><div className="ms-lbl">{l}</div></div>
              ))}
            </div>
          </div>

          {/* PROFILE */}
          {section === 'profile' && (
            <div className="card">
              {/* Profile Completion Progress Bar */}
              {(() => {
                const pct = getCompletionPercentage();
                return (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#2e7d32' }}>
                      <span>🌾 Profile Completion</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#e8f5e9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#2e7d32', borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })()}

              <h3>👤 Personal Information</h3>
              <div className="form-grid">
                <div className="form-group"><label>Full Name</label><input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                <div className="form-group"><label>Mobile Number</label><input type="tel" value={'+91 ' + (profile?.mobile || user?.mobile || '')} readOnly /></div>
                <div className="form-group"><label>Email Address</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} /></div>
                <div className="form-group"><label>Gender</label>
                  <select value={form.gender?.toLowerCase() || ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Occupation</label>
                  <select value={form.occupation || ''} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}>
                    <option value="">Select occupation</option>
                    <option value="Farmer">Farmer</option><option value="Agri Dealer">Agri Dealer</option><option value="Agronomist">Agronomist</option><option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Farm Size (Acres)</label><input type="text" value={form.farm_size || ''} onChange={e => setForm(f => ({ ...f, farm_size: e.target.value }))} /></div>
                <div className="form-group"><label>Primary Crop</label><input type="text" value={form.primary_crop || ''} onChange={e => setForm(f => ({ ...f, primary_crop: e.target.value }))} /></div>
              </div>
              <button className="save-btn" disabled={saving} onClick={saveProfile}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</button>
              {saveMsg && <div className="save-msg" style={{ display: 'block', background: saveMsg.t === 'ok' ? '#e8f5e9' : '#ffebee', color: saveMsg.t === 'ok' ? '#1b5e20' : '#c62828' }}>{saveMsg.m}</div>}
            </div>
          )}

          {/* ADDRESSES */}
          {section === 'addresses' && (
            <div className="card">
              <h3>📍 Saved Addresses</h3>
              {addresses.length === 0 && <p style={{ color: '#999', fontSize: 14 }}>No saved addresses yet.</p>}
              {addresses.map(a => (
                <div key={a.id} className={'address-card' + (a.is_default ? ' default' : '')}>
                  <span className="addr-tag">{a.address_type}{a.is_default ? ' • Default' : ''}</span>
                  <h5>{a.full_name}</h5>
                  <p>{a.address_line1}{a.address_line2 ? ', ' + a.address_line2 : ''}, {a.city}, {a.state} — {a.pincode}</p>
                  <p style={{ marginTop: 4, fontSize: 12, color: '#2e7d32' }}>📱 {a.mobile}</p>
                  <div className="addr-actions">
                    <button className="addr-btn del" onClick={() => deleteAddress(a.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: '#f9fbe7', border: '2px dashed #2e7d32', color: '#2e7d32', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 4 }}>+ Add New Address</button>
              {showAddForm && (
                <div style={{ marginTop: 20, borderTop: '2px solid #e8f5e9', paddingTop: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1b5e20', marginBottom: 14 }}>New Address</h4>
                  <div className="form-grid">
                    {[['Full Name', 'full_name', 'text'], ['Mobile', 'mobile', 'tel'], ['Address Line 1', 'address_line1', 'text'], ['Address Line 2', 'address_line2', 'text'], ['City', 'city', 'text'], ['State', 'state', 'text'], ['Pincode', 'pincode', 'text']].map(([l, k, t]) => (
                      <div key={k} className={'form-group' + (['address_line1', 'address_line2'].includes(k) ? ' full' : '')}>
                        <label>{l}</label>
                        <input type={t} value={addrForm[k]} onChange={e => setAddrForm(f => ({ ...f, [k]: e.target.value }))} />
                      </div>
                    ))}
                    <div className="form-group"><label>Address Type</label>
                      <select value={addrForm.address_type} onChange={e => setAddrForm(f => ({ ...f, address_type: e.target.value }))}>
                        <option value="HOME">🏠 Home</option><option value="WORK">💼 Work</option><option value="OTHER">📍 Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button className="save-btn" onClick={saveAddress}>💾 Save Address</button>
                    <button onClick={() => setShowAddForm(false)} style={{ background: '#f5f5f5', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
