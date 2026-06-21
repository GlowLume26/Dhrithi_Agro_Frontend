import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import api from '../api';

const FALLBACK = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80';

export default function Wishlist() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { setCartCount } = useCart();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) loadWishlist();
    else setLoading(false);
  }, [isLoggedIn]);

  async function loadWishlist() {
    setLoading(true);
    const res = await api.get('wishlist');
    setItems(res.success ? (res.data || []) : []);
    setLoading(false);
  }

  async function removeWish(id) {
    await api.delete('wishlist', { id });
    setItems(items => items.filter(i => i.id !== id));
    toast('Removed from wishlist');
  }

  async function addToCart(p) {
    if (!isLoggedIn) { toast('🔐 Please login'); navigate('/login'); return; }
    const res = await api.post('cart', { product_id: p.product_id || p.id, quantity: 1 });
    if (res.success) { toast(`✅ ${p.product_name || p.name} added to cart!`); setCartCount(c => c + 1); }
    else toast('❌ ' + (res.message || 'Failed'));
  }

  if (!isLoggedIn) return (
    <div className="wishlist-page">
      <div style={{ textAlign: 'center', background: 'white', borderRadius: 14, padding: '50px 30px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>❤️</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1b5e20', marginBottom: 10 }}>Login to view your wishlist</h3>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>Save your favourite products and come back later.</p>
        <Link to="/login" style={{ background: '#2e7d32', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>🔐 Login / Sign Up</Link>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ background: '#f5f5f5', padding: '12px 40px', fontSize: 13, color: '#666' }}>
        <Link to="/" style={{ color: '#2e7d32' }}>Home</Link> › My Wishlist
      </div>
      <div className="wishlist-page">
        <h1>❤️ My Wishlist <span style={{ fontSize: 16, color: '#888', fontWeight: 400 }}>({items.length} items)</span></h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💔</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1b5e20', marginBottom: 10 }}>Your wishlist is empty</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>Save products you love by clicking the heart icon.</p>
            <Link to="/categories" style={{ background: '#2e7d32', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>🌾 Browse Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map(item => {
              const sp = Number(item.selling_price || item.price);
              const mrp = Number(item.mrp);
              const disc = mrp > sp ? Math.round((mrp - sp) / mrp * 100) : 0;
              const inStock = (item.stock_quantity || item.stock_qty || 0) > 0;
              return (
                <div key={item.id} className="wish-card">
                  <button className="wish-remove" onClick={() => removeWish(item.id)} title="Remove">✕</button>
                  <div className="wish-img" onClick={() => navigate(`/product/${item.product_id || item.id}`)} style={{ cursor: 'pointer' }}>
                    <img src={item.primary_image || item.image || FALLBACK} alt={item.product_name || item.name} onError={e => e.target.src = FALLBACK} />
                  </div>
                  <div className="wish-info">
                    <h4 onClick={() => navigate(`/product/${item.product_id || item.id}`)} style={{ cursor: 'pointer' }}>{item.product_name || item.name}</h4>
                    <div className="brand">{item.brand_name || item.vendor_name || ''}</div>
                    <div className="wish-price">
                      <span className="price">₹{sp.toLocaleString('en-IN')}</span>
                      {disc > 0 && <><span className="old">₹{mrp.toLocaleString('en-IN')}</span><span className="disc">{disc}% OFF</span></>}
                    </div>
                    {inStock
                      ? <button className="wish-add" onClick={() => addToCart(item)}>🛒 Add to Cart</button>
                      : <button className="wish-add stock-out" disabled>❌ Out of Stock</button>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
