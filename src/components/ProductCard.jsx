import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import api from '../api';

const FALLBACK = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80';

export default function ProductCard({ p }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { setCartCount } = useCart();
  const toast = useToast();
  const [wished, setWished] = useState(false);
  const disc = p.mrp > p.selling_price ? Math.round((p.mrp - p.selling_price) / p.mrp * 100) : 0;
  const img = p.primary_image || FALLBACK;

  async function toggleWish(e) {
    e.stopPropagation();
    if (!isLoggedIn) { toast('🔐 Please login to save items'); navigate('/login'); return; }
    if (wished) {
      await api.delete('wishlist', { product_id: p.id });
      setWished(false);
      toast('💔 Removed from wishlist');
    } else {
      const res = await api.post('wishlist', { product_id: p.id });
      if (res.success) { setWished(true); toast('❤️ Added to wishlist!'); }
      else toast('❌ ' + (res.message || 'Failed'));
    }
  }

  async function addToCart(e) {
    e.stopPropagation();
    if (!isLoggedIn) { toast('🔐 Please login to add items to cart'); navigate('/login'); return; }
    const res = await api.post('cart', { product_id: p.id, quantity: 1 });
    if (res.success) { toast('✅ ' + p.name + ' added to cart!'); setCartCount(c => c + 1); }
    else toast('❌ ' + (res.message || 'Failed to add to cart'));
  }

  return (
    <div className="product-card" onClick={() => navigate('/product/' + p.id)} style={{ cursor: 'pointer' }}>
      {disc > 0 && <span className="product-badge">{disc}% OFF</span>}
      <button className="product-wish" onClick={toggleWish} title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        style={{ color: wished ? '#e53935' : undefined }}>
        {wished ? '❤️' : '🤍'}
      </button>
      <div className="product-img">
        <img src={img} alt={p.name} onError={e => e.target.src = FALLBACK} />
      </div>
      <div className="product-info">
        <h4>{p.name}</h4>
        <div className="brand">{p.brand_name || p.vendor_name || ''}</div>
        <div className="product-price">
          <span className="price">₹{Number(p.selling_price).toLocaleString('en-IN')}</span>
          {disc > 0 && <span className="old">₹{Number(p.mrp).toLocaleString('en-IN')}</span>}
        </div>
        <button className="add-cart" onClick={addToCart}>🛒 Add to Cart</button>
      </div>
    </div>
  );
}
