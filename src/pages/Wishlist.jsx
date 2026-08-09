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
  const [addingToCart, setAddingToCart] = useState(null);
  const [removing, setRemoving] = useState(null);

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
    setRemoving(id);
    await api.delete('wishlist', { id });
    setItems(prev => prev.filter(i => i.id !== id));
    toast('💔 Removed from wishlist');
    setRemoving(null);
  }

  async function addToCart(item) {
    if (!isLoggedIn) { navigate('/login'); return; }
    setAddingToCart(item.id);
    const res = await api.post('cart', { product_id: item.product_id, quantity: 1 });
    if (res.success) {
      toast('✅ ' + item.name + ' added to cart!');
      setCartCount(c => c + 1);
    } else {
      toast('❌ ' + (res.message || 'Failed to add to cart'));
    }
    setAddingToCart(null);
  }

  if (!isLoggedIn) return (
    <div className="wl-empty-wrap">
      <div className="wl-empty-box">
        <div className="wl-empty-icon">❤️</div>
        <h3>Login to view your wishlist</h3>
        <p>Save your favourite products and come back later.</p>
        <Link to="/login" className="wl-empty-btn">🔐 Login / Sign Up</Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="wl-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span>My Wishlist</span>
        {!loading && <span className="wl-bc-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>}
      </div>

      <div className="wishlist-page">
        <div className="wl-header">
          <h1>❤️ My Wishlist</h1>
          {items.length > 0 && (
            <Link to="/categories" className="wl-browse-link">+ Add More Products</Link>
          )}
        </div>

        {loading ? (
          <div className="wl-loading">
            <div className="wl-loading-icon">❤️</div>
            <p>Loading your wishlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="wl-empty-box" style={{ margin: '0 auto', maxWidth: 420 }}>
            <div className="wl-empty-icon">💔</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love by clicking the ❤️ icon on any product.</p>
            <Link to="/categories" className="wl-empty-btn">🌾 Browse Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item, i) => {
              const sp = Number(item.selling_price);
              const mrp = Number(item.mrp);
              const disc = mrp > sp ? Math.round((mrp - sp) / mrp * 100) : 0;
              const inStock = (item.stock_qty || 0) > 0;
              const isRemoving = removing === item.id;
              const isAdding = addingToCart === item.id;

              return (
                <div key={item.id} className={`wish-card${isRemoving ? ' wc-removing' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}>

                  {/* Remove button */}
                  <button className="wish-remove" onClick={() => removeWish(item.id)}
                    disabled={isRemoving} title="Remove from wishlist">
                    {isRemoving ? '...' : '✕'}
                  </button>

                  {/* Discount badge */}
                  {disc > 0 && <div className="wish-disc-badge">{disc}% OFF</div>}

                  {/* Image */}
                  <div className="wish-img" onClick={() => navigate(`/product/${item.product_id}`)}>
                    <img
                      src={item.image || FALLBACK}
                      alt={item.name}
                      onError={e => e.target.src = FALLBACK}
                    />
                  </div>

                  {/* Info */}
                  <div className="wish-info">
                    <h4 onClick={() => navigate(`/product/${item.product_id}`)}>{item.name}</h4>
                    {(item.brand_name || item.vendor_name) && (
                      <div className="wish-brand">{item.brand_name || item.vendor_name}</div>
                    )}

                    <div className="wish-price">
                      <span className="wp-price">₹{sp.toLocaleString('en-IN')}</span>
                      {disc > 0 && <span className="wp-mrp">₹{mrp.toLocaleString('en-IN')}</span>}
                    </div>
                    {disc > 0 && (
                      <div className="wish-save">You save ₹{(mrp - sp).toLocaleString('en-IN')}</div>
                    )}

                    <div className={`wish-stock ${inStock ? 'in' : 'out'}`}>
                      {inStock ? '● In Stock' : '● Out of Stock'}
                    </div>

                    <div className="wish-actions">
                      <button
                        className={`wish-cart-btn${!inStock ? ' disabled' : ''}`}
                        onClick={() => inStock && addToCart(item)}
                        disabled={!inStock || isAdding}
                      >
                        {isAdding ? '⏳ Adding...' : inStock ? '🛒 Add to Cart' : '❌ Out of Stock'}
                      </button>
                      <button className="wish-view-btn" onClick={() => navigate(`/product/${item.product_id}`)}>
                        View
                      </button>
                    </div>
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
