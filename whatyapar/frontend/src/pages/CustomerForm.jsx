import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createOrder } from '../api';
import api from '../api';

const CustomerForm = () => {
  const { storeSlug } = useParams();
  const [storeName, setStoreName] = useState('');
  const [loadingStore, setLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get(`/orders/store/${storeSlug}`);
        setStoreName(res.data.storeName);
      } catch {
        setStoreError(true);
      } finally {
        setLoadingStore(false);
      }
    };
    if (storeSlug) fetchStore();
    else { setStoreError(true); setLoadingStore(false); }
  }, [storeSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await createOrder(storeSlug, { customerName, mobileNumber, orderDescription });
      setStatus('success');
      setCustomerName(''); setMobileNumber(''); setOrderDescription('');
    } catch {
      setStatus('error');
    }
  };

  if (loadingStore) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (storeError) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Store Not Found</h1>
        <p className="text-gray-500 text-sm">This link is invalid or the store no longer exists. Please contact the business directly.</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        .form-card { animation: fadeUp 0.5s ease forwards; }
        .success-icon { animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .field { position: relative; }
        .field input, .field textarea {
          width: 100%; padding: 14px 16px; border: 1.5px solid #e5e7eb; border-radius: 14px;
          font-size: 15px; background: #f9fafb; outline: none; transition: all 0.2s; color: #111;
          -webkit-appearance: none;
        }
        .field input:focus, .field textarea:focus {
          border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .submit-btn {
          width: 100%; padding: 16px; border: none; border-radius: 14px; font-size: 15px; font-weight: 700;
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          box-shadow: 0 4px 24px rgba(37, 211, 102, 0.35); transition: all 0.2s; letter-spacing: 0.01em;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(37, 211, 102, 0.45); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .bg-page { min-height: 100vh; background: linear-gradient(160deg, #6366f1 0%, #7c3aed 40%, #4f46e5 100%); }
      `}</style>

      <div className="bg-page" style={{ padding: '24px 16px 80px' }}>
        {/* Floating dots decoration */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
              width: [120, 80, 160, 60, 200, 100][i], height: [120, 80, 160, 60, 200, 100][i],
              top: ['10%', '60%', '30%', '80%', '5%', '70%'][i],
              left: ['5%', '80%', '70%', '10%', '50%', '40%'][i],
            }} />
          ))}
        </div>

        <div style={{ maxWidth: 420, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Store Header */}
          <div className="form-card" style={{ textAlign: 'center', marginBottom: 20, paddingTop: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              fontSize: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}>🏪</div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{storeName}</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6 }}>Place your order • We'll reply on WhatsApp</p>
          </div>

          {/* Card */}
          <div className="form-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="success-icon" style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Order Received!</h2>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
                  <strong>{storeName}</strong> will review your order and send you a payment link on WhatsApp shortly.
                </p>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#166534', fontWeight: 500 }}>💡 Keep your WhatsApp ready — you'll receive a message soon!</p>
                </div>
                <button onClick={() => setStatus('idle')} style={{
                  background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '10px 24px',
                  fontSize: 14, fontWeight: 600, color: '#6366f1', cursor: 'pointer'
                }}>
                  Place Another Order
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ marginBottom: 4 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 4px' }}>Place Your Order</h2>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Type in any language — Hindi, English, or Hinglish</p>
                </div>

                {status === 'error' && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#b91c1c', fontWeight: 500 }}>
                    ⚠️ Submission failed. Please try again or contact the store directly.
                  </div>
                )}

                <div className="field">
                  <label>Your Name</label>
                  <input type="text" required placeholder="Rahul Sharma" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>

                <div className="field">
                  <label>WhatsApp Number</label>
                  <input type="tel" required placeholder="98765 43210" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                </div>

                <div className="field">
                  <label>What do you want to order?</label>
                  <textarea required rows={4} placeholder={`Type naturally!\n\nE.g. "2 kg aata, 1 litre doodh aur ek dozen ande dena bhai"`}
                    value={orderDescription} onChange={e => setOrderDescription(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, textAlign: 'right' }}>
                    AI will parse your order automatically ✨
                  </p>
                </div>

                <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <><span style={{ fontSize: 18 }}>📲</span> Send Order via WhatsApp</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Powered by */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 20 }}>
            Powered by <span style={{ color: '#fff', fontWeight: 700 }}>Whatyapar</span> • AI Order Management
          </p>
        </div>
      </div>
    </>
  );
};

export default CustomerForm;
