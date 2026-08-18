import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Skel, Empty } from '../components/AdminUI';
import { MODULE_LABELS, ALL_MODULES } from '../utils/constants';
import adminApi from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

const MANAGEABLE = ALL_MODULES.filter(m => m !== 'dashboard' && m !== 'access_control');

export default function AdminAccessControl() {
  const { admin } = useAdminAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(null);
  const [audit, setAudit]       = useState([]);
  const [tab, setTab]           = useState('permissions');
  const [permsMap, setPermsMap] = useState({}); // { userId: { module: bool } }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getPermissionUsers();
      if (res.success) {
        setUsers(res.data);
        const map = {};
        res.data.forEach(u => { map[u.id] = u.permissions || {}; });
        setPermsMap(map);
      }
    } catch {}
    setLoading(false);
  }

  async function loadAudit() {
    try {
      const res = await adminApi.getPermissionAudit();
      if (res.success) setAudit(res.data);
    } catch {}
  }

  function toggle(userId, module) {
    setPermsMap(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [module]: !prev[userId]?.[module] }
    }));
  }

  async function save(userId) {
    setSaving(userId);
    try {
      await adminApi.setUserPermissions(userId, permsMap[userId] || {});
    } catch {}
    setSaving(null);
  }

  if (admin?.role !== 'owner') {
    return (
      <AdminLayout>
        <div className="a-empty"><div className="a-empty-icon">🔒</div><h4>Owner Only</h4><p style={{fontSize:13,color:'var(--atx2)'}}>Only the Owner can manage permissions.</p></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader title="Access Control" sub="Owner-only: manage module permissions per user" />

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['permissions','🔐 Permissions'],['audit','📋 Audit Log']].map(([id,label]) => (
          <button key={id} className={`a-btn ${tab===id?'a-btn-pri':'a-btn-sec'}`}
            onClick={() => { setTab(id); if(id==='audit') loadAudit(); }}>{label}</button>
        ))}
      </div>

      {tab === 'permissions' && (
        <div className="a-card">
          {loading ? <div style={{padding:24}}><Skel h={40}/></div> : users.length === 0 ? <Empty icon="👥" title="No admin users found" /> : (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th style={{minWidth:160}}>User</th>
                    {MANAGEABLE.map(m => (
                      <th key={m} style={{fontSize:10,minWidth:90,textAlign:'center'}}>{MODULE_LABELS[m]||m}</th>
                    ))}
                    <th>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{fontWeight:700,fontSize:13}}>{u.name}</div>
                        <div style={{fontSize:11,color:'var(--atx3)',textTransform:'capitalize'}}>{u.role}</div>
                      </td>
                      {MANAGEABLE.map(m => {
                        const isOwner = u.role === 'owner';
                        const on = isOwner ? true : !!(permsMap[u.id]?.[m]);
                        return (
                          <td key={m} style={{textAlign:'center'}}>
                            <button
                              onClick={() => !isOwner && toggle(u.id, m)}
                              style={{
                                width:36, height:20, borderRadius:10, border:'none', cursor: isOwner?'default':'pointer',
                                background: on ? '#2e7d32' : '#e2e8f0',
                                transition:'background 0.2s', position:'relative', opacity: isOwner?0.6:1
                              }}
                              title={isOwner ? 'Owner always has access' : (on ? 'Revoke' : 'Grant')}
                            >
                              <span style={{
                                position:'absolute', top:2, left: on?18:2,
                                width:16, height:16, borderRadius:'50%', background:'white',
                                transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
                              }}/>
                            </button>
                          </td>
                        );
                      })}
                      <td>
                        {u.role !== 'owner' && (
                          <button className="a-btn a-btn-sm a-btn-pri" onClick={() => save(u.id)} disabled={saving===u.id}>
                            {saving===u.id ? '⏳' : '💾 Save'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="a-card">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Date</th><th>Changed By</th><th>User</th><th>Module</th><th>From</th><th>To</th></tr></thead>
              <tbody>
                {audit.length === 0
                  ? <tr><td colSpan={6}><Empty icon="📋" title="No audit logs yet" /></td></tr>
                  : audit.map(a => (
                    <tr key={a.id}>
                      <td style={{fontSize:12,color:'var(--atx2)'}}>{new Date(a.created_at).toLocaleString('en-IN')}</td>
                      <td style={{fontWeight:600}}>{a.changed_by_name}</td>
                      <td>{a.target_user_name}</td>
                      <td><code style={{fontSize:11,background:'var(--ab3)',padding:'2px 6px',borderRadius:4}}>{a.module}</code></td>
                      <td><span style={{color:a.old_value?'#16a34a':'#dc2626',fontWeight:700}}>{a.old_value===null?'—':a.old_value?'ON':'OFF'}</span></td>
                      <td><span style={{color:a.new_value?'#16a34a':'#dc2626',fontWeight:700}}>{a.new_value?'ON':'OFF'}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
