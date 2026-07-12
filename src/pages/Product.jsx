import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import api from '../api';
import ImageGallery from '../components/ImageGallery';
import QuantityVariants from '../components/QuantityVariants';
import SimilarProducts from '../components/SimilarProducts';

const MOCK_VARIANTS = [
  { qty: '250g', price: 50 },
  { qty: '500g', price: 90 },
  { qty: '1kg',  price: 170 },
  { qty: '5kg',  price: 800 },
];

const REVIEWS = [
  { init:'R', name:'Ramesh Patil',  loc:'Nashik, Maharashtra', stars:5, text:'Excellent quality! Germination was almost 100%. My crop this season was the best ever. Highly recommend to all farmers.' },
  { init:'S', name:'Sunita Devi',   loc:'Lucknow, UP',         stars:4, text:'Good quality. Delivery was fast. The plants are healthy and growing well. Will buy again next season.' },
  { init:'K', name:'Krishnamurthy', loc:'Coimbatore, TN',      stars:5, text:'Best product I have ever used. The yield was 40% more than my previous variety. Outstanding result!' },
];

function Skel({ h = 20, w = '100%', r = 8 }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: 'linear-gradient(90deg,#e8f5e9 25%,#f1f8e9 50%,#e8f5e9 75%)', backgroundSize: '300% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { setCartCount } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [tab, setTab]          = useState('desc');
  const [selVar, setSelVar]    = useState(0);
  const [price, setPrice]      = useState(null);
  const [qty, setQty]          = useState(1);
  const [busy, setBusy]        = useState(false);
  const [wished, setWished]    = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get('products', { id }).then(res => {
      const p = res.success && (res.data?.[0] || res.data);
      if (p) {
        setProduct(p);
        setPrice(Number(p.selling_price));
      }
      setLoading(false);
    });
  }, [id]);

  // separate effect so similar products always load even if product fetch is slow
  useEffect(() => {
    if (!id) return;
    api.get('products', { sort: 'sold_count', order: 'desc', limit: 12 }).then(r => {
      if (r.success && r.data?.length) {
        setSimilar(r.data.filter(x => String(x.id) !== String(id)).slice(0, 8));
      }
    });
  }, [id]);

  // load wishlist status for this product
  useEffect(() => {
    if (!isLoggedIn || !id) return;
    api.get('wishlist').then(res => {
      if (res.success && res.data) {
        setWished(res.data.some(w => String(w.product_id) === String(id)));
      }
    });
  }, [isLoggedIn, id]);

  async function toggleWish() {
    if (!isLoggedIn) { toast('🔐 Please login to save items'); navigate('/login'); return; }
    setWishBusy(true);
    if (wished) {
      await api.delete('wishlist', { product_id: id });
      setWished(false);
      toast('💔 Removed from wishlist');
    } else {
      const res = await api.post('wishlist', { product_id: id });
      if (res.success) { setWished(true); toast('❤️ Added to wishlist!'); }
      else toast('❌ ' + (res.message || 'Failed'));
    }
    setWishBusy(false);
  }

  async function addToCart() {
    if (!isLoggedIn) { toast('🔐 Please login first'); navigate('/login'); return; }
    setBusy(true);
    const res = await api.post('cart', { product_id: id, quantity: qty });
    if (res.success) { toast(`✅ ${product.name} added to cart!`); setCartCount(c => c + qty); }
    else toast('❌ ' + (res.message || 'Failed'));
    setBusy(false);
  }

  const p      = product;
  const sp     = price ?? 0;
  const rating = p ? (parseFloat(p.avg_rating) || 4.5) : 4.5;

  const images = p?.images?.length > 0
    ? p.images.map(i => i.image_url)
    : p?.primary_image
    ? [p.primary_image,
       'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
       'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
       'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80']
    : [];

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
  });

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:300% 0}100%{background-position:-300% 0}}
        @keyframes pricePulse{0%,100%{opacity:1}50%{opacity:.78}}
        .prod-grid{display:grid;grid-template-columns:1fr;gap:28px;max-width:860px;margin:0 auto;padding:28px 24px 48px;}
        .prod-right-col{display:flex;flex-direction:column;gap:14px;}
        @media(max-width:600px){.prod-grid{padding:16px;gap:20px;}}
      `}</style>

      {/* BREADCRUMB */}
      <motion.div {...fadeUp()} style={{ background: '#f5f5f5', padding: '11px 40px', fontSize: 13, color: '#777', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#2e7d32', fontWeight: 600 }}>Home</Link>
        {p?.category_name && <><span>›</span><Link to={`/categories?category_id=${p.category_id}`} style={{ color: '#2e7d32' }}>{p.category_name}</Link></>}
        {!p?.category_name && <><span>›</span><Link to="/categories" style={{ color: '#2e7d32' }}>Categories</Link></>}
        <span>›</span><span style={{ color: '#333', fontWeight: 600 }}>{p?.name || 'Product'}</span>
      </motion.div>

      {/* PRODUCT CONTAINER — 60/40 on desktop, stacked on mobile */}
      <div className="prod-grid">

        {/* ── IMAGE (top, smaller) ── */}
        <motion.div {...fadeUp(0.05)}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skel h={260} r={18} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[0,1,2,3].map(i => <Skel key={i} h={60} r={10} />)}
              </div>
            </div>
          ) : (
            <ImageGallery images={images} />
          )}
        </motion.div>

        {/* ── RIGHT COLUMN — DETAILS ── */}
        <div className="prod-right-col">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Skel h={20} w="50%" r={20} />
            <Skel h={30} r={8} />
            <Skel h={20} w="35%" r={8} />
            <Skel h={70} r={12} />
            <Skel h={80} r={12} />
            <Skel h={46} r={10} />
          </div>
        ) : (
          <>
            {/* VENDOR BADGE */}
            <motion.div {...fadeUp(0.1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#e8f5e9,#f9fbe7)', border: '1.5px solid #c8e6c9', borderRadius: 50, padding: '5px 14px 5px 5px', marginBottom: 14, width: 'fit-content' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1b5e20,#66bb6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌿</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1b5e20' }}>{p?.vendor_name || p?.brand_name || 'Drithi Agro'}</div>
                <div style={{ fontSize: 10, color: '#66bb6a', fontWeight: 700 }}>✅ Verified Seller</div>
              </div>
            </motion.div>

            {/* PRODUCT NAME */}
            <motion.h1 {...fadeUp(0.13)} style={{ fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 900, color: '#0d1f0d', lineHeight: 1.3, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              {p?.name}
            </motion.h1>

            {/* STARS */}
            <motion.div {...fadeUp(0.16)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 14, color: s <= Math.round(rating) ? '#f9a825' : '#ddd' }}>★</span>)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#444' }}>{rating.toFixed(1)}</span>
              <span style={{ fontSize: 12, color: '#999' }}>({p?.review_count || 0} reviews)</span>
            </motion.div>

            {/* PRICE — selling price only, no MRP */}
            <motion.div {...fadeUp(0.19)} style={{ background: 'linear-gradient(135deg,#f9fbe7,#fff)', borderRadius: 14, padding: '14px 18px', border: '1.5px solid #c8e6c9', marginBottom: 16 }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#1b5e20', letterSpacing: '-1px', animation: 'pricePulse 3.5s ease-in-out infinite' }}>
                ₹{sp.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Inclusive of all taxes · Free delivery above ₹499</div>
              <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: p?.stock_qty > 0 ? '#e8f5e9' : '#ffebee', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: p?.stock_qty > 0 ? '#2e7d32' : '#c62828' }}>
                {p?.stock_qty > 0 ? `✅ In Stock — ${p.stock_qty} units` : '❌ Out of Stock'}
              </div>
            </motion.div>

            {/* VARIANTS */}
            <motion.div {...fadeUp(0.22)} style={{ marginBottom: 16 }}>
              <QuantityVariants variants={MOCK_VARIANTS} selected={selVar} onSelect={(i, pr) => { setSelVar(i); setPrice(pr); }} />
            </motion.div>

            {/* QTY STEPPER */}
            <motion.div {...fadeUp(0.25)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, border: 'none', background: '#f5f5f5', fontSize: 18, cursor: 'pointer' }}>−</button>
                <span style={{ width: 38, textAlign: 'center', fontSize: 15, fontWeight: 800 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))} style={{ width: 34, height: 34, border: 'none', background: '#f5f5f5', fontSize: 18, cursor: 'pointer' }}>+</button>
              </div>
              <span style={{ fontSize: 11, color: '#aaa' }}>Max 10</span>
            </motion.div>

            {/* ACTION BUTTONS */}
            <motion.div {...fadeUp(0.28)} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                disabled={busy || p?.stock_qty === 0} onClick={addToCart}
                style={{ flex: 1, background: 'linear-gradient(135deg,#ff6f00,#ff8f00)', color: 'white', border: 'none', padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 18px rgba(255,111,0,0.28)', opacity: busy ? 0.72 : 1 }}
              >{busy ? '⏳ Adding...' : '🛒 Add to Cart'}</motion.button>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/checkout')}
                style={{ flex: 1, background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', color: 'white', border: 'none', padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 18px rgba(27,94,32,0.28)' }}
              >⚡ Buy Now</motion.button>

              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                onClick={toggleWish} disabled={wishBusy}
                title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                style={{ width: 46, height: 46, borderRadius: 12, border: `2px solid ${wished ? '#ffcdd2' : '#e0e0e0'}`, background: wished ? '#ffebee' : 'white', fontSize: 20, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
              >{wishBusy ? '⏳' : wished ? '❤️' : '🤍'}</motion.button>
            </motion.div>

            {/* DELIVERY INFO */}
            <motion.div {...fadeUp(0.31)} style={{ background: 'white', border: '1.5px solid #e8f5e9', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
              {[['🚚','Free delivery by','Tomorrow, 5 PM'],['🔄','7-day','easy return & replacement'],['🛡️','100% Genuine','product — Verified by Drithi Agro']].map(([ic,b,rest]) => (
                <div key={ic} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444' }}>
                  <span style={{ fontSize: 16 }}>{ic}</span>
                  <span><b style={{ color: '#1b5e20' }}>{b}</b> {rest}</span>
                </div>
              ))}
            </motion.div>

            {/* TABS */}
            <motion.div {...fadeUp(0.34)}>
              <div style={{ display: 'flex', borderBottom: '2px solid #eee' }}>
                {['desc','specs','reviews'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: '9px 16px', fontSize: 13, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: tab === t ? '#2e7d32' : '#999', borderBottom: tab === t ? '3px solid #2e7d32' : '3px solid transparent', marginBottom: -2 }}
                  >
                    {t === 'desc' ? 'Description' : t === 'specs' ? 'Specifications' : `Reviews (${p?.review_count || 3})`}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={tab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{ paddingTop: 14, fontSize: 14, color: '#555', lineHeight: 1.75 }}
                >
                  {tab === 'desc' && (
                    <p>{p?.description || 'Premium quality agricultural product sourced directly from verified manufacturers. Trusted by 5 lakh+ farmers across India.'}</p>
                  )}
                  {tab === 'specs' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <tbody>
                        {[['Brand', p?.brand_name || p?.vendor_name || 'N/A'],['Category', p?.category_name || 'N/A'],['SKU', p?.sku || 'N/A'],['Weight', p?.weight ? p.weight + ' g' : 'N/A'],['Stock', p?.stock_qty ?? 'N/A']].map(([k,v],i) => (
                          <tr key={k} style={{ background: i%2===0 ? '#f9fbe7' : 'white' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#333', width: '40%', border: '1px solid #e8f5e9' }}>{k}</td>
                            <td style={{ padding: '8px 12px', border: '1px solid #e8f5e9' }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {tab === 'reviews' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {REVIEWS.map((r, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          style={{ background: '#f9fbe7', borderRadius: 12, padding: '12px 14px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{r.init}</div>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div><div style={{ fontSize: 11, color: '#999' }}>📍 {r.loc}</div></div>
                            <div style={{ marginLeft: 'auto', color: '#f9a825', fontSize: 12 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</div>
                          </div>
                          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </>
        )}
        </div>{/* end prod-right-col */}
      </div>{/* end prod-grid */}

      {/* SIMILAR PRODUCTS */}
      <SimilarProducts products={similar} />
    </>
  );
}
