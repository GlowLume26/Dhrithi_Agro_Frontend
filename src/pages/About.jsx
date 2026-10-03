import { Link } from 'react-router-dom';

const PLATFORM_FEATURES = [
  { icon: '🛒', title: 'B2B Marketplace', desc: 'Full product catalogue with categories, search, filters, and product detail pages built for business buyers.' },
  { icon: '📦', title: 'Order Management', desc: 'End-to-end order placement, tracking, status updates, and order history for every customer.' },
  { icon: '🧑‍💼', title: 'CRM & Admin Panel', desc: 'Complete admin dashboard to manage customers, vendors, orders, inventory, banners, and reports.' },
  { icon: '🏪', title: 'Vendor & Seller Portal', desc: 'Vendors can register, list products, manage stock, and track their sales through a dedicated dashboard.' },
  { icon: '📋', title: 'B2B Application System', desc: 'Buyers and sellers can apply with document uploads. Admin reviews and approves applications from the CRM.' },
  { icon: '🔐', title: 'OTP Authentication', desc: 'Secure mobile OTP-based login and registration — no passwords needed for customers.' },
  { icon: '📍', title: 'Address & Profile Management', desc: 'Customers can manage their profile, saved addresses, and account details from a clean account page.' },
  { icon: '❤️', title: 'Wishlist & Cart', desc: 'Full cart and wishlist functionality with real-time quantity management and checkout flow.' },
  { icon: '🏷️', title: 'Offers & Banners', desc: 'Dynamic homepage banners managed from admin — with product links, auto-slide, and manual navigation.' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Revenue reports, order trends, top products, and customer insights available in the admin panel.' },
  { icon: '🏭', title: 'Manufacturer & C&F Module', desc: 'Dedicated modules for manufacturers, C&F agents, stock management, and supply chain tracking.' },
  { icon: '🌐', title: 'Cloud Deployed', desc: 'Frontend on Netlify, backend API on Render, database on PostgreSQL — fully cloud-native architecture.' },
];

export default function About() {
  return (
    <div style={{ paddingTop: 56 }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', padding: '60px 40px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🌱</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Welcome to Dhriti Mart</h1>
        <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 680, margin: '0 auto 24px', lineHeight: 1.8 }}>
          A B2B agricultural marketplace designed to simplify the way businesses source and purchase agricultural products — built and powered by Chandhu Tech.
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

      {/* What We Built */}
      <section style={{ padding: '50px 40px', background: '#f9fbe7' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 8, textAlign: 'center' }}>What We Built</h2>
        <p style={{ fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 8 }}>A complete end-to-end agricultural commerce platform</p>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 36px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
          {PLATFORM_FEATURES.map(v => (
            <div key={v.title} style={{ background: 'white', borderRadius: 16, padding: '22px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 30, flexShrink: 0, marginTop: 2 }}>{v.icon}</div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1b5e20', marginBottom: 6 }}>{v.title}</h4>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
              </div>
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

      {/* Leadership */}
      <section style={{ padding: '50px 40px', background: '#f9fbe7' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', marginBottom: 8, textAlign: 'center' }}>Leadership</h2>
        <div style={{ width: 60, height: 4, background: '#f9a825', borderRadius: 2, margin: '0 auto 36px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, maxWidth: 800, margin: '0 auto' }}>

          {/* Sindhu Raj */}
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1b5e20,#43a047)', color: 'white', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(46,125,50,0.3)' }}>S</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a1a', marginBottom: 4 }}>Sindhu Raj</h3>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Owner — Dhriti Mart</div>
            <div style={{ width: 40, height: 3, background: '#f9a825', borderRadius: 2, margin: '0 auto 14px' }} />
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>
              Visionary entrepreneur behind Dhriti Mart, driving the mission to transform B2B agricultural commerce in India through technology and innovation.
            </p>
          </div>

          {/* V Chandrakanth Jain */}
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#0d47a1,#1976d2)', color: 'white', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(25,118,210,0.3)' }}>V</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a1a', marginBottom: 4 }}>V Chandrakanth Jain</h3>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1565c0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>CEO — Chandhu Tech</div>
            <div style={{ width: 40, height: 3, background: '#f9a825', borderRadius: 2, margin: '0 auto 14px' }} />
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>
              Technology leader and founder of Chandhu Tech, architecting the digital platform that powers Dhriti Mart — building scalable, innovative solutions for modern agricultural businesses.
            </p>
          </div>

        </div>
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
