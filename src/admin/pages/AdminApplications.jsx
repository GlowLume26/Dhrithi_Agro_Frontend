import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Skel, Empty, StatusBadge } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const TABS = ['pending','approved','rejected'];

export default function AdminApplications() {
  const [tab, setTab]         = useState('pending');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing]   = useState(false);

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      const r = await adminApi.getVendors({ status: tab });
      if (r.success) setVendors(r.data ?? []);
    } catch { setVendors([]); }
    setLoading(false);
  }

  async function approve(id) {
    setActing(true);
    await adminApi.approveVendor(id).catch(() => {});
    setSelected(null); load();
    setActing(false);
  }

  async function reject(id) {
    if (!rejectReason.trim()) return alert('Enter rejection reason');
    setActing(true);
    await adminApi.rejectVendor(id, rejectReason).catch(() => {});
    setSelected(null); setRejectReason(''); load();
    setActing(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Applications" sub="Vendor & manufacturer document verification" />

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t} className={`a-btn ${tab===t?'a-btn-pri':'a-btn-sec'}`}
            onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>
            {t === 'pending' ? '⏳' : t === 'approved' ? '✅' : '❌'} {t}
          </button>
        ))}
      </div>

      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>#</th><th>Business</th><th>Owner</th><th className="hide-mobile">Mobile</th><th className="hide-mobile">Type</th><th className="hide-mobile">Docs</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? [0,1,2].map(i => <tr key={i}><td colSpan={8}><Skel h={40}/></td></tr>)
                : vendors.length === 0
                ? <tr><td colSpan={8}><Empty icon="📋" title={`No ${tab} applications`} /></td></tr>
                : vendors.map((v, i) => (
                  <motion.tr key={v.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
                    <td style={{ color:'var(--atx3)', fontSize:12 }}>{i+1}</td>
                    <td>
                      <div style={{ fontWeight:700 }}>{v.business_name}</div>
                      <div style={{ fontSize:11, color:'var(--atx3)' }}>{v.vendor_code || 'No code yet'}</div>
                    </td>
                    <td style={{ fontSize:13 }}>{v.owner_name}</td>
                    <td className="hide-mobile" style={{ fontSize:13 }}>{v.mobile}</td>
                    <td className="hide-mobile">
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#eff6ff', color:'#1d4ed8' }}>
                        {v.vendor_type === 'buyer' ? '🛒 Buyer' : '🏪 Seller'}
                      </span>
                    </td>
                    <td className="hide-mobile" style={{ fontSize:13, textAlign:'center' }}>{v.doc_count || 0}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td>
                      <button className="a-btn a-btn-sm a-btn-sec" onClick={() => { setSelected(v); setRejectReason(''); }}>
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background:'var(--ab)', borderRadius:16, padding:28, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:17, fontWeight:800 }}>📋 Application Details</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--atx3)' }}>✕</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:13, marginBottom:20 }}>
              {[['Business', selected.business_name], ['Owner', selected.owner_name], ['Mobile', selected.mobile],
                ['Email', selected.email || selected.user_email], ['GST', selected.gst_number || '—'],
                ['PAN', selected.pan_number || '—'], ['City', selected.city || '—'], ['State', selected.state || '—'],
                ['Type', selected.vendor_type], ['Status', selected.status]
              ].map(([k,v]) => (
                <div key={k} style={{ background:'var(--ab3)', borderRadius:8, padding:'8px 12px' }}>
                  <div style={{ fontSize:11, color:'var(--atx3)', marginBottom:2 }}>{k}</div>
                  <div style={{ fontWeight:600, color:'var(--atx)' }}>{v || '—'}</div>
                </div>
              ))}
            </div>

            {selected.documents?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--atx2)', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Documents ({selected.documents.length})</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {selected.documents.map((d, i) => (
                    <a key={i} href={d.document_url} target="_blank" rel="noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:6, background:'var(--ab3)', border:'1px solid var(--abord)', borderRadius:8, padding:'6px 12px', fontSize:12, color:'var(--apri)', textDecoration:'none', fontWeight:600 }}>
                      📄 {d.document_type}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selected.status === 'pending' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <button className="a-btn a-btn-pri" disabled={acting} onClick={() => approve(selected.id)}
                  style={{ background:'#16a34a' }}>
                  {acting ? '⏳' : '✅ Approve Application'}
                </button>
                <textarea className="a-input" rows={2} placeholder="Rejection reason (required to reject)..."
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <button className="a-btn" disabled={acting} onClick={() => reject(selected.id)}
                  style={{ background:'#dc2626', color:'white', border:'none', padding:'10px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>
                  {acting ? '⏳' : '❌ Reject Application'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
