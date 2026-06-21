import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import EverythingWeOffer from '../components/EverythingWeOffer';

const FALLBACK = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80';

const HERO_SLIDES = [
  { bg: 'linear-gradient(135deg,#1b5e20,#2e7d32)', img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80', tag: '🌾 Kharif Season 2025', h2: 'Grow More,\nEarn More', p: 'Premium quality seeds, fertilizers & farm tools delivered right to your doorstep. Trusted by 5 lakh+ farmers.', btn1: ['🛒 Shop Now', '/categories'], btn2: ['📱 Join Free', '/login'] },
  { bg: 'linear-gradient(135deg,#33691e,#558b2f)', img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80', tag: '🌿 Organic Collection', h2: 'Go Organic,\nGo Healthy', p: '100% certified organic fertilizers and bio-pesticides for healthier crops and better yields.', btn1: ['🌿 Explore Organic', '/categories?category_id=2'], btn2: ['Learn More', '/about'] },
  { bg: 'linear-gradient(135deg,#004d40,#00695c)', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80', tag: '🔧 Farm Equipment', h2: 'Smart Tools\nfor Smart Farmers', p: 'Modern irrigation systems, sprayers, and precision farming tools to maximize your productivity.', btn1: ['🔧 View Tools', '/categories?category_id=1'], btn2: ['Get Expert Advice', '/contact'] },
];

const TESTIMONIALS = [
  { init: 'R', name: 'Ramesh Patil', loc: '📍 Nashik, Maharashtra', stars: 5, text: '"Drithi Agro has changed the way I buy farm inputs. The quality is excellent and delivery is always on time. My yield has improved by 30% this season!"' },
  { init: 'S', name: 'Sunita Devi', loc: '📍 Lucknow, UP', stars: 5, text: '"The organic fertilizers I bought here are amazing. My vegetables are healthier and I am getting better prices in the market. Highly recommend!"' },
  { init: 'K', name: 'Krishnamurthy', loc: '📍 Coimbatore, TN', stars: 4, text: '"Very easy to use. I just enter my phone number and get OTP. The expert helpline is very helpful for crop disease queries."' },
];

const ORG_TEAM = [
  { init: 'A', name: 'Arjun Mehta', role: 'CEO & Co-Founder', bio: 'Visionary leader with 15+ years in agri-tech. Passionate about empowering Indian farmers through technology.' },
  { init: 'P', name: 'Priya Nair', role: 'CTO & Co-Founder', bio: "Full-stack engineer and AI enthusiast. Built Drithi Agro's platform from the ground up to serve millions of farmers." },
  { init: 'S', name: 'Suresh Reddy', role: 'Head of Agronomy', bio: 'PhD in Agricultural Sciences. Guides farmers with expert crop advice and leads our agri-consultation team.' },
  { init: 'M', name: 'Meera Joshi', role: 'Head of Operations', bio: 'Supply chain expert ensuring on-time delivery across 28 states. Obsessed with farmer satisfaction.' },
];

const FALLBACK_BRANDS = [
  { name: 'Bayer CropScience', slug: 'bayer',        tag: 'Pesticides & Seeds',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Bayer-Logo.svg/200px-Bayer-Logo.svg.png' },
  { name: 'IFFCO',            slug: 'iffco',         tag: 'Fertilizers',             logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/IFFCO_Logo.svg/200px-IFFCO_Logo.svg.png' },
  { name: 'Syngenta',         slug: 'syngenta',      tag: 'Seeds & Crop Protection', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Syngenta_logo.svg/200px-Syngenta_logo.svg.png' },
  { name: 'Jain Irrigation',  slug: 'jain-irrigation', tag: 'Irrigation Systems',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Jain_Irrigation_Systems_logo.svg/200px-Jain_Irrigation_Systems_logo.svg.png' },
  { name: 'PI Industries',    slug: 'pi-industries', tag: 'Agrochemicals',           logo: 'https://www.piindustries.com/images/logo.png' },
  { name: 'UPL Limited',      slug: 'upl',           tag: 'Crop Solutions',          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/UPL_Limited_logo.svg/200px-UPL_Limited_logo.svg.png' },
  { name: 'Mahyco',           slug: 'mahyco',        tag: 'Hybrid Seeds',            logo: 'https://www.mahyco.com/images/mahyco-logo.png' },
  { name: 'Coromandel',       slug: 'coromandel',    tag: 'Fertilizers',             logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Coromandel_International_logo.svg/200px-Coromandel_International_logo.svg.png' },
];

function useAutoSlide(total, interval = 4000) {
  const [cur, setCur] = useState(0);
  const timer = useRef(null);
  const go = (n) => setCur((n + total) % total);
  useEffect(() => {
    timer.current = setInterval(() => setCur(c => (c + 1) % total), interval);
    return () => clearInterval(timer.current);
  }, [total, interval]);
  return [cur, go];
}

export default function Home() {
  const navigate = useNavigate();
  const [heroCur, heroGo] = useAutoSlide(3, 4000);
  const [testiCur, testiGo] = useAutoSlide(3, 4500);
  const [orgCur, orgGo] = useAutoSlide(4, 4000);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    api.get('categories', { parent_only: 1 }).then(r => r.success && setCategories(r.data.slice(0, 8)));
    api.get('products', { sort: 'sold_count', order: 'desc', limit: 4 }).then(r => r.success && setProducts(r.data));
    api.get('brands').then(r => setBrands(r.success && r.data?.length ? r.data : FALLBACK_BRANDS));
  }, []);

  const catIcons = ['🌿', '🧪', '🛡️', '💧', '💧', '🔧', '📊', '🐄'];

  return (
    <>
      {/* OFFER STRIP */}
      <div className="offer-strip">
        <span>🚚 Free delivery on <b>selective products</b></span>
        <span>🌿 New Season Products Now Available!</span>
        <span>💰 Up to <b>40% OFF</b> on selected items</span>
        <span>🎁 Buy 2 Get 1 Free on selected products</span>
        <span>📞 Farmer Helpline: <b>1800-XXX-XXXX</b></span>
      </div>

      {/* HERO SLIDER */}
      <section className="hero">
        <div className="hero-slides" style={{ transform: `translateX(-${heroCur * 100}%)` }}>
          {HERO_SLIDES.map((s, i) => (
            <div key={i} className="hero-slide" style={{ background: s.bg }}>
              <img src={s.img} alt="" />
              <div className="hero-content">
                <span className="tag">{s.tag}</span>
                <h2>{s.h2.split('\n').map((l, j) => <span key={j}>{l}{j === 0 && <br />}</span>)}</h2>
                <p>{s.p}</p>
                <div className="hero-btns">
                  <button className="btn-primary" onClick={() => navigate(s.btn1[1])}>{s.btn1[0]}</button>
                  <button className="btn-outline" onClick={() => navigate(s.btn2[1])}>{s.btn2[0]}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="hero-arrow left" onClick={() => heroGo(heroCur - 1)}>‹</button>
        <button className="hero-arrow right" onClick={() => heroGo(heroCur + 1)}>›</button>
        <div className="hero-dots">
          {[0, 1, 2].map(i => <div key={i} className={'hero-dot' + (heroCur === i ? ' active' : '')} onClick={() => heroGo(i)} />)}
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        {[['5L+', 'Happy Farmers'], ['10,000+', 'Products'], ['500+', 'Brands'], ['28', 'States Covered'], ['24/7', 'Expert Support']].map(([n, l]) => (
          <div key={l} className="stat-item"><div className="num">{n}</div><div className="lbl">{l}</div></div>
        ))}
      </div>

      {/* EVERYTHING WE OFFER — premium horizontal card slider */}
      <EverythingWeOffer />

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-header"><h2>Shop by Category</h2><p>Everything a farmer needs, all in one place</p><div className="line" /></div>
        <div className="categories-grid">
          {categories.length === 0
            ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#888' }}>⏳ Loading categories...</div>
            : categories.map((cat, i) => (
              <div key={cat.id} className="cat-card" onClick={() => navigate(`/categories?category_id=${cat.id}`)} style={{ cursor: 'pointer' }}>
                <div className="cat-img"><img src={FALLBACK} alt={cat.name} /></div>
                <div className="cat-info"><h4>{catIcons[i] || '📦'} {cat.name}</h4><span>Shop Now</span></div>
              </div>
            ))
          }
        </div>
        <Link to="/categories" className="view-all">View All Categories →</Link>
      </section>

      {/* BRANDS */}
      <section className="section brands-section">
        <div className="section-header"><h2>Top Brands We Carry</h2><p>Trusted by India's leading agricultural companies</p><div className="line" /></div>
        <div className="brands-track">
          {brands.map(b => (
            <div key={b.slug} className="brand-card" onClick={() => navigate(`/categories?search=${encodeURIComponent(b.name)}`)} style={{ cursor: 'pointer' }}>
              <div className="brand-logo">
                <img
                  src={b.logo || b.icon}
                  alt={b.name}
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                  style={{ width: 80, height: 40, objectFit: 'contain' }}
                />
                <span style={{ display: 'none', fontSize: 32 }}>{b.icon || '🌾'}</span>
              </div>
              <div className="brand-name">{b.name}</div>
              <div className="brand-tag">{b.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section section-alt">
        <div className="section-header"><h2>🔥 Best Sellers</h2><p>Most loved products by our farmers</p><div className="line" /></div>
        <div className="products-grid">
          {products.length === 0
            ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#888' }}>⏳ Loading products...</div>
            : products.map(p => <ProductCard key={p.id} p={p} />)
          }
        </div>
        <Link to="/categories" className="view-all">View All Products →</Link>
      </section>

      {/* PROMO BANNERS */}
      <section className="section">
        <div className="promo-grid">
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80" alt="Promo" />
            <div className="promo-overlay"><h3>🌾 Sell Your Produce</h3><p>Connect directly with buyers. Get the best price for your harvest.</p><Link to="/login">Start Selling →</Link></div>
          </div>
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80" alt="Promo" />
            <div className="promo-overlay"><h3>🧑‍🌾 Expert Advice</h3><p>Talk to our agri-experts for free crop consultation anytime.</p><Link to="/contact">Get Free Advice →</Link></div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section section-alt">
        <div className="section-header"><h2>Why Farmers Choose Drithi Agro</h2><p>We're built for farmers, by people who care about agriculture</p><div className="line" /></div>
        <div className="why-grid">
          {[
            ['✅', '100% Genuine Products', 'All products are verified and sourced directly from authorized manufacturers.'],
            ['🚚', 'Fast Delivery', 'Delivered to your farm within 2-5 business days across 28 states.'],
            ['💰', 'Best Prices', 'Competitive prices with regular discounts and seasonal offers for farmers.'],
            ['🧑‍🌾', 'Expert Support', '24/7 agri-expert helpline to guide you on crop protection and nutrition.'],
            ['🔄', 'Easy Returns', 'Hassle-free 7-day return policy on all products.'],
            ['📱', 'OTP Login', 'Simple phone-based login — no passwords needed. Just your number.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="why-card"><div className="why-icon">{icon}</div><h4>{title}</h4><p>{desc}</p></div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS + ORG */}
      <section className="section testi-org-section">
        <div className="testi-org-grid">
          <div className="testi-side">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: 28 }}><h2>What Farmers Say</h2><p>Real stories from real farmers across India</p><div className="line" style={{ margin: '12px 0 0' }} /></div>
            <div className="testi-slider-wrap">
              <div className="testi-slider" style={{ transform: `translateX(-${testiCur * 100}%)` }}>
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="testi-slide">
                    <div className="testi-card">
                      <div className="testi-stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
                      <p className="testi-text">{t.text}</p>
                      <div className="testi-author">
                        <div className="testi-avatar">{t.init}</div>
                        <div><div className="testi-name">{t.name}</div><div className="testi-loc">{t.loc}</div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="testi-dots">
              {[0, 1, 2].map(i => <button key={i} className={'testi-dot' + (testiCur === i ? ' active' : '')} onClick={() => testiGo(i)} />)}
            </div>
          </div>

          <div className="testi-divider" />

          <div className="org-side">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: 28 }}><h2>Our Organization</h2><p>The team building India's agri-future</p><div className="line" style={{ margin: '12px 0 0' }} /></div>
            <p className="org-desc">🌾 Founded in 2022, Drithi Agro is India's trusted agri-commerce platform connecting farmers with quality inputs, expert advice and fair markets across 28 states.</p>
            <div className="org-slider-wrap">
              <div className="org-slider" style={{ transform: `translateX(-${orgCur * 100}%)` }}>
                {ORG_TEAM.map((m, i) => (
                  <div key={i} className="org-slide">
                    <div className="org-profile">
                      <div className="org-avatar">{m.init}</div>
                      <div><div className="org-name">{m.name}</div><div className="org-role">{m.role}</div><div className="org-bio">{m.bio}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="org-dots">
              {[0, 1, 2, 3].map(i => <button key={i} className={'org-dot' + (orgCur === i ? ' active' : '')} onClick={() => orgGo(i)} />)}
            </div>
            <Link to="/about" className="org-link">View Full Profile →</Link>
          </div>
        </div>
      </section>

      {/* APP BANNER */}
      <section className="section">
        <div className="app-banner">
          <div>
            <h2>📱 Download Drithi Agro App</h2>
            <p>Get exclusive app-only deals, track your orders, and chat with agri-experts on the go.</p>
            <div className="app-btns">
              <div className="app-btn">🍎 App Store</div>
              <div className="app-btn">🤖 Google Play</div>
            </div>
          </div>
          <div className="app-phone">📲</div>
        </div>
      </section>
    </>
  );
}
