import { Link } from 'react-router-dom';

const TEAM = [
  { init: 'A', name: 'Arjun Mehta',   role: 'CEO & Co-Founder',      bio: 'Visionary leader with 15+ years in agri-tech. Passionate about empowering Indian farmers through technology.' },
  { init: 'P', name: 'Priya Nair',    role: 'CTO & Co-Founder',      bio: "Full-stack engineer and AI enthusiast. Built Drithi Agro's platform from the ground up to serve millions of farmers." },
  { init: 'S', name: 'Suresh Reddy',  role: 'Head of Agronomy',      bio: 'PhD in Agricultural Sciences. Guides farmers with expert crop advice and leads our agri-consultation team.' },
  { init: 'M', name: 'Meera Joshi',   role: 'Head of Operations',    bio: 'Supply chain expert ensuring on-time delivery across 28 states. Obsessed with farmer satisfaction.' },
];

const STATS = [
  { num: '5L+',    lbl: 'Happy Farmers' },
  { num: '10,000+',lbl: 'Products' },
  { num: '28',     lbl: 'States Covered' },
  { num: '500+',   lbl: 'Trusted Brands' },
];

const VALUES = [
  { icon: '🌾', title: 'Farmer First',      desc: 'Every decision we make is centred around what is best for the Indian farmer.' },
  { icon: '✅', title: 'Quality Assured',   desc: 'All products are verified and sourced directly from authorised manufacturers.' },
  { icon: '💰', title: 'Fair Pricing',      desc: 'We ensure farmers always get the best market prices without middlemen.' },
  { icon: '🚚', title: 'Reliable Delivery', desc: 'Fast, dependable delivery across 28 states in 2–5 business days.' },
  { icon: '🌿', title: 'Sustainability',    desc: 'We promote eco-friendly farming practices and organic products.' },
  { icon: '🤝', title: 'Community',         desc: 'Building a strong network of farmers, vendors and agri-experts together.' },
];

export default function About() {
  return (
    <div style={{ paddingTop: 56 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', padding: '60px 40px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🌾</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>About Drithi Agro</h1>
        <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.7 }}>
          India's most trusted agri-commerce platform — connecting farmers with quality products, expert advice and fair markets since 2022.
        </p>
        <Link to="/categories" style={{ background: '#f9a825', color: '#1b5e20', padding: '12px 28px', borderRadius: 30, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
          🛒 Shop Now
        </Link>
      </div>

      {/* Stats */}
      <div style={{ background: '#f9a825', padding: '24px 40px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
        {STATS.map(s => (
          <div key={s.lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20' }}>{s.num}</div>
            <div style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <section style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto' }} id="mission">
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 16, textAlign: 'center' }}>Our Mission</h2>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 28px' }} />
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, textAlign: 'center', maxWidth: 700, margin: '0 auto 20px' }}>
          🌱 Founded in 2022, Drithi Agro was born from a simple belief: <strong>every Indian farmer deserves access to quality inputs at fair prices.</strong>
        </p>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          We bridge the gap between farmers and manufacturers — cutting out middlemen, reducing costs and ensuring genuine products reach the people who grow our food.
        </p>
      </section>

      {/* Values */}
      <section style={{ padding: '50px 40px', background: '#f9fbe7' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 8, textAlign: 'center' }}>Our Values</h2>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 36px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {VALUES.map(v => (
            <div key={v.title} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: 38, marginBottom: 12 }}>{v.icon}</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1b5e20', marginBottom: 8 }}>{v.title}</h4>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '60px 40px', maxWidth: 1000, margin: '0 auto' }} id="team">
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 8, textAlign: 'center' }}>Our Team</h2>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 36px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
          {TEAM.map(m => (
            <div key={m.name} style={{ background: 'white', borderRadius: 16, padding: '28px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1b5e20,#43a047)', color: 'white', fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{m.init}</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>{m.name}</h4>
              <div style={{ fontSize: 12, color: '#2e7d32', fontWeight: 700, marginBottom: 10 }}>{m.role}</div>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '50px 40px', background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Join the Drithi Agro Family</h2>
        <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 24 }}>Whether you're a farmer looking for quality inputs or a vendor wanting to grow your business.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/categories" style={{ background: '#f9a825', color: '#1b5e20', padding: '12px 28px', borderRadius: 30, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>🛒 Shop Now</Link>
          <Link to="/vendor/register" style={{ background: 'transparent', color: 'white', padding: '12px 28px', borderRadius: 30, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '2px solid white' }}>🏪 Become a Vendor</Link>
        </div>
      </section>
    </div>
  );
}
