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
    center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
    exit:  (d) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0, transition: { duration: 0.3 } }),
  };

  return (
    <>
      <div style={{ width: 340 }}>

        {/* MAIN IMAGE — fixed 340×340 */}
        <div
          style={{ width: 340, height: 340, position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#f1f8e9', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', cursor: 'zoom-in', marginBottom: 10 }}
          onTouchStart={e => { touchX.current = e.touches[0].clientX; pause(); }}
          onTouchEnd={e => { if (touchX.current === null) return; const d = touchX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 40) go(cur + (d > 0 ? 1 : -1)); touchX.current = null; }}
          onClick={() => setFull(true)}
        >
          {!imgLoaded && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(90deg,#e8f5e9 25%,#f1f8e9 50%,#e8f5e9 75%)', backgroundSize: '300% 100%', animation: 'shimmer 1.4s infinite' }} />
          )}

          <AnimatePresence custom={dir} initial={false}>
            <motion.img
              key={cur} src={imgs[cur]} alt={`product-${cur + 1}`}
              custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
              onLoad={() => setImgLoaded(true)}
              onError={e => { e.target.src = FB; setImgLoaded(true); }}
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              whileHover={{ scale: 1.04 }}
            />
          </AnimatePresence>

          {/* prev/next */}
          {['left','right'].map(side => (
            <button key={side}
              onClick={e => { e.stopPropagation(); go(cur + (side === 'right' ? 1 : -1)); pause(); }}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 10, zIndex: 4, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >{side === 'left' ? '‹' : '›'}</button>
          ))}

          {/* fullscreen */}
          <button onClick={e => { e.stopPropagation(); setFull(true); }}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 4, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >⛶</button>
        </div>

        {/* THUMBNAILS — row below main image */}
        <div style={{ display: 'flex', gap: 8 }}>
          {imgs.map((src, i) => (
            <motion.div key={i}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
              onClick={() => { go(i); pause(); }}
              style={{ width: 74, height: 74, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: i === cur ? '2.5px solid #2e7d32' : '2.5px solid #e0e0e0', boxShadow: i === cur ? '0 0 0 3px rgba(46,125,50,0.15)' : 'none', transition: 'all 0.2s' }}
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
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={e => e.stopPropagation()}
              onError={e => e.target.src = FB}
              style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 16, objectFit: 'contain' }}
            />
            {['left','right'].map(side => (
              <button key={side}
                onClick={e => { e.stopPropagation(); go(cur + (side === 'right' ? 1 : -1)); }}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 20, width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {side === 'left' ? '‹' : '›'}
              </button>
            ))}
            <button onClick={() => setFull(false)} style={{ position: 'absolute', top: 20, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 18, cursor: 'pointer' }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </>
  );
}
