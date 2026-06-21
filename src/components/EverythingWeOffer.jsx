import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CARDS = [
  {
    id: 0,
    badge: 'For Farmers',
    badgeIcon: '🌾',
    ribbon: null,
    icon: '🛒',
    title: 'Buy With Us',
    desc: 'Premium seeds, fertilizers and farm tools at the best market prices. 10,000+ products ready to order.',
    benefits: ['✅ 100% Genuine Products', '🚚 Fast Delivery Nationwide', '🔄 7-Day Easy Returns'],
    btnTxt: 'Shop Now →',
    to: '/categories',
    grad: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
    c1: 'rgba(255,255,255,0.08)',
    c2: 'rgba(255,255,255,0.04)',
    glow: 'rgba(76,175,80,0.5)',
  },
  {
    id: 1,
    badge: '🔥 Most Popular',
    badgeIcon: null,
    ribbon: 'Limited Time',
    icon: '🎁',
    title: 'Best Offers',
    desc: 'Exclusive discounts and seasonal deals on top agricultural products. Up to 40% OFF this season.',
    benefits: ['💰 Up to 40% Discount', '🏷️ Seasonal Special Deals', '⏳ Limited Stock Only'],
    btnTxt: 'View Offers →',
    to: '/categories?offers=1',
    grad: 'linear-gradient(135deg, #bf360c 0%, #e64a19 50%, #f9a825 100%)',
    c1: 'rgba(255,255,255,0.1)',
    c2: 'rgba(255,255,255,0.05)',
    glow: 'rgba(249,168,37,0.5)',
  },
  {
    id: 2,
    badge: 'For Vendors',
    badgeIcon: '🏪',
    ribbon: null,
    icon: '🏪',
    title: 'Sell With Us',
    desc: 'Become a vendor and grow your business with thousands of farmers across India.',
    benefits: ['📊 5 Lakh+ Active Customers', '🌎 Reach Across 28 States', '💸 Best Profit Margins'],
    btnTxt: 'Start Selling →',
    to: '/vendor/register',
    grad: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
    c1: 'rgba(255,255,255,0.08)',
    c2: 'rgba(255,255,255,0.04)',
    glow: 'rgba(33,150,243,0.5)',
  },
];

const STATS = [
  { icon: '👨‍🌾', target: 10000, suffix: '+', label: 'Farmers' },
  { icon: '🏪', target: 500, suffix: '+', label: 'Vendors' },
  { icon: '📦', target: 50000, suffix: '+', label: 'Orders Delivered' },
  { icon: '⭐', target: 4.8, suffix: '', label: 'Customer Rating', decimal: true },
];

function useCountUp(target, active, decimal = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const steps = 60;
    const inc = target / steps;
    let current = 0;
    const t = setInterval(() => {
      current += inc;
      if (current >= target) { setVal(target); clearInterval(t); }
      else setVal(decimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
    }, duration / steps);
    return () => clearInterval(t);
  }, [active, target, decimal]);
  return val;
}

function StatItem({ icon, target, suffix, label, decimal, active }) {
  const val = useCountUp(target, active, decimal);
  return (
    <div className="ewo-stat">
      <div className="ewo-stat-icon">{icon}</div>
      <div className="ewo-stat-val">{decimal ? val.toFixed(1) : val.toLocaleString('en-IN')}{suffix}</div>
      <div className="ewo-stat-label">{label}</div>
    </div>
  );
}

export default function EverythingWeOffer() {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const timerRef = useRef(null);
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const total = CARDS.length;

  const go = useCallback((n) => setCur((n + total) % total), [total]);

  // Auto-slide
  useEffect(() => {
    timerRef.current = setInterval(() => setCur(c => (c + 1) % total), 4000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const resetTimer = (n) => {
    clearInterval(timerRef.current);
    go(n);
    timerRef.current = setInterval(() => setCur(c => (c + 1) % total), 4000);
  };

  // Scroll reveal — cards
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCardVisible(true); }, { threshold: 0.15 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Scroll reveal — stats count-up
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.4 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const c = CARDS[cur];

  return (
    <section className="ewo-section" aria-label="Everything We Offer" ref={sectionRef}>
      {/* Background decorations */}
      <div className="ewo-bg-circle ewo-bg-c1" aria-hidden="true" />
      <div className="ewo-bg-circle ewo-bg-c2" aria-hidden="true" />
      <div className="ewo-bg-circle ewo-bg-c3" aria-hidden="true" />

      {/* Header */}
      <div className={`ewo-header${cardVisible ? ' ewo-fade-up' : ''}`}>
        <h2 className="ewo-title">Everything We Offer</h2>
        <div className="ewo-underline" aria-hidden="true"><span /></div>
        <p className="ewo-subtitle">Grow, sell and succeed — all in one marketplace for Indian farmers</p>
      </div>

      {/* Slider wrapper */}
      <div className="ewo-slider-wrap" role="region" aria-label="Offer cards slider">
        <div
          className="ewo-slider"
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              className={`ewo-slide${cardVisible ? ' ewo-fade-up' : ''}`}
              style={{ animationDelay: `${i * 0.12}s` }}
              aria-hidden={i !== cur}
            >
              <div
                className="ewo-card"
                style={{ background: card.grad }}
                tabIndex={0}
                role="article"
                aria-label={card.title}
                onKeyDown={e => e.key === 'Enter' && navigate(card.to)}
              >
                {/* Floating circles */}
                <div className="ewo-circle ewo-circle-1" style={{ background: card.c1 }} aria-hidden="true" />
                <div className="ewo-circle ewo-circle-2" style={{ background: card.c2 }} aria-hidden="true" />
                <div className="ewo-circle ewo-circle-3" style={{ background: card.c1 }} aria-hidden="true" />

                {/* Ribbon */}
                {card.ribbon && (
                  <div className="ewo-ribbon" aria-label="Limited Time offer">{card.ribbon}</div>
                )}

                {/* Badge */}
                <div className={`ewo-badge${card.id === 1 ? ' ewo-badge-pulse' : ''}`}>
                  {card.badgeIcon && <span>{card.badgeIcon}</span>}
                  {card.badge}
                </div>

                {/* Content */}
                <div className="ewo-card-body">
                  <div className={`ewo-icon${card.id === 1 ? ' ewo-icon-float' : ''}`} aria-hidden="true">
                    {card.icon}
                  </div>
                  <h3 className="ewo-card-title">{card.title}</h3>
                  <p className="ewo-card-desc">{card.desc}</p>
                  <ul className="ewo-benefits" aria-label="Benefits">
                    {card.benefits.map((b, j) => (
                      <li key={j} style={{ animationDelay: `${j * 0.08 + 0.3}s` }}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="ewo-btn"
                    style={{ '--glow': card.glow }}
                    onClick={() => navigate(card.to)}
                    aria-label={`${card.btnTxt} - ${card.title}`}
                  >
                    {card.btnTxt}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          className="ewo-arrow ewo-arrow-prev"
          onClick={() => resetTimer(cur - 1)}
          aria-label="Previous offer"
        >‹</button>
        <button
          className="ewo-arrow ewo-arrow-next"
          onClick={() => resetTimer(cur + 1)}
          aria-label="Next offer"
        >›</button>
      </div>

      {/* Dots */}
      <div className="ewo-dots" role="tablist" aria-label="Slide navigation">
        {CARDS.map((_, i) => (
          <button
            key={i}
            className={`ewo-dot${cur === i ? ' active' : ''}`}
            onClick={() => resetTimer(i)}
            role="tab"
            aria-selected={cur === i}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Stats counter */}
      <div className="ewo-stats" ref={statsRef} aria-label="Platform statistics">
        {STATS.map((s, i) => (
          <StatItem key={i} {...s} active={statsVisible} />
        ))}
      </div>
    </section>
  );
}
