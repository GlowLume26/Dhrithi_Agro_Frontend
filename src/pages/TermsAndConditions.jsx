import { useState } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'general', title: '1. General Terms',
    content: `By accessing or using Drithi Agro's platform, you agree to be bound by these Terms & Conditions. These terms apply to all visitors, buyers, sellers, and vendors. Drithi Agro reserves the right to update these terms at any time without prior notice.`,
  },
  {
    id: 'buyer', title: '2. Buyer Terms',
    content: `As a buyer on Drithi Agro:\n• You must provide accurate personal and delivery information.\n• Orders once placed cannot be cancelled after dispatch.\n• Returns are accepted within 7 days of delivery for eligible products.\n• Drithi Agro is not responsible for delays caused by third-party logistics.\n• Buyers must not misuse the platform for fraudulent purchases.\n• Payment disputes must be raised within 48 hours of transaction.`,
  },
  {
    id: 'seller', title: '3. Seller / Vendor Terms',
    content: `As a seller on Drithi Agro:\n• You must hold a valid GST registration and Trade/Shop Licence.\n• All products listed must be genuine, correctly described, and legally permitted for sale.\n• Sellers are responsible for accurate stock management and timely dispatch.\n• Drithi Agro charges a commission on each successful order (see Order Commission Policy).\n• Payouts are processed weekly after deducting applicable commissions and taxes.\n• Sellers must not list counterfeit, banned, or restricted agricultural products.\n• Drithi Agro reserves the right to suspend or terminate seller accounts for policy violations.`,
  },
  {
    id: 'commission', title: '4. Order Commission Policy',
    content: `Drithi Agro charges the following commission rates on successful orders:\n\n• Seeds & Planting: 8%\n• Fertilizers & Nutrients: 7%\n• Pesticides & Herbicides: 9%\n• Organic Farming Products: 6%\n• Farm Equipment: 5%\n• Irrigation Systems: 5%\n• Animal Husbandry: 7%\n• Multi-Category: 8%\n\nCommission is calculated on the final order value (excluding shipping). GST at 18% is applicable on the commission amount. Payouts = Order Value − Commission − GST on Commission.`,
  },
  {
    id: 'documents', title: '5. Document Requirements',
    content: `Sellers are required to submit the following documents for verification:\n• Aadhaar Card (Front & Back)\n• PAN Card\n• GST Registration Certificate (mandatory for sellers)\n• Trade / Shop Licence (mandatory for sellers)\n• Business Registration Certificate\n• Bank Passbook or Cancelled Cheque\n• Business Logo\n\nBuyers are required to submit:\n• Aadhaar Card\n• PAN Card\n• Bank Passbook or Cancelled Cheque\n\nAll documents must be valid, legible, and not expired. Drithi Agro reserves the right to reject applications with incomplete or fraudulent documents.`,
  },
  {
    id: 'privacy', title: '6. Privacy Policy',
    content: `Drithi Agro collects personal information solely for the purpose of providing services. Your data will not be sold to third parties. We use industry-standard encryption to protect your information. By using our platform, you consent to our data collection and usage practices as described in our full Privacy Policy.`,
  },
  {
    id: 'disputes', title: '7. Dispute Resolution',
    content: `Any disputes arising from transactions on Drithi Agro must first be raised through our support portal. If unresolved within 15 business days, disputes will be subject to arbitration under the laws of India. The jurisdiction for all legal matters shall be the courts of Hyderabad, Telangana.`,
  },
  {
    id: 'termination', title: '8. Account Termination',
    content: `Drithi Agro reserves the right to suspend or permanently terminate any account that:\n• Violates these Terms & Conditions\n• Engages in fraudulent activity\n• Lists prohibited or counterfeit products\n• Receives repeated buyer complaints\n• Fails to maintain required documentation`,
  },
];

export default function TermsAndConditions() {
  const [active, setActive] = useState('general');

  return (
    <>
      <div style={{ background: '#f5f5f5', padding: '12px 40px', fontSize: 13, color: '#666' }}>
        <Link to="/" style={{ color: '#2e7d32' }}>Home</Link> › Terms & Conditions
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', padding: '48px 40px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📜</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Terms & Conditions</h1>
        <p style={{ fontSize: 14, opacity: 0.85 }}>Last updated: January 2025 · Effective immediately</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar nav */}
        <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 80 }}>
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e0e0e0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 16px', background: '#f9fbe7', borderBottom: '1px solid #e0e0e0', fontSize: 12, fontWeight: 700, color: '#1b5e20', textTransform: 'uppercase', letterSpacing: 1 }}>Contents</div>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', border: 'none', borderBottom: '1px solid #f0f0f0', fontSize: 13, cursor: 'pointer', fontWeight: active === s.id ? 700 : 400, background: active === s.id ? '#e8f5e9' : 'white', color: active === s.id ? '#1b5e20' : '#444', transition: 'background 0.15s' }}>
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {SECTIONS.map(s => (
            <div key={s.id} id={s.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e0e0e0', padding: '28px 32px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', borderLeft: active === s.id ? '4px solid #2e7d32' : '4px solid transparent', transition: 'border-color 0.2s' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1b5e20', marginBottom: 14 }}>{s.title}</h2>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
            </div>
          ))}

          <div style={{ background: '#e8f5e9', borderRadius: 14, padding: '20px 28px', fontSize: 13, color: '#2e7d32', marginTop: 8 }}>
            <b>📞 Questions?</b> Contact us at <b>support@drithiagro.com</b> or call our helpline <b>1800-XXX-XXXX</b> (Mon–Sat, 9am–6pm)
          </div>
        </div>
      </div>
    </>
  );
}
