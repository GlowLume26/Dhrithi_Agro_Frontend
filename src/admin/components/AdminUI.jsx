import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_COLORS } from '../utils/constants';

/* ── Skeleton ── */
export function Skel({ h = 16, w = '100%', r = 8 }) {
  return <div className="a-skel" style={{ height: h, width: w, borderRadius: r }} />;
}

/* ── Status Badge ── */
export function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
  return (
    <span className="a-badge" style={{ background: c.bg, color: c.color }}>
      <span className="a-badge-dot" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

/* ── KPI Card ── */
export function KpiCard({ icon, label, value, change, changeUp, iconBg, delay = 0 }) {
  return (
    <motion.div className="a-kpi"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="a-kpi-info">
        <h3>{value}</h3>
        <p>{label}</p>
        {change && (
          <div className="a-kpi-chg" style={{ color: changeUp ? '#16a34a' : '#dc2626' }}>
            {changeUp ? '↑' : '↓'} {change}
          </div>
        )}
      </div>
      <div className="a-kpi-icon" style={{ background: iconBg || '#f0fdf4' }}>{icon}</div>
    </motion.div>
  );
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, footer, large }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="a-modal-bg"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div className={`a-modal${large ? ' a-modal-lg' : ''}`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="a-modal-head">
              <h3>{title}</h3>
              <button onClick={onClose} className="a-icon-btn" style={{ border: 'none' }}>✕</button>
            </div>
            <div className="a-modal-body">{children}</div>
            {footer && <div className="a-modal-foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Pagination ── */
export function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit) || 1;
  if (pages <= 1) return null;
  const nums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);
  return (
    <div className="a-pagination">
      <span className="a-pg-count">Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
      <button className="a-pg-btn" onClick={() => onChange(page - 1)} disabled={page === 1}>‹</button>
      {nums[0] > 1 && <><button className="a-pg-btn" onClick={() => onChange(1)}>1</button><span style={{ color: 'var(--atx3)', fontSize: 12 }}>…</span></>}
      {nums.map(n => <button key={n} className={`a-pg-btn${n === page ? ' active' : ''}`} onClick={() => onChange(n)}>{n}</button>)}
      {nums[nums.length - 1] < pages && <><span style={{ color: 'var(--atx3)', fontSize: 12 }}>…</span><button className="a-pg-btn" onClick={() => onChange(pages)}>{pages}</button></>}
      <button className="a-pg-btn" onClick={() => onChange(page + 1)} disabled={page === pages}>›</button>
    </div>
  );
}

/* ── Confirm Delete Dialog ── */
export function ConfirmModal({ open, onClose, onConfirm, message = 'Are you sure you want to delete this?' }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete"
      footer={
        <>
          <button className="a-btn a-btn-sec" onClick={onClose}>Cancel</button>
          <button className="a-btn a-btn-danger" onClick={() => { onConfirm(); onClose(); }}>Delete</button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--atx2)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

/* ── Page header ── */
export function PageHeader({ title, sub, actions }) {
  return (
    <div className="a-page-header">
      <div>
        <h1 className="a-page-title">{title}</h1>
        {sub && <p className="a-page-sub">{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  );
}

/* ── Empty state ── */
export function Empty({ icon = '📭', title = 'No data found', sub }) {
  return (
    <div className="a-empty">
      <div className="a-empty-icon">{icon}</div>
      <h4>{title}</h4>
      {sub && <p style={{ fontSize: 13, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

/* ── Row actions ── */
export function RowActions({ onEdit, onDelete, onView }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {onView  && <button className="a-btn a-btn-sm a-btn-sec" onClick={onView}>👁</button>}
      {onEdit  && <button className="a-btn a-btn-sm a-btn-sec" onClick={onEdit}>✏️</button>}
      {onDelete && <button className="a-btn a-btn-sm a-btn-danger" onClick={onDelete}>🗑</button>}
    </div>
  );
}
