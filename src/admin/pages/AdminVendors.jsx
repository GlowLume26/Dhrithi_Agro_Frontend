import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const STATUS_STYLE = {
  approved: { bg: '#f0fdf4', color: '#16a34a' },
  pending:  { bg: '#fefce8', color: '#92400e' },
  rejected: { bg: '#fef2f2', color: '#dc2626' },
};

export default function AdminVendors() {
  const [vendorTab, setVendorTab]       = useState('seller');
  const [mainTab, setMainTab]           = useState('vendors');
  const [vendors, setVendors]           = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [statusF, setStatusF]           = useState('pending');
  const [page, setPage]                 = useState(1);
  const [limit, setLimit]               = useState(10);
  const [detail, setDetail]             = useState(null);
  const [rejectId, setRejectId]         = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy]     = useState(false);
  const [err, setErr]                   = useState('');
  // Commission
  const [commRates, setCommRates]       = useState([]);
  const [commLoading, setCommLoading]   = useState(false);
  const [editingRate, setEditingRate]   = useState({}); // { [id]: newRate }
  const [savingId, setSavingId]         = useState(null);

  useEffect(() => { load(); }, [page, limit, statusF, vendorTab]);

  useEffect(() => {
    if (mainTab === 'commission' && commRates.length === 0) loadCommission();
  }, [mainTab]);

  async function load() {
    setLoading(true); setErr('');
    try {
      const res = await adminApi.getVendors({ status: statusF, page, limit, type: vendorTab });
      if (res.success) { setVendors(res.data || []); setTotal(res.data?.length || 0); }
      else { setErr(res.message || 'Failed to load'); setVendors([]); }
    } catch { setErr('Failed to load vendors'); setVendors([]); }
    setLoading(false);
  }

  async function loadCommission() {
    setCommLoading(true);
    try {
      const res = await adminApi.getCommissionRates();
      if (res.success) setCommRates(res.data || []);
    } catch {}
    setCommLoading(false);
  }

  async function saveRate(id) {
    const rate = parseFloat(editingRate[id]);
    if (!rate || rate <= 0 || rate > 100) return;
    setSavingId(id);
    try {
      const res = await adminApi.updateCommissionRate(id, rate);
      if (res.success) {
        setCommRates(rs => rs.map(r => r.id === id ? { ...r, rate } : r));
        setEditingRate(e => { const n = { ...e }; delete n[id]; return n; });
      }
    } catch {}
    setSavingId(null);
  }

  async function approve(id) {
    setActionBusy(true);
    try {
      const res = await adminApi.approveVendor(id);
      if (res.success) { setVendors(vs => vs.filter(v => v.id !== id)); setDetail(null); }
    } catch {}
    setActionBusy(false);
  }

  async function reject() {
    if (!rejectReason.trim()) return;
    setActionBusy(true);
    try {
      const res = await adminApi.rejectVendor(rejectId, rejectReason);
      if (res.success) { setVendors(vs => vs.filter(v => v.id !== rejectId)); setDetail(null); }
    } catch {}
    setRejectId(null); setRejectReason(''); setActionBusy(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Vendors" sub="Manage buyers, sellers, and commission rates" />

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['vendors', '🏪 Vendors'], ['commission', '💰 Order Commission']].map(([id, label]) => (
          <button key={id} onClick={() => setMainTab(id)}
            className={`a-btn ${mainTab === id ? 'a-btn-pri' : 'a-btn-sec'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── ORDER COMMISSION TAB ── */}
      {mainTab === 'commission' && (
        <div className="a-card a-card-p">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--atx)', marginBottom: 4 }}>💰 Order Commission Policy</div>
            <div style={{ fontSize: 13, color: 'var(--atx2)' }}>Commission is charged on the final order value (excl. shipping). GST @ 18% applies on commission. Click a rate to edit it.</div>
          </div>
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Commission Rate</th>
                  <th>GST on Commission</th>
                  <th>Example (₹1000 order)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {commLoading
                  ? [0,1,2,3,4].map(i => <tr key={i}><td colSpan={6}><Skel h={36} /></td></tr>)
                  : commRates.length === 0
                  ? <tr><td colSpan={6}><Empty icon="💰" title="No commission rates found" /></td></tr>
                  : commRates.map((r, i) => {
                      const rate = parseFloat(editingRate[r.id] ?? r.rate);
                      const comm = (1000 * rate) / 100;
                      const gst  = comm * (parseFloat(r.gst_on_comm) / 100);
                      const isEditing = r.id in editingRate;
                      return (
                        <tr key={r.id}>
                          <td style={{ color: 'var(--atx3)', fontWeight: 600, textAlign: 'center' }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{r.category}</td>
                          <td>
                            {isEditing ? (
                              <input type="number" min="0.1" max="100" step="0.1"
                                value={editingRate[r.id]}
                                onChange={e => setEditingRate(prev => ({ ...prev, [r.id]: e.target.value }))}
                                style={{ width: 70, padding: '4px 8px', border: '1.5px solid var(--apri)', borderRadius: 7, fontSize: 13, fontWeight: 700, outline: 'none' }}
                              />
                            ) : (
                              <span style={{ background: '#e8f5e9', color: '#1b5e20', fontWeight: 800, padding: '3px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}
                                onClick={() => setEditingRate(prev => ({ ...prev, [r.id]: r.rate }))}>
                                {r.rate}%
                              </span>
                            )}
                          </td>
                          <td style={{ color: 'var(--atx2)', fontSize: 13 }}>{r.gst_on_comm}%</td>
                          <td style={{ fontSize: 13, color: 'var(--atx2)' }}>
                            Comm: <b>₹{comm.toFixed(2)}</b> + GST: <b>₹{gst.toFixed(2)}</b> = Payout: <b style={{ color: '#1b5e20' }}>₹{(1000 - comm - gst).toFixed(2)}</b>
                          </td>
                          <td>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="a-btn a-btn-sm a-btn-pri" disabled={savingId === r.id} onClick={() => saveRate(r.id)}>
                                  {savingId === r.id ? '⏳' : '✅ Save'}
                                </button>
                                <button className="a-btn a-btn-sm a-btn-sec"
                                  onClick={() => setEditingRate(prev => { const n = { ...prev }; delete n[r.id]; return n; })}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button className="a-btn a-btn-sm a-btn-sec"
                                onClick={() => setEditingRate(prev => ({ ...prev, [r.id]: r.rate }))}>
                                ✏️ Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(46,125,50,0.07)', borderRadius: 10, fontSize: 13, color: 'var(--atx2)', lineHeight: 1.7 }}>
            <b style={{ color: 'var(--atx)' }}>📋 Payout Formula:</b><br />
            Payout = Order Value − (Order Value × Commission%) − (Commission Amount × GST%)<br />
            Payouts are processed every <b>Monday</b> for the previous week's settled orders.
          </div>
        </div>
      )}

      {/* ── VENDORS TAB ── */}
      {mainTab === 'vendors' && (
        <div className="a-card">
          <div className="a-filter-bar" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', background: 'var(--ab3)', borderRadius: 10, padding: 3, gap: 2 }}>
              {[['seller', '🏪 Sellers'], ['buyer', '🛒 Buyers']].map(([id, label]) => (
                <button key={id} onClick={() => { setVendorTab(id); setPage(1); }}
                  style={{ padding: '7px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: vendorTab === id ? 'var(--apri)' : 'transparent', color: vendorTab === id ? 'white' : 'var(--atx2)', transition: 'all 0.18s' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {['pending', 'approved', 'rejected'].map(s => (
                <button key={s} className={`a-btn a-btn-sm ${statusF === s ? 'a-btn-pri' : 'a-btn-sec'}`}
                  onClick={() => { setStatusF(s); setPage(1); }}
                  style={{ textTransform: 'capitalize' }}>
                  {s === 'approved' ? '✅' : s === 'pending' ? '⏳' : '❌'} {s}
                </button>
              ))}
            </div>

            <select className="a-input a-select" value={limit} onChange={e => setLimit(+e.target.value)} style={{ maxWidth: 130, marginLeft: 'auto' }}>
              {[10, 25, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>

          {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, margin: '0 16px 12px' }}>⚠️ {err}</div>}

          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>#</th>
                  <th>{vendorTab === 'seller' ? 'Business' : 'Name'}</th>
                  <th className="hide-mobile">Owner</th>
                  <th className="hide-mobile">Phone</th>
                  <th className="hide-mobile">City</th>
                  {vendorTab === 'seller' && <th className="hide-mobile">GST</th>}
                  {vendorTab === 'seller' && <th className="hide-mobile">Licence</th>}
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [0,1,2,3].map(i => <tr key={i}><td colSpan={vendorTab === 'seller' ? 9 : 7}><Skel h={40} /></td></tr>)
                  : vendors.length === 0
                  ? <tr><td colSpan={vendorTab === 'seller' ? 9 : 7}><Empty icon={vendorTab === 'seller' ? '🏪' : '🛒'} title={`No ${statusF} ${vendorTab}s`} /></td></tr>
                  : vendors.map((v, i) => (
                    <motion.tr key={v.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <td style={{ color: 'var(--atx3)', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>{(page-1)*limit + i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: vendorTab === 'seller' ? 'linear-gradient(135deg,#1b5e20,#66bb6a)' : 'linear-gradient(135deg,#1565c0,#42a5f5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                            {(v.business_name || v.owner_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{v.business_name || v.owner_name}</div>
                            {v.vendor_code && <div style={{ fontSize: 11, color: 'var(--atx3)' }}>{v.vendor_code}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--atx2)', fontSize: 13 }}>{v.owner_name}</td>
                      <td className="hide-mobile" style={{ color: 'var(--atx2)' }}>📱 {v.mobile}</td>
                      <td className="hide-mobile" style={{ color: 'var(--atx2)', fontSize: 13 }}>📍 {v.city || '—'}</td>
                      {vendorTab === 'seller' && (
                        <td className="hide-mobile" style={{ fontSize: 12, fontFamily: 'monospace', color: v.gst_number ? 'var(--atx2)' : '#ef4444' }}>
                          {v.gst_number || '⚠️ Missing'}
                        </td>
                      )}
                      {vendorTab === 'seller' && (
                        <td className="hide-mobile" style={{ fontSize: 12, color: v.licence_number ? 'var(--atx2)' : '#ef4444' }}>
                          {v.licence_number || '⚠️ Missing'}
                        </td>
                      )}
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: STATUS_STYLE[v.status]?.bg, color: STATUS_STYLE[v.status]?.color, textTransform: 'capitalize' }}>
                          {v.status}
                        </span>
                      </td>
                      <td>
                        <button className="a-btn a-btn-sm a-btn-sec" onClick={() => setDetail(v)}>View</button>
                      </td>
                    </motion.tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} limit={limit} onChange={setPage} />
        </div>
      )}

      {/* DETAIL MODAL */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`${vendorTab === 'seller' ? 'Seller' : 'Buyer'} Details`}
        footer={
          detail?.status === 'pending' ? (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button className="a-btn a-btn-danger" style={{ flex: 1 }} disabled={actionBusy}
                onClick={() => { setRejectId(detail.id); setDetail(null); }}>❌ Reject</button>
              <button className="a-btn a-btn-pri" style={{ flex: 1 }} disabled={actionBusy}
                onClick={() => approve(detail.id)}>{actionBusy ? '⏳ Processing...' : '✅ Approve'}</button>
            </div>
          ) : (
            <button className="a-btn a-btn-sec" onClick={() => setDetail(null)}>Close</button>
          )
        }
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: vendorTab === 'seller' ? 'linear-gradient(135deg,#1b5e20,#66bb6a)' : 'linear-gradient(135deg,#1565c0,#42a5f5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                {(detail.business_name || detail.owner_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{detail.business_name || detail.owner_name}</div>
                <div style={{ fontSize: 12, color: 'var(--atx2)', marginTop: 2 }}>
                  {detail.vendor_code && <span style={{ marginRight: 10 }}>Code: {detail.vendor_code}</span>}
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: STATUS_STYLE[detail.status]?.bg, color: STATUS_STYLE[detail.status]?.color, textTransform: 'capitalize' }}>{detail.status}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
              {[
                ['👤 Owner',   detail.owner_name],
                ['📱 Phone',   detail.mobile],
                ['✉️ Email',   detail.email || detail.user_email || '—'],
                ['📍 City',    [detail.city, detail.state].filter(Boolean).join(', ') || '—'],
                ['🏢 Address', detail.address || '—'],
                ['📌 Pincode', detail.pincode || '—'],
                ...(vendorTab === 'seller' ? [
                  ['🧾 GST',     detail.gst_number    || '⚠️ Not provided'],
                  ['🪪 PAN',     detail.pan_number    || '—'],
                  ['📜 Licence', detail.licence_number || '⚠️ Not provided'],
                ] : [
                  ['🪪 PAN',    detail.pan_number || '—'],
                ]),
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'var(--ab3)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--atx3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-all', color: String(value).includes('⚠️') ? '#ef4444' : 'inherit' }}>{value}</div>
                </div>
              ))}
            </div>

            {detail.documents?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--atx2)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>📎 Documents</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {detail.documents.map((doc, i) => (
                    <a key={i} href={doc.document_url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 16px', background: 'var(--ab3)', border: '1px solid var(--abord)', borderRadius: 10, textDecoration: 'none', color: 'var(--atx)', fontSize: 12, fontWeight: 600 }}>
                      <span style={{ fontSize: 22 }}>📄</span>
                      {doc.document_type.replace(/_/g, ' ')}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, color: 'var(--atx3)' }}>
              Registered: {new Date(detail.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        )}
      </Modal>

      {/* REJECT MODAL */}
      <Modal open={!!rejectId} onClose={() => { setRejectId(null); setRejectReason(''); }} title="Reject Application"
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button className="a-btn a-btn-sec" style={{ flex: 1 }} onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancel</button>
            <button className="a-btn a-btn-danger" style={{ flex: 1 }} disabled={!rejectReason.trim() || actionBusy} onClick={reject}>
              {actionBusy ? '⏳...' : '❌ Confirm Reject'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--atx2)', margin: 0 }}>Please provide a reason for rejection. This will be sent to the applicant.</p>
          <textarea className="a-input" rows={4} placeholder="e.g. Incomplete documents, invalid GST number, missing licence..."
            value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </Modal>
    </AdminLayout>
  );
}
