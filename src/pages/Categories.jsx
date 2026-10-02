import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80';

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [allCats, setAllCats]       = useState([]);   // all categories from API
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [catsLoading, setCatsLoading] = useState(true);
  const [page, setPage]             = useState(1);
  const [sort, setSort]             = useState('');
  const [mobileSb, setMobileSb]     = useState(false);
  const [openSb, setOpenSb]         = useState(null);

  const search    = searchParams.get('search')      || '';
  const catId     = searchParams.get('category_id') || '';
  const catSlug   = searchParams.get('category_slug') || '';
  const offersMode = searchParams.get('offers')     || '';

  // Load all categories once
  useEffect(() => {
    setCatsLoading(true);
    api.get('categories').then(r => {
      if (r.success) setAllCats(r.data || []);
    }).finally(() => setCatsLoading(false));
  }, []);

  const parents = allCats.filter(c => !c.parent_id);
  const subs    = allCats.filter(c => !!c.parent_id);

  // Resolve current category from URL
  const activeCat = catId
    ? allCats.find(c => c.id === catId)
    : catSlug
    ? allCats.find(c => c.slug === catSlug)
    : null;

  const isParent   = activeCat && !activeCat.parent_id;
  const isSubcat   = activeCat && !!activeCat.parent_id;
  const subcatsOfActive = isParent ? subs.filter(s => s.parent_id === activeCat.id) : [];

  // Determine what to show
  const showOverview  = !search && !activeCat && !offersMode;
  const showSubcats   = isParent && subcatsOfActive.length > 0;
  const showProducts  = !!search || !!offersMode || isSubcat || (isParent && subcatsOfActive.length === 0);

  // Resolve category_id to pass to products API
  const resolvedCatId = activeCat?.id || '';

  // Banner text
  let bannerH1 = '🌾 All Categories';
  let bannerP  = 'Explore products across all farming categories';
  if (search)      { bannerH1 = `🔍 "${search}"`; bannerP = `Search results for: ${search}`; }
  else if (offersMode) { bannerH1 = '🏷️ Best Offers'; bannerP = 'Products with the biggest discounts'; }
  else if (activeCat)  { bannerH1 = `${activeCat.icon || '📦'} ${activeCat.name}`; bannerP = isParent ? `Browse subcategories of ${activeCat.name}` : `All products in ${activeCat.name}`; }

  // Reset page when URL params change
  useEffect(() => { setPage(1); }, [catId, catSlug, search, offersMode]);

  useEffect(() => {
    if (!showProducts) { setProducts([]); setTotal(0); return; }
    loadProducts();
  }, [showProducts, resolvedCatId, search, offersMode, sort, page]);

  async function loadProducts() {
    setLoading(true);
    const sortMap = {
      price_asc:  { sort: 'selling_price', order: 'asc' },
      price_desc: { sort: 'selling_price', order: 'desc' },
      newest:     { sort: 'created_at',    order: 'desc' },
      rating:     { sort: 'avg_rating',    order: 'desc' },
    };
    const sortParams = sortMap[sort] || { sort: 'sold_count', order: 'desc' };
    const params = { ...sortParams, page, limit: 12 };
    if (search)        params.search      = search;
    if (offersMode)    params.on_offer    = 1;
    if (resolvedCatId) params.category_id = resolvedCatId;

    const res = await api.get('products', params);
    if (res.success) { setProducts(res.data || []); setTotal(res.meta?.total || 0); }
    else             { setProducts([]); setTotal(0); }
    setLoading(false);
  }

  const pages = Math.ceil(total / 12) || 1;

  const goToCat = (cat) => {
    setPage(1);
    navigate(`/categories?category_id=${cat.id}`);
  };

  return (
    <>
      {/* BANNER */}
      <div className="page-banner">
        <div className="page-banner-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link> ›{' '}
            {activeCat && activeCat.parent_id && (
              <>
                <span
                  style={{ cursor: 'pointer', color: '#81c784' }}
                  onClick={() => navigate(`/categories?category_id=${activeCat.parent_id}`)}
                >
                  {parents.find(p => p.id === activeCat.parent_id)?.name || 'Category'}
                </span>
                {' › '}
              </>
            )}
            {activeCat ? activeCat.name : 'Categories'}
          </div>
          <h1>{bannerH1}</h1>
          <p>{bannerP}</p>
        </div>
      </div>

      <div className="categories-page">
        {/* SIDEBAR */}
        <aside className={'sidebar' + (mobileSb ? ' mobile-open' : '')} id="sidebar">
          <div className="sb-search">
            <input
              type="text"
              placeholder="Search categories..."
              onKeyDown={e => e.key === 'Enter' && navigate(`/categories?search=${encodeURIComponent(e.target.value)}`)}
            />
            <button className="sb-search-btn">🔍</button>
          </div>

          {catsLoading
            ? <div style={{ padding: '20px', color: '#888', fontSize: 13 }}>Loading...</div>
            : parents.map((p, gi) => {
                const children = subs.filter(s => s.parent_id === p.id);
                const isOpen   = openSb === p.id;
                const isActive = activeCat?.id === p.id || activeCat?.parent_id === p.id;
                return (
                  <div key={p.id} className="sb-item">
                    <div
                      className={'sb-header' + (isOpen || isActive ? ' open' : '')}
                      onClick={() => setOpenSb(isOpen ? null : p.id)}
                    >
                      <span className="sb-label">
                        <span className="sb-icon">{p.icon || '📦'}</span> {p.name}
                      </span>
                      <span className="sb-arrow">▼</span>
                    </div>
                    <div className={'sb-sub' + (isOpen || isActive ? ' open' : '')}>
                      <div
                        className={'sb-sub-item' + (!activeCat || activeCat.id === p.id ? ' active' : '')}
                        onClick={() => { goToCat(p); setMobileSb(false); }}
                        style={{ fontWeight: 600 }}
                      >
                        All {p.name}
                      </div>
                      {children.map(s => (
                        <div
                          key={s.id}
                          className={'sb-sub-item' + (activeCat?.id === s.id ? ' active' : '')}
                          onClick={() => { goToCat(s); setMobileSb(false); }}
                        >
                          {s.icon || '📂'} {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          }
        </aside>

        {mobileSb && <div className="sb-overlay open" onClick={() => setMobileSb(false)} />}
        <button className="sb-toggle-btn" onClick={() => setMobileSb(true)}>☰ Categories</button>

        {/* MAIN */}
        <div className="cat-main">

          {/* OVERVIEW — all parent categories */}
          {showOverview && (
            <div className="subcat-section" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text, #1b5e20)', marginBottom: 20 }}>
                🗂️ Browse Categories
              </h2>
              {catsLoading
                ? <div style={{ color: '#888' }}>⏳ Loading categories...</div>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                    {parents.map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => goToCat(cat)}
                        style={{
                          cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
                          border: '1px solid #e8f5e9', background: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.18s, box-shadow 0.18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                      >
                        <div style={{ height: 100, overflow: 'hidden', background: '#f1f8e9' }}>
                          <img
                            src={cat.image_url || FALLBACK_IMG}
                            alt={cat.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.src = FALLBACK_IMG; }}
                          />
                        </div>
                        <div style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon || '📦'}</div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#1b5e20' }}>{cat.name}</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                            {subs.filter(s => s.parent_id === cat.id).length} subcategories
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* SUBCATEGORIES — when a parent is selected */}
          {showSubcats && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1b5e20', marginBottom: 16 }}>
                {activeCat.icon || '📦'} {activeCat.name} — Subcategories
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {subcatsOfActive.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => goToCat(sub)}
                    style={{
                      cursor: 'pointer', borderRadius: 10, padding: '14px 12px', textAlign: 'center',
                      border: '1px solid #e8f5e9', background: '#f9fbe7',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)', transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8f5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f9fbe7'; e.currentTarget.style.transform = ''; }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{sub.icon || '📂'}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#2e7d32' }}>{sub.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS SECTION */}
          {showProducts && (
            <>
              <div className="cat-toolbar">
                <span className="result-count">
                  Showing <b>{total}</b> product{total !== 1 ? 's' : ''}
                  {activeCat ? ` in ${activeCat.name}` : ''}
                </span>
                <select className="sort-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                  <option value="">Sort: Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Best Rating</option>
                </select>
              </div>

              <div className="products-grid-4">
                {loading
                  ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#888' }}>⏳ Loading products...</div>
                  : products.length === 0
                  ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60 }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
                      <div style={{ color: '#888', fontSize: 15 }}>No products found{activeCat ? ` in ${activeCat.name}` : ''}.</div>
                    </div>
                  )
                  : products.map(p => <ProductCard key={p.id} p={p} />)
                }
              </div>

              {pages > 1 && (
                <div className="pagination">
                  <button className="page-btn" onClick={() => page > 1 && setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => (
                    <button key={i + 1} className={'page-btn' + (page === i + 1 ? ' active' : '')} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="page-btn" onClick={() => page < pages && setPage(p => p + 1)}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
