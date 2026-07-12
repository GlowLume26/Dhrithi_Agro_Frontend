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
        .prod-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;max-width:900px;margin:0 auto;padding:24px 24px 40px;}
        .prod-right-col{display:flex;flex-direction:column;gap:10px;overflow:hidden;}
        @media(max-width:760px){.prod-grid{grid-template-columns:1fr!important;padding:16px;}}
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

        {/* ── IMAGE COLUMN ── */}
        <motion.div {...fadeUp(0.05)}>
          {loading ? (
            <div style={{ width: 340 }}>
              <div style={{ width: 340, height: 340, borderRadius: 16, background: 'linear-gradient(90deg,#e8f5e9 25%,#f1f8e9 50%,#e8f5e9 75%)', backgroundSize: '300% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                {[0,1,2,3].map(i => <Skel key={i} h={74} w={74} r={10} />)}
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
            <motion.div {...fadeUp(0.1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#e8f5e9,#f9fbe7)', border: '1.5px solid #c8e6c9', borderRadius: 50, padding: '4px 12px 4px 4px', width: 'fit-content' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#1b5e20,#66bb6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🌿</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#1b5e20' }}>{p?.vendor_name || p?.brand_name || 'Drithi Agro'}</div>
                <div style={{ fontSize: 10, color: '#66bb6a', fontWeight: 700 }}>✅ Verified Seller</div>
              </div>
            </motion.div>

            {/* PRODUCT NAME */}
            <motion.h1 {...fadeUp(0.13)} style={{ fontSize: 18, fontWeight: 900, color: '#0d1f0d', lineHeight: 1.3, margin: 0 }}>
              {p?.name}
            </motion.h1>

            {/* STARS */}
            <motion.div {...fadeUp(0.16)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 13, color: s <= Math.round(rating) ? '#f9a825' : '#ddd' }}>★</span>)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>{rating.toFixed(1)}</span>
              <span style={{ fontSize: 11, color: '#999' }}>({p?.review_count || 0} reviews)</span>
            </motion.div>

            {/* PRICE */}
            <motion.div {...fadeUp(0.19)} style={{ background: 'linear-gradient(135deg,#f9fbe7,#fff)', borderRadius: 12, padding: '10px 14px', border: '1.5px solid #c8e6c9' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#1b5e20', letterSpacing: '-1px' }}>₹{sp.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Incl. taxes · Free delivery above ₹499</div>
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: p?.stock_qty > 0 ? '#e8f5e9' : '#ffebee', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: p?.stock_qty > 0 ? '#2e7d32' : '#c62828' }}>
                {p?.stock_qty > 0 ? `✅ In Stock — ${p.stock_qty} units` : '❌ Out of Stock'}
              </div>
            </motion.div>

            {/* VARIANTS */}
            <motion.div {...fadeUp(0.22)}>
              <QuantityVariants variants={MOCK_VARIANTS} selected={selVar} onSelect={(i, pr) => { setSelVar(i); setPrice(pr); }} />
            </motion.div>

            {/* QTY STEPPER */}
            <motion.div {...fadeUp(0.25)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>Qty:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 30, height: 30, border: 'none', background: '#f5f5f5', fontSize: 16, cursor: 'pointer' }}>−</button>
                <span style={{ width: 34, textAlign: 'center', fontSize: 14, fontWeight: 800 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))} style={{ width: 30, height: 30, border: 'none', background: '#f5f5f5', fontSize: 16, cursor: 'pointer' }}>+</button>
              </div>
            </motion.div>

            {/* ACTION BUTTONS */}
            <motion.div {...fadeUp(0.28)} style={{ display: 'flex', gap: 8 }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                disabled={busy || p?.stock_qty === 0} onClick={addToCart}
                style={{ flex: 1, background: 'linear-gradient(135deg,#ff6f00,#ff8f00)', color: 'white', border: 'none', padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.72 : 1 }}
              >{busy ? '⏳ Adding...' : '🛒 Add to Cart'}</motion.button>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/checkout')}
                style={{ flex: 1, background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', color: 'white', border: 'none', padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >⚡ Buy Now</motion.button>

              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                onClick={toggleWish} disabled={wishBusy}
                style={{ width: 42, height: 42, borderRadius: 10, border: `2px solid ${wished ? '#ffcdd2' : '#e0e0e0'}`, background: wished ? '#ffebee' : 'white', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}
              >{wishBusy ? '⏳' : wished ? '❤️' : '🤍'}</motion.button>
            </motion.div>

            {/* DELIVERY INFO */}
            <motion.div {...fadeUp(0.31)} style={{ background: 'white', border: '1.5px solid #e8f5e9', borderRadius: 12, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['🚚','Free delivery','Tomorrow, 5 PM'],['🔄','7-day','easy returns'],['🛡️','100% Genuine','Verified by Drithi Agro']].map(([ic,b,rest]) => (
                <div key={ic} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#444' }}>
                  <span>{ic}</span>
                  <span><b style={{ color: '#1b5e20' }}>{b}</b> {rest}</span>
                </div>
              ))}
            </motion.div>

            {/* TABS */}
            <motion.div {...fadeUp(0.34)}>
              <div style={{ display: 'flex', borderBottom: '2px solid #eee' }}>
                {['desc','specs','reviews'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: '7px 12px', fontSize: 12, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: tab === t ? '#2e7d32' : '#999', borderBottom: tab === t ? '3px solid #2e7d32' : '3px solid transparent', marginBottom: -2 }}
                  >
                    {t === 'desc' ? 'Description' : t === 'specs' ? 'Specs' : `Reviews (${p?.review_count || 3})`}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                  style={{ paddingTop: 10, fontSize: 13, color: '#555', lineHeight: 1.7, maxHeight: 160, overflowY: 'auto' }}
                >
                  {tab === 'desc' && <p style={{ margin: 0 }}>{p?.description || 'Premium quality agricultural product sourced directly from verified manufacturers. Trusted by 5 lakh+ farmers across India.'}</p>}
                  {tab === 'specs' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <tbody>
                        {[['Brand', p?.brand_name || p?.vendor_name || 'N/A'],['Category', p?.category_name || 'N/A'],['SKU', p?.sku || 'N/A'],['Stock', p?.stock_qty ?? 'N/A']].map(([k,v],i) => (
                          <tr key={k} style={{ background: i%2===0 ? '#f9fbe7' : 'white' }}>
                            <td style={{ padding: '6px 10px', fontWeight: 700, color: '#333', width: '40%', border: '1px solid #e8f5e9' }}>{k}</td>
                            <td style={{ padding: '6px 10px', border: '1px solid #e8f5e9' }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {tab === 'reviews' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {REVIEWS.map((r, i) => (
                        <div key={i} style={{ background: '#f9fbe7', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{r.init}</div>
                            <div><div style={{ fontWeight: 700, fontSize: 12 }}>{r.name}</div><div style={{ fontSize: 10, color: '#999' }}>📍 {r.loc}</div></div>
                            <div style={{ marginLeft: 'auto', color: '#f9a825', fontSize: 11 }}>{'★'.repeat(r.stars)}</div>
                          </div>
                          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5, margin: 0 }}>{r.text}</p>
                        </div>
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
