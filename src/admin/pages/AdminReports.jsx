import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader } from '../components/AdminUI';
import adminApi from '../services/adminApi';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getReports().then(res => {
      if (res.success) setData(res.data);
      else setError(res.message || 'Failed to load reports');
      setLoading(false);
    }).catch(e => { setError(e.message || 'Network error'); setLoading(false); });
  }, []);

  const monthly    = data?.monthly    || [];
  const daily      = data?.daily      || [];
  const topProducts= data?.topProducts|| [];
  const summary    = data?.summary    || {};

  return (
    <AdminLayout>
      <PageHeader title="Reports & Analytics" sub="Revenue, orders, and product performance" />

      {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>⏳ Loading reports...</div>}
      {error   && <div style={{ padding: 16, background: '#ffebee', color: '#c62828', borderRadius: 10 }}>❌ {error}</div>}

      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 24 }}>
            {[
              ['₹' + Number(summary.total_revenue || 0).toLocaleString('en-IN'), 'Total Revenue'],
              [summary.total_orders || 0, 'Total Orders'],
            ].map(([v, l]) => (
              <div key={l} className="a-card a-card-p" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--atx)' }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--atx2)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="a-card a-card-p">
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Revenue Trend (6 months)</h3>
              <div className="a-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly}>
                    <defs><linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2e7d32" stopOpacity={0.2}/><stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--abord)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--atx2)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--atx2)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => ['₹' + Number(v).toLocaleString('en-IN'), 'Revenue']} contentStyle={{ background: 'var(--ab)', border: '1px solid var(--abord)', borderRadius: 10, fontSize: 12 }} />
                    <Area type="monotone" dataKey="rev" stroke="#2e7d32" strokeWidth={2.5} fill="url(#rg2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="a-card a-card-p">
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Daily Revenue (7 days)</h3>
              <div className="a-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--abord)" />
                    <XAxis dataKey="d" tick={{ fontSize: 11, fill: 'var(--atx2)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--atx2)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => ['₹' + Number(v).toLocaleString('en-IN'), 'Revenue']} contentStyle={{ background: 'var(--ab)', border: '1px solid var(--abord)', borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="rev" fill="#f9a825" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="a-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--abord)', fontWeight: 800, fontSize: 15 }}>🔥 Top Products</div>
            {topProducts.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>No sales data yet.</div>
              : (
                <div className="a-table-wrap">
                  <table className="a-table">
                    <thead><tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 800, color: 'var(--atx3)' }}>#{i + 1}</td>
                          <td style={{ fontWeight: 700 }}>{p.name}</td>
                          <td style={{ fontWeight: 700 }}>{p.units}</td>
                          <td style={{ fontWeight: 700, color: 'var(--apri)' }}>₹{Number(p.revenue).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </>
      )}
    </AdminLayout>
  );
}
