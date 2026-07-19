import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Pagination, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const STATUS_STYLE = {
  approved: { bg: '#f0fdf4', color: '#16a34a' },
  pending:  { bg: '#fefce8', color: '#92400e' },
  rejected: { bg: '#fef2f2', color: '#dc2626' },
};

export default function AdminVendors() {
  const [vendors, setVendors]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [statusF, setStatusF]     = useState('approved');
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);
  const [detail, setDetail]       = useState(null);
  const [rejectId, setRejectId]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy]     = useState(false);
  const [err, setErr]             = useState('');

  useEffect(() => { load(); }, [page, limit, statusF]);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await adminApi.getVendors({ status: statusF, page, limit });
      if (res.success) {
        setVendors(res.data || []);
        setTotal(res.data?.length || 0);
      } else {
        setErr(res.message || 'Failed to load vendors');
        setVendors([]);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load vendors');
      setVendors([]);
    }
    setLoading(false);
  }

  async function approve(id) {
    setActionBusy(true);
    try {
      const res = await adminApi.approveVendor(id);
      if (res.success) {
        setVendors(vs => vs.filter(v => v.id !== id));
        setDetail(null);
      }
    } catch {}
    setActionBusy(false);
  }

  async function reject() {
    if (!rejectReason.trim()) return;
    setActionBusy(true);
    try {
      const res = await adminApi.rejectVendor(rejectId, rejectReason);
      if (res.success) {
        setVendors(vs => vs.filter(v => v.id !== rejectId));
        setDetail(null);
      }
    } catch {}
    setRejectId(null);
    setRejectReason('');
    setActionBusy(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Vendors" sub={`${total} ${statusF} vendors`} />

      <div className="a-card">
        <div className="a-filter-bar">
          {['approved', 'pending', 'rejected'].map(s => (
            <button key={s} className={`a-btn a-btn-sm ${statusF === s ? 'a-btn-pri' : 'a-btn-sec'}`}
              onClick={() => { setStatusF(s); setPage(1); }}
              style={{ textTransform: 'capitalize' }}>
              {s === 'approved' ? '✅' : s === 'pending' ? '⏳' : '❌'} {s}
            </button>
          ))}
          <select className="a-input a-select" value={limit} onChange={e => setLimit(+e.target.value)} style={{ maxWidth: 130, marginLeft: 'auto' }}>
            {[10, 25, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, margin: '0 0 12px' }}>⚠️ {err}</div>}

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Business</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>GST</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3].map(i => <tr key={i}><td colSpan={9}><Skel h={40} /></td></tr>)
                : vendors.length === 0
                ? <tr><td colSpan={9}><Empty icon="🏪" title={`No ${statusF} vendors`} /></td></tr>
                : vendors.map((v, i) => (
                  <motion.tr key={v.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td style={{ color: 'var(--atx3)', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>{(page-1)*limit + i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1b5e20,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                          {(v.business_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{v.business_name}</div>
                          {v.vendor_code && <div style={{ fontSize: 11, color: 'var(--atx3)' }}>{v.vendor_code}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--atx2)', fontSize: 13 }}>{v.owner_name}</td>
                    <td style={{ color: 'var(--atx2)' }}>📱 {v.mobile}</td>
                    <td style={{ color: 'var(--atx2)', fontSize: 12 }}>{v.email}</td>
                    <td style={{ color: 'var(--atx2)', fontSize: 13 }}>📍 {v.city || '—'}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--atx2)' }}>{v.gst_number || '—'}</td>
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

      {/* DETAIL MODAL */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Vendor Details"
        footer={
          detail?.status === 'pending' ? (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button className="a-btn a-btn-danger" style={{ flex: 1 }} disabled={actionBusy}
                onClick={() => { setRejectId(detail.id); setDetail(null); }}>
                ❌ Reject
              </button>
              <button className="a-btn a-btn-pri" style={{ flex: 1 }} disabled={actionBusy}
                onClick={() => approve(detail.id)}>
                {actionBusy ? '⏳ Processing...' : '✅ Approve'}
              </button>
            </div>
          ) : (
            <button className="a-btn a-btn-sec" onClick={() => setDetail(null)}>Close</button>
          )
        }
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#1b5e20,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                {(detail.business_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{detail.business_name}</div>
                <div style={{ fontSize: 12, color: 'var(--atx2)', marginTop: 2 }}>
                  {detail.vendor_code && <span style={{ marginRight: 10 }}>Code: {detail.vendor_code}</span>}
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: STATUS_STYLE[detail.status]?.bg, color: STATUS_STYLE[detail.status]?.color, textTransform: 'capitalize' }}>{detail.status}</span>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['👤 Owner',    detail.owner_name],
                ['📱 Phone',    detail.mobile],
                ['✉️ Email',    detail.email || detail.user_email],
                ['📍 City',     [detail.city, detail.state].filter(Boolean).join(', ') || '—'],
                ['🏢 Address',  detail.address || '—'],
                ['📌 Pincode',  detail.pincode || '—'],
                ['🧾 GST',      detail.gst_number || '—'],
                ['🪪 PAN',      detail.pan_number || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'var(--ab3)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--atx3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Documents */}
            {detail.documents?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--atx2)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>📎 Documents</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {detail.documents.map((doc, i) => (
                    <a key={i} href={doc.document_url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 16px', background: 'var(--ab3)', border: '1px solid var(--abord)', borderRadius: 10, textDecoration: 'none', color: 'var(--atx)', fontSize: 12, fontWeight: 600 }}>
                      <span style={{ fontSize: 22 }}>📄</span>
                      {doc.document_type}
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
      <Modal open={!!rejectId} onClose={() => { setRejectId(null); setRejectReason(''); }} title="Reject Vendor"
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
          <p style={{ fontSize: 13, color: 'var(--atx2)', margin: 0 }}>Please provide a reason for rejection. This will be sent to the vendor.</p>
          <textarea className="a-input" rows={4} placeholder="e.g. Incomplete documents, invalid GST number..."
            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            style={{ resize: 'vertical' }} />
        </div>
      </Modal>
    </AdminLayout>
  );
}
