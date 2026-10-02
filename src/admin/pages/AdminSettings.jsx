import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const TABS = ['Business', 'Shipping', 'Tax'];

export default function AdminSettings() {
  const [tab, setTab]     = useState('Business');
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    adminApi.getSettings().then(res => {
      if (res.success) setSettings(res.data || {});
      else setError(res.message || 'Failed to load settings');
      setLoading(false);
    }).catch(() => { setError('Network error'); setLoading(false); });
  }, []);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true); setError(null);
    try {
      const res = await adminApi.updateSettings ? adminApi.updateSettings(settings) :
        await fetch((import.meta.env.VITE_API_BASE || '/api/index.php?route=') + 'settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('da_admin_token') },
          body: JSON.stringify(settings),
        }).then(r => r.json());
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
      else setError(res.message || 'Save failed');
    } catch { setError('Network error'); }
    setSaving(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Settings" sub="Configure your store preferences"
        actions={<button className="a-btn a-btn-pri" onClick={save} disabled={saving}>{saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}</button>}
      />

      {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>⏳ Loading settings...</div>}
      {error   && <div style={{ padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 10, marginBottom: 16 }}>❌ {error}</div>}

      {!loading && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--ab)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid var(--abord)' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '7px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: tab === t ? 'var(--apri)' : 'transparent', color: tab === t ? 'white' : 'var(--atx2)', transition: 'all 0.18s' }}
              >{t}</button>
            ))}
          </div>

          {tab === 'Business' && (
            <div className="a-card a-card-p">
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>🏢 Business Information</h3>
              <div className="a-form-grid">
                {[
                  ['company_name',    'Company Name'],
                  ['gst_number',      'GST Number'],
                  ['company_address', 'Address'],
                  ['support_phone',   'Support Phone'],
                  ['support_email',   'Support Email'],
                ].map(([k, l]) => (
                  <div key={k} className={`a-fg${k === 'company_address' ? ' full' : ''}`}>
                    <label>{l}</label>
                    <input className="a-input" value={settings[k] || ''} onChange={e => set(k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Shipping' && (
            <div className="a-card a-card-p">
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>🚚 Shipping Settings</h3>
              <div className="a-form-grid">
                <div className="a-fg">
                  <label>Delivery Charge (₹)</label>
                  <input className="a-input" type="number" value={settings['delivery_charge'] || ''} onChange={e => set('delivery_charge', e.target.value)} />
                </div>
                <div className="a-fg">
                  <label>Free Delivery Above (₹)</label>
                  <input className="a-input" type="number" value={settings['delivery_free_threshold'] || ''} onChange={e => set('delivery_free_threshold', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'Tax' && (
            <div className="a-card a-card-p">
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>🧾 Tax Configuration</h3>
              <div className="a-form-grid cols3">
                <div className="a-fg">
                  <label>Default GST Rate (%)</label>
                  <input className="a-input" type="number" value={settings['default_gst_rate'] || ''} onChange={e => set('default_gst_rate', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
