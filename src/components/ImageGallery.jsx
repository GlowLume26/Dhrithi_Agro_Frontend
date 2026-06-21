import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FB = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80';
const FB4 = [
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
];

export default function ImageGallery({ images = [] }) {
  const imgs = images.length >= 4 ? images : FB4;
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const [full, setFull] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const timerRef = useRef(null);
  const touchX = useRef(null);

  const go = useCallback((idx) => {
    const next = (idx + imgs.length) % imgs.length;
    setDir(next > cur ? 1 : -1);
    setCur(next);
    setImgLoaded(false);
  }, [cur, imgs.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => setCur(c => { setDir(1); setImgLoaded(false); return (c + 1) % imgs.length; }), 3000);
    return () => clearInterval(timerRef.current);
  }, [imgs.length]);

  const pause = () => clearInterval(timerRef.current);

  const variants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
    exit:  (d) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0, transition: { duration: 0.35 } }),
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* MAIN FRAME */}
        <div
          style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', background: '#f1f8e9', aspectRatio: '4/3.2', boxShadow: '0 12px 50px rgba(0,0,0,0.13)', cursor: 'zoom-in' }}
          onTouchStart={e => { touchX.current = e.touches[0].clientX; pause(); }}
          onTouchEnd={e => { if (touchX.current === null) return; const d = touchX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 40) go(cur + (d > 0 ? 1 : -1)); touchX.current = null; }}
          onClick={() => setFull(true)}
        >
          {/* shimmer until loaded */}
          {!imgLoaded && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(90deg,#e8f5e9 25%,#f1f8e9 50%,#e8f5e9 75%)', backgroundSize: '300% 100%', animation: 'shimmer 1.4s infinite' }} />
          )}

          <AnimatePresence custom={dir} initial={false}>
            <motion.img
              key={cur}
              src={imgs[cur]}
              alt={`product-${cur + 1}`}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              onLoad={() => setImgLoaded(true)}
              onError={e => { e.target.src = FB; setImgLoaded(true); }}
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              whileHover={{ scale: 1.06 }}
            />
          </AnimatePresence>

          {/* glass prev/next */}
          {['left', 'right'].map(side => (
            <button key={side}
              onClick={e => { e.stopPropagation(); go(cur + (side === 'right' ? 1 : -1)); pause(); }}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                [side]: 14, zIndex: 4,
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1.5px solid rgba(255,255,255,0.45)',
                color: 'white', fontSize: 22, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                transition: 'background 0.2s',
              }}
            >
              {side === 'left' ? '‹' : '›'}
            </button>
          ))}

          {/* counter badge */}
          <div style={{ position: 'absolute', bottom: 14, right: 16, zIndex: 4, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
            {cur + 1} / {imgs.length}
          </div>

          {/* fullscreen icon */}
          <button
            onClick={e => { e.stopPropagation(); setFull(true); }}
            style={{ position: 'absolute', top: 14, right: 14, zIndex: 4, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >⛶</button>

          {/* dot indicators */}
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 4 }}>
            {imgs.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); go(i); pause(); }}
                style={{ padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4, height: 8, width: i === cur ? 24 : 8, background: i === cur ? '#f9a825' : 'rgba(255,255,255,0.55)', transition: 'all 0.3s' }}
              />
            ))}
          </div>
        </div>

        {/* THUMBNAILS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {imgs.map((src, i) => (
            <motion.div key={i}
              whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.97 }}
              onClick={() => { go(i); pause(); }}
              style={{ aspectRatio: '1', borderRadius: 13, overflow: 'hidden', cursor: 'pointer', border: i === cur ? '2.5px solid #2e7d32' : '2.5px solid transparent', boxShadow: i === cur ? '0 0 0 3px rgba(46,125,50,0.2)' : '0 2px 8px rgba(0,0,0,0.07)', transition: 'border 0.2s, box-shadow 0.2s' }}
            >
              <img src={src} alt={`thumb-${i}`} loading="lazy" onError={e => e.target.src = FB}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN */}
      <AnimatePresence>
        {full && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFull(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.img
              key={cur} src={imgs[cur]} alt="fullscreen"
              initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.32 }}
              onClick={e => e.stopPropagation()}
              onError={e => e.target.src = FB}
              style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 18, objectFit: 'contain', boxShadow: '0 32px 90px rgba(0,0,0,0.55)' }}
            />
            {['left','right'].map(side => (
              <button key={side}
                onClick={e => { e.stopPropagation(); go(cur + (side === 'right' ? 1 : -1)); }}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 20, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {side === 'left' ? '‹' : '›'}
              </button>
            ))}
            <button onClick={() => setFull(false)} style={{ position: 'absolute', top: 20, right: 24, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
            <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600 }}>{cur + 1} / {imgs.length}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </>
  );
}
