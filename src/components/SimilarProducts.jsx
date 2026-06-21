import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FB = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80';

function SimilarCard({ p, index }) {
  const navigate = useNavigate();
  const sp = Number(p.selling_price || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(0,0,0,0.13)' }}
      style={{ background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', cursor: 'pointer', minWidth: 200, flex: '0 0 200px', transition: 'box-shadow 0.3s' }}
      onClick={() => navigate(`/product/${p.id}`)}
    >
      <div style={{ position: 'relative', height: 164, overflow: 'hidden', background: '#f9fbe7' }}>
        <motion.img
          src={p.primary_image || FB} alt={p.name}
          onError={e => e.target.src = FB}
          loading="lazy"
          whileHover={{ scale: 1.09 }}
          transition={{ duration: 0.38 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ padding: '13px 14px 16px' }}>
        <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 3 }}>{p.brand_name || p.vendor_name || 'Drithi Agro'}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#2e7d32', marginBottom: 10 }}>₹{sp.toLocaleString('en-IN')}</div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={e => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
          style={{ width: '100%', background: 'linear-gradient(135deg,#2e7d32,#43a047)', color: 'white', border: 'none', padding: '9px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >View Product →</motion.button>
      </div>
    </motion.div>
  );
}

export default function SimilarProducts({ products = [] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  if (!products.length) return (
    <div ref={ref} style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
      Loading similar products...
    </div>
  );

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      style={{ padding: '60px 40px', background: '#f9fbe7' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45 }} style={{ marginBottom: 28 }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1b5e20', margin: 0 }}>🌱 Similar Products</h2>
        <div style={{ width: 48, height: 4, background: '#f9a825', borderRadius: 2, marginTop: 8 }} />
      </motion.div>

      {/* grid on desktop, horizontal scroll on mobile */}
      <div className="similar-grid">
        {products.slice(0, 8).map((p, i) => <SimilarCard key={p.id} p={p} index={i} />)}
      </div>

      <style>{`
        .similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 20px; }
        @media(max-width:640px){
          .similar-grid { display:flex !important; overflow-x:auto; gap:14px; padding-bottom:10px; scrollbar-width:none; }
          .similar-grid::-webkit-scrollbar { display:none; }
        }
        @media(max-width:40px){ .similar-grid > * { min-width:165px; } }
      `}</style>
    </motion.section>
  );
}
