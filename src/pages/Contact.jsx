import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function submit(e) {
    e.preventDefault();
    setSent(true);
  }

  const INFO = [
    { icon: '📞', title: 'Farmer Helpline',  val: '1800-XXX-XXXX',          sub: 'Mon–Sat, 9 AM – 6 PM' },
    { icon: '📧', title: 'Email Support',    val: 'support@drithiagro.com', sub: 'Reply within 24 hours' },
    { icon: '📍', title: 'Head Office',      val: 'Pune, Maharashtra',       sub: 'India — 411001' },
    { icon: '🕐', title: 'Working Hours',    val: 'Mon – Sat',               sub: '9:00 AM – 6:00 PM IST' },
  ];

  return (
    <div style={{ paddingTop: 56 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', padding: '50px 40px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📞</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>Contact Us</h1>
        <p style={{ fontSize: 15, opacity: 0.85, maxWidth: 500, margin: '0 auto' }}>Have a question? We're here to help. Reach out and we'll get back to you as soon as possible.</p>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, maxWidth: 1000, margin: '0 auto', padding: '32px 40px 0' }}>
        {INFO.map(i => (
          <div key={i.title} style={{ background: 'white', borderRadius: 14, padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{i.icon}</div>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1b5e20', marginBottom: 4 }}>{i.title}</h4>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{i.val}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{i.sub}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '40px 40px 60px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1b5e20', marginBottom: 6, textAlign: 'center' }}>Send Us a Message</h2>
        <div style={{ width: 50, height: 3, background: '#f9a825', borderRadius: 2, margin: '0 auto 28px' }} />

        {sent ? (
          <div style={{ background: '#e8f5e9', borderRadius: 16, padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1b5e20', marginBottom: 8 }}>Message Sent!</h3>
            <p style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
            <button onClick={() => setSent(false)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Send Another</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'white', borderRadius: 16, padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['Full Name','name','text'],['Mobile','mobile','tel'],['Email Address','email','email']].map(([lbl,key,type], i) => (
                <div key={key} style={{ gridColumn: i === 2 ? '1/-1' : 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>{lbl}</label>
                  <input type={type} required value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
                    style={{ padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>Subject</label>
              <select value={form.subject} onChange={e => setForm(f => ({...f,subject:e.target.value}))} required
                style={{ padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                <option value="">Select a topic</option>
                <option>Order Issue</option>
                <option>Product Query</option>
                <option>Vendor Registration</option>
                <option>Payment Issue</option>
                <option>Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>Message</label>
              <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({...f,message:e.target.value}))}
                placeholder="Describe your query..."
                style={{ padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              📤 Send Message
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#888' }}>
          Looking for help? Visit our <Link to="/orders" style={{ color: '#2e7d32', fontWeight: 700 }}>Order Tracking</Link> or <Link to="/categories" style={{ color: '#2e7d32', fontWeight: 700 }}>Browse Products</Link>
        </div>
      </section>
    </div>
  );
}
