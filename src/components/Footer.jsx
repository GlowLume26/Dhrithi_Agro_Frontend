import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon" style={{ background:'#f9a825',width:'44px',height:'44px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px' }}>🌿</div>
              <div className="logo-text"><h1 style={{ fontSize:'20px' }}>Drithi Agro</h1><span style={{ fontSize:'11px',color:'#a5d6a7' }}>Farm to Future</span></div>
            </div>
            <p>India's trusted agri-commerce platform connecting farmers with quality products at the best prices.</p>
            <div className="footer-social">
              <div className="social-btn">📸</div><div className="social-btn">📷</div>
              <div className="social-btn">🐦</div><div className="social-btn">▶️</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Our Organization</h4>
            <ul>
              <li><Link to="/about">🌾 About Us</Link></li>
              <li><Link to="/about#mission">🎯 Our Mission</Link></li>
              <li><Link to="/about#team">👥 Our Team</Link></li>
              <li><Link to="/vendor/register">🤝 Partner With Us</Link></li>
              <li><Link to="/contact">📞 Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/explore">✨ Everything We Offer</Link></li>
              <li><Link to="/categories">🛒 Shop Now</Link></li>
              <li><Link to="/vendor/register">🏪 Sell With Us</Link></li>
              <li><Link to="/orders">🚚 Track Order</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/categories?category_id=1">💧 Irrigation</Link></li>
              <li><Link to="/categories?category_id=2">🌿 Gardening</Link></li>
              <li><Link to="/categories?category_id=3">🐄 Cattle & Bird Care</Link></li>
              <li><Link to="/categories?offers=1">🏷️ Best Offers</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">🎓 Help Center</Link></li>
              <li><Link to="/orders">📌 Track Order</Link></li>
              <li><Link to="#">🔄 Returns Policy</Link></li>
              <li><Link to="#">🔒 Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Drithi Agro. All rights reserved. | Made with 💚 for Indian Farmers</p>
        </div>
      </footer>
      <button
        className={'scroll-top' + (showTop ? ' show' : '')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >↑</button>
    </>
  );
}
