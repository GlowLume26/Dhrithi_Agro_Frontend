import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const CAT_NAMES = {
  1:'💧 Irrigation',2:'🌿 Gardening',3:'🐄 Cattle & Bird Care',4:'🌧️ Sprinkler',
  5:'💦 Drip Irrigation Accessories',6:'🔩 Pipe & Fitting',7:'🪣 Drip Irrigation Kit',
  8:'🌂 Rain Pipe',9:'🔧 Tools',10:'🧴 Spray Pumps',11:'🌱 Lawn Mowers',12:'🪨 Pebbles',
  13:'🎒 Accessories',14:'🌰 Seeds',15:'🧪 Fertilizer',16:'🛡️ Pesticides',
  17:'🕸️ Garden Shade Net',18:'🥥 Coco Peat',19:'♻️ Water Compost',20:'🧰 Gardening Kit',
  21:'🛍️ Grow Bag',22:'🌾 De Oiled Cake',23:'🌸 Flower Seeds',24:'⚗️ Fertilizer Blend',
  25:'🪴 Transplanting Mat',26:'🌿 Fodder Seed',27:'💊 Mineral Mixture',28:'🐦 Bird Food',
  29:'🦟 Mosquito Net',30:'🐟 Aqua Care',31:'🦐 Aquaculture Feed Additives',
  32:'🐑 Goat & Sheep Care',33:'🐔 Poultry Feed Supplements',34:'🐷 Swine Supplement',
  35:'🎒 Silage Bag',36:'💉 Animal Health Supplements',
};

const SIDEBAR_GROUPS = [
  { icon: '🏷️', label: 'Brands', id: 'brands', subs: [] },
  { icon: '🌱', label: 'Seeds', subs: [{id:14,n:'Gardening Seeds'},{id:23,n:'Flower Seeds'},{id:26,n:'Fodder Seed'},{id:2,n:'All Seeds'}] },
  { icon: '🛡️', label: 'Crop Protection', subs: [{id:16,n:'Pesticides'},{id:10,n:'Spray Pumps'},{id:17,n:'Garden Shade Net'},{id:29,n:'Mosquito Net'}] },
  { icon: '🧪', label: 'Crop Nutrition', subs: [{id:15,n:'Fertilizer'},{id:24,n:'Fertilizer Blend'},{id:18,n:'Coco Peat'},{id:19,n:'Water Compost'},{id:22,n:'De Oiled Cake'}] },
  { icon: '⚙️', label: 'Equipments', subs: [{id:9,n:'Tools'},{id:11,n:'Lawn Mowers'},{id:20,n:'Gardening Kit'},{id:1,n:'Irrigation Equip'},{id:7,n:'Drip Kit'},{id:4,n:'Sprinkler'},{id:6,n:'Pipe & Fitting'}] },
  { icon: '🐄', label: 'Animal Husbandry', subs: [{id:27,n:'Mineral Mixture'},{id:28,n:'Bird Food'},{id:32,n:'Goat & Sheep'},{id:33,n:'Poultry Feed'},{id:34,n:'Swine Supplement'},{id:36,n:'Animal Health'},{id:35,n:'Silage Bag'}] },
  { icon: '🌿', label: 'Organic', subs: [{id:19,n:'Water Compost'},{id:18,n:'Coco Peat'},{id:22,n:'De Oiled Cake'},{id:31,n:'Aquaculture Additives'}] },
  { icon: '⭐', label: 'TAPAS', subs: [], specials: [{label:'Top Rated',params:{sort:'avg_rating',order:'desc'}},{label:'Best Sellers',params:{sort:'sold_count',order:'desc'}},{label:'New Arrivals',params:{sort:'created_at',order:'desc'}}] },
];

const FALLBACK_BRANDS = [
  {name:'Bayer CropScience',slug:'bayer'},{name:'IFFCO',slug:'iffco'},
  {name:'Syngenta',slug:'syngenta'},{name:'Jain Irrigation',slug:'jain-irrigation'},
  {name:'PI Industries',slug:'pi-industries'},{name:'UPL Limited',slug:'upl'},
  {name:'Mahyco',slug:'mahyco'},{name:'Coromandel',slug:'coromandel'},
  {name:'Rallis India',slug:'rallis'},{name:'Nuziveedu Seeds',slug:'nuziveedu'},
];

const BIG_CATS = [
  { id:1, label:'💧 Irrigation', sub:'Sprinkler • Drip • Pipe & Fitting • Rain Pipe', img:'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80' },
  { id:2, label:'🌿 Gardening', sub:'Tools • Seeds • Fertilizer • Grow Bag & More', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80' },
  { id:3, label:'🐄 Cattle & Bird Care', sub:'Fodder • Poultry • Aqua Care • Animal Health', img:'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80' },
];

const SUB_COLS = [
  { parent:1, label:'💧 Irrigation', subs:[{id:4,n:'🌧️ Sprinkler'},{id:5,n:'💦 Drip Accessories'},{id:6,n:'🔩 Pipe & Fitting'},{id:7,n:'🪣 Drip Kit'},{id:8,n:'🌂 Rain Pipe'}] },
  { parent:2, label:'🌿 Gardening', subs:[{id:9,n:'🔧 Tools'},{id:10,n:'🧴 Spray Pumps'},{id:11,n:'🌱 Lawn Mowers'},{id:14,n:'🌰 Seeds'},{id:15,n:'🧪 Fertilizer'},{id:16,n:'🛡️ Pesticides'},{id:17,n:'🕸️ Shade Net'},{id:18,n:'🥥 Coco Peat'},{id:19,n:'♻️ Compost'},{id:20,n:'🧰 Gardening Kit'},{id:21,n:'🛍️ Grow Bag'},{id:22,n:'🌾 De Oiled Cake'},{id:23,n:'🌸 Flower Seeds'},{id:24,n:'⚗️ Fertilizer Blend'},{id:25,n:'🪴 Transplanting Mat'}] },
  { parent:3, label:'🐄 Cattle & Bird Care', subs:[{id:26,n:'🌿 Fodder Seed'},{id:27,n:'💊 Mineral Mixture'},{id:28,n:'🐦 Bird Food'},{id:29,n:'🦟 Mosquito Net'},{id:30,n:'🐟 Aqua Care'},{id:31,n:'🦐 Aquaculture Additives'},{id:32,n:'🐑 Goat & Sheep'},{id:33,n:'🐔 Poultry Feed'},{id:34,n:'🐷 Swine Supplement'},{id:35,n:'🎒 Silage Bag'},{id:36,n:'💉 Animal Health'}] },
];

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('');
  const [openSb, setOpenSb] = useState(null);
  const [brands, setBrands] = useState(FALLBACK_BRANDS);
  const [mobileSb, setMobileSb] = useState(false);
  const [showOverview, setShowOverview] = useState(true);
  const [productsTitle, setProductsTitle] = useState('');
  const [banner, setBanner] = useState({ h1:'🌾 All Categories', p:'Explore 10,000+ products across all farming categories' });

  const search = searchParams.get('search') || '';
  const catId  = searchParams.get('category_id') || '';
  const offers = searchParams.get('offers') || '';

  useEffect(() => {
    api.get('brands').then(r => r.success && r.data?.length && setBrands(r.data));
  }, []);

  useEffect(() => {
    let f = {};
    if (search) {
      f = { search };
      setShowOverview(false);
      setProductsTitle(`🔍 Results for "${search}"`);
      setBanner({ h1:'🔍 Search Results', p:`Showing results for: "${search}"` });
    } else if (offers) {
      f = { on_offer: 1 };
      setShowOverview(false);
      setProductsTitle('🏷️ Best Offers');
      setBanner({ h1:'🏷️ Best Offers', p:'Products with the biggest discounts — limited time only!' });
    } else if (catId) {
      f = { category_id: +catId };
      const label = CAT_NAMES[+catId] || 'Category';
      setShowOverview(false);
      setProductsTitle(label);
      setBanner({ h1: label, p:`Browse all products in ${label.replace(/^\S+\s/, '')}` });
    } else {
      setShowOverview(true);
      setProductsTitle('🔥 Featured Products');
    }
    setFilters(f);
    setPage(1);
  }, [search, catId, offers]);

  useEffect(() => { loadProducts(); }, [filters, sort, page]);

  async function loadProducts() {
    setLoading(true);
    const sortMap = { price_asc:{sort:'selling_price',order:'asc'}, price_desc:{sort:'selling_price',order:'desc'}, newest:{sort:'created_at',order:'desc'}, rating:{sort:'avg_rating',order:'desc'} };
    const sortParams = sortMap[sort] || { sort:'sold_count', order:'desc' };
    const res = await api.get('products', { ...filters, ...sortParams, page, limit:8 });
    if (res.success) { setProducts(res.data); setTotal(res.meta?.total || 0); }
    else { setProducts([]); setTotal(0); }
    setLoading(false);
  }

  const pages = Math.ceil(total / 8) || 1;

  return (
    <>
      <div className="page-banner">
        <div className="page-banner-content">
          <div className="breadcrumb"><Link to="/">Home</Link> › Categories</div>
          <h1>{banner.h1}</h1>
          <p>{banner.p}</p>
        </div>
      </div>

      <div className="categories-page">
        {/* SIDEBAR */}
        <aside className={'sidebar' + (mobileSb ? ' mobile-open' : '')} id="sidebar">
          <div className="sb-search">
            <input type="text" placeholder="Search categories..." />
            <button className="sb-search-btn">🔍</button>
          </div>

          {SIDEBAR_GROUPS.map((g, gi) => (
            <div key={gi} className="sb-item">
              <div className={'sb-header' + (openSb === gi ? ' open' : '')} onClick={() => setOpenSb(openSb === gi ? null : gi)}>
                <span className="sb-label"><span className="sb-icon">{g.icon}</span> {g.label}</span>
                <span className="sb-arrow">▼</span>
              </div>
              <div className={'sb-sub' + (openSb === gi ? ' open' : '')}>
                {g.id === 'brands'
                  ? brands.map(b => <div key={b.slug} className="sb-sub-item" onClick={() => { navigate(`/categories?search=${encodeURIComponent(b.name)}`); setMobileSb(false); }}>{b.name}</div>)
                  : g.specials
                  ? g.specials.map(s => <div key={s.label} className="sb-sub-item" onClick={() => { setFilters(s.params); setShowOverview(false); setProductsTitle(s.label); setMobileSb(false); }}>{s.label}</div>)
                  : g.subs.map(s => <div key={s.id} className="sb-sub-item" onClick={() => { navigate(`/categories?category_id=${s.id}`); setMobileSb(false); }}>{s.n}</div>)
                }
              </div>
            </div>
          ))}
        </aside>

        {mobileSb && <div className="sb-overlay open" onClick={() => setMobileSb(false)} />}
        <button className="sb-toggle-btn" onClick={() => setMobileSb(true)}>☰ Categories</button>

        {/* MAIN */}
        <div className="cat-main">
          <div className="cat-toolbar">
            <span className="result-count">Showing <b>{total}</b> products</span>
            <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
              <select className="sort-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                <option value="">Sort: Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>
          </div>

          {showOverview && (
            <>
              <div className="big-cats-grid">
                {BIG_CATS.map(c => (
                  <div key={c.id} className="big-cat-card" onClick={() => navigate(`/categories?category_id=${c.id}`)}>
                    <img src={c.img} alt={c.label} />
                    <div className="big-cat-overlay">
                      <div className="cat-arrow">→</div>
                      <h3>{c.label}</h3>
                      <span>{c.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="tips-banner">
                <div>
                  <h3>🌾 Free Crop Advisory</h3>
                  <p>Talk to our agri-experts for personalized crop protection and nutrition advice — completely free!</p>
                </div>
                <button className="tips-btn" onClick={() => navigate('/contact')}>📞 Call Expert Now</button>
              </div>

              <div className="subcat-section">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
                  {SUB_COLS.map(col => (
                    <div key={col.parent}>
                      <h2 style={{ fontSize:17, fontWeight:800, color:'#1b5e20', marginBottom:14, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }} onClick={() => navigate(`/categories?category_id=${col.parent}`)}>
                        {col.label} <span style={{ fontSize:12, color:'#888', fontWeight:400 }}>→</span>
                      </h2>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {col.subs.map(s => <div key={s.id} className="subcat-row" onClick={() => navigate(`/categories?category_id=${s.id}`)}>{s.n}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="products-section">
            {productsTitle && <h2 id="productsTitle">{productsTitle}</h2>}
            <div className="products-grid-4">
              {loading
                ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'#888' }}>⏳ Loading products...</div>
                : products.length === 0
                ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'#888' }}>😔 No products found.</div>
                : products.map(p => <ProductCard key={p.id} p={p} />)
              }
            </div>

            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => page > 1 && setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => (
                  <button key={i+1} className={'page-btn' + (page === i+1 ? ' active' : '')} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
                <button className="page-btn" onClick={() => page < pages && setPage(p => p + 1)}>›</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
