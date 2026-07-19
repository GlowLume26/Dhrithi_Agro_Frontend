import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminThemeProvider } from './admin/context/AdminThemeContext';
import { AdminProtected } from './admin/routes/AdminProtected';

import Header from './components/Header';
import Footer from './components/Footer';

// Customer pages
import Home           from './pages/Home';
import Login          from './pages/Login';
import Categories     from './pages/Categories';
import Product        from './pages/Product';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import Orders         from './pages/Orders';
import Wishlist       from './pages/Wishlist';
import Account        from './pages/Account';
import VendorRegister  from './pages/vendor/VendorRegister';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts  from './pages/vendor/VendorProducts';
import About           from './pages/About';
import Contact         from './pages/Contact';
import Explore         from './pages/Explore';

// Admin pages
import AdminLogin     from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts  from './admin/pages/AdminProducts';
import AdminOrders    from './admin/pages/AdminOrders';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminInventory from './admin/pages/AdminInventory';
import AdminOffers    from './admin/pages/AdminOffers';
import AdminReports   from './admin/pages/AdminReports';
import AdminSettings  from './admin/pages/AdminSettings';
import AdminUsers     from './admin/pages/AdminUsers';
import AdminCategories from './admin/pages/AdminCategories';
import AdminVendors   from './admin/pages/AdminVendors';

// Pages that don't use shared Header/Footer
const STANDALONE = [
  '/login', '/admin',
  '/vendor/dashboard', '/vendor/products',
];

function Layout() {
  const { pathname } = useLocation();
  const standalone = STANDALONE.some(p => pathname.startsWith(p));

  return (
    <>
      {!standalone && <Header />}
      <Routes>
        {/* ── Customer routes ── */}
        <Route path="/"                 element={<Home />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/categories"       element={<Categories />} />
        <Route path="/product/:id"      element={<Product />} />
        <Route path="/cart"             element={<Cart />} />
        <Route path="/checkout"         element={<Checkout />} />
        <Route path="/orders"           element={<Orders />} />
        <Route path="/wishlist"         element={<Wishlist />} />
        <Route path="/account"          element={<Account />} />
        <Route path="/vendor/register"  element={<VendorRegister />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products"  element={<VendorProducts />} />
        <Route path="/about"            element={<About />} />
        <Route path="/contact"          element={<Contact />} />
        <Route path="/explore"          element={<Explore />} />

        {/* ── Admin routes ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtected module="dashboard"><AdminDashboard /></AdminProtected>} />
        <Route path="/admin/products"  element={<AdminProtected module="products"><AdminProducts /></AdminProtected>} />
        <Route path="/admin/orders"    element={<AdminProtected module="orders"><AdminOrders /></AdminProtected>} />
        <Route path="/admin/customers" element={<AdminProtected module="customers"><AdminCustomers /></AdminProtected>} />
        <Route path="/admin/vendors"   element={<AdminProtected module="vendors"><AdminVendors /></AdminProtected>} />
        <Route path="/admin/inventory" element={<AdminProtected module="inventory"><AdminInventory /></AdminProtected>} />
        <Route path="/admin/offers"    element={<AdminProtected module="offers"><AdminOffers /></AdminProtected>} />
        <Route path="/admin/reports"   element={<AdminProtected module="reports"><AdminReports /></AdminProtected>} />
        <Route path="/admin/settings"  element={<AdminProtected module="settings"><AdminSettings /></AdminProtected>} />
        <Route path="/admin/admins"      element={<AdminProtected module="admins"><AdminUsers /></AdminProtected>} />
        <Route path="/admin/categories"   element={<AdminProtected module="categories"><AdminCategories /></AdminProtected>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!standalone && <Footer />}
    </>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:80 }}>🌾</div>
      <h2 style={{ fontSize:28, fontWeight:800, color:'#1b5e20', margin:'16px 0 10px' }}>Page Not Found</h2>
      <p style={{ color:'#888', marginBottom:24 }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ background:'#2e7d32', color:'white', padding:'12px 28px', borderRadius:10, fontWeight:700, textDecoration:'none' }}>🏠 Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <Layout />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </AdminThemeProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
