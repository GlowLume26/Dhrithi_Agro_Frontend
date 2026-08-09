import { motion } from 'framer-motion';

export default function QuantityVariants({ variants, selected, onSelect }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#888', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
        Select Pack Size
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {variants.map((v, i) => {
          const active = selected === i;
          return (
            <motion.div key={i}
              onClick={() => onSelect(i, v.price)}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
              style={{
                cursor: 'pointer', borderRadius: 14, padding: '11px 18px', minWidth: 74,
                textAlign: 'center', position: 'relative',
                border: active ? '2.5px solid #2e7d32' : '2px solid #e0e0e0',
                background: active ? 'linear-gradient(135deg,#e8f5e9,#f1f8e9)' : 'white',
                boxShadow: active ? '0 0 0 3px rgba(46,125,50,0.15), 0 6px 20px rgba(46,125,50,0.14)' : '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'border 0.2s, background 0.2s, box-shadow 0.2s',
              }}
            >
              {active && (
                <motion.div layoutId="checkBadge"
                  style={{ position: 'absolute', top: -9, right: -9, width: 20, height: 20, borderRadius: '50%', background: '#2e7d32', color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(46,125,50,0.4)' }}
                >✓</motion.div>
              )}
              <div style={{ fontSize: 14, fontWeight: 800, color: active ? '#1b5e20' : '#333', marginBottom: 4 }}>{v.qty}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: active ? '#2e7d32' : '#666' }}>₹{v.price}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
