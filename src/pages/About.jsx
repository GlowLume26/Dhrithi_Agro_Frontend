import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ paddingTop: 56 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', padding: '60px 40px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🌱</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Welcome to Dhriti Mart</h1>
        <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 680, margin: '0 auto 24px', lineHeight: 1.8 }}>
          Dhriti Mart is a B2B agricultural marketplace designed to simplify the way businesses source and purchase agricultural products.
        </p>
        <Link to="/categories" style={{ background: '#f9a825', color: '#1b5e20', padding: '12px 28px', borderRadius: 30, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
          🛒 Explore Products
        </Link>
      </div>

      {/* What We Do */}
      <section style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 16, textAlign: 'center' }}>What We Do</h2>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 28px' }} />
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.9, textAlign: 'center', maxWidth: 720, margin: '0 auto 20px' }}>
          We connect <strong>retailers, dealers, distributors, agricultural businesses, and other industry partners</strong> with quality agricultural products through a convenient digital platform.
        </p>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.9, textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          From fertilizers and crop-care products to seeds and other farming essentials, Dhriti Mart helps businesses discover products, place orders, manage purchases, and streamline their agricultural supply needs.
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: '50px 40px', background: '#f9fbe7' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 8, textAlign: 'center' }}>Why Dhriti Mart</h2>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 36px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { icon: '🤝', title: 'B2B Focused', desc: 'Built exclusively for retailers, dealers, distributors, and agricultural businesses.' },
            { icon: '🌾', title: 'Quality Products', desc: 'Fertilizers, crop-care products, seeds, and farming essentials from trusted sources.' },
            { icon: '📦', title: 'Order Management', desc: 'Discover products, place orders, and manage purchases all in one place.' },
            { icon: '⚡', title: 'Streamlined Sourcing', desc: 'Simplify your agricultural supply chain with our digital platform.' },
            { icon: '🔍', title: 'Easy Discovery', desc: 'Find the right products quickly with smart search and category filters.' },
            { icon: '🚀', title: 'Future B2C', desc: 'Expanding into B2C services to bring Dhriti Mart closer to individual farmers.' },
          ].map(v => (
            <div key={v.title} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: 38, marginBottom: 12 }}>{v.icon}</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1b5e20', marginBottom: 8 }}>{v.title}</h4>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Goal */}
      <section style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 16 }}>Our Goal</h2>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 28px' }} />
        <p style={{ fontSize: 16, color: '#555', lineHeight: 1.9, maxWidth: 700, margin: '0 auto', fontStyle: 'italic' }}>
          "To make B2B agricultural commerce simpler, faster, more transparent, and more efficient."
        </p>
        <p style={{ fontSize: 14, color: '#888', marginTop: 20, lineHeight: 1.8, maxWidth: 680, margin: '20px auto 0' }}>
          We are currently focused on B2B solutions, with plans to expand into B2C services in the future, bringing Dhriti Mart closer to individual farmers and customers.
        </p>
      </section>

      {/* Powered by Chandhu Tech */}
      <section style={{ padding: '60px 40px', background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', color: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Powered by Chandhu Tech</h2>
            <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 24px' }} />
            <p style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
              Dhriti Mart is powered by <strong>Chandhu Tech</strong>, a technology company focused on building innovative digital solutions for modern businesses.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24, marginBottom: 40 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 24px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <h4 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10 }}>Our Vision</h4>
              <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
                To build technology that connects businesses, simplifies commerce, and creates meaningful digital experiences.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 24px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
              <h4 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10 }}>Our Mission</h4>
              <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
                To transform traditional business processes through reliable, scalable, and innovative technology.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 24px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
              <h4 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10 }}>What We Believe</h4>
              <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
                Technology should solve real-world problems and make business simpler, smarter, and more connected.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 32 }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Dhriti Mart × Chandhu Tech</p>
            <p style={{ fontSize: 14, opacity: 0.8 }}>Technology powering the future of agricultural commerce. 🌱</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '50px 40px', background: '#f9fbe7', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1b5e20', marginBottom: 12 }}>Ready to Get Started?</h2>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 24 }}>Join Dhriti Mart and streamline your agricultural business today.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/categories" style={{ background: '#2e7d32', color: 'white', padding: '12px 28px', borderRadius: 30, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>🛒 Browse Products</Link>
          <Link to="/contact" style={{ background: 'white', color: '#2e7d32', border: '2px solid #2e7d32', padding: '12px 28px', borderRadius: 30, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>📞 Contact Us</Link>
        </div>
      </section>
    </div>
  );
}
