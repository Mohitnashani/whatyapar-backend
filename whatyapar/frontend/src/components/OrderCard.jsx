import React, { useState } from 'react';
import { acceptOrder } from '../api';
import { Clock, MessageCircle, Check, Smartphone, FileText, Sparkles, Receipt, IndianRupee } from 'lucide-react';

const buildWhatsAppUrl = (mobileNumber, aiSummary, paymentLink, price) => {
  const clean = (mobileNumber || '').replace(/\D/g, '');
  const number = clean.length === 10 ? `91${clean}` : clean;
  const priceText = price > 0 ? `\n💰 *Bill Amount: ₹${price}*` : '';
  const text = `✅ *Order Confirmed!*\n\n📦 *Summary:*\n${aiSummary}${priceText}\n\n💳 *Payment Link:*\n${paymentLink || 'Will be shared shortly'}\n\nThank you for ordering! 🙏`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

const OrderCard = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [error, setError] = useState('');

  const isAccepted = order.status === 'Accepted' || order.status === 'accepted';

  const handleAccept = () => {
    const finalPrice = parseFloat(price) || 0;
    const tempPaymentLink = `https://pay.whatyapar.com/${order._id}`;

    // Step 1: Open WhatsApp IMMEDIATELY on click (synchronous — bypasses all popup blockers)
    const waUrl = buildWhatsAppUrl(order.mobileNumber, order.aiSummary, tempPaymentLink, finalPrice);
    window.open(waUrl, '_blank');

    // Step 2: Update backend in background (async, non-blocking)
    setLoading(true);
    setError('');
    acceptOrder(order._id, finalPrice)
      .then((updatedOrder) => {
        onUpdate(updatedOrder);
        setShowPriceInput(false);
      })
      .catch((err) => {
        console.error('Backend sync failed:', err.response?.data || err.message);
        setError('WhatsApp opened. Backend update failed — check your connection.');
      })
      .finally(() => setLoading(false));
  };

  const handleWhatsApp = () => {
    const waUrl = buildWhatsAppUrl(order.mobileNumber, order.aiSummary, order.paymentLink, order.price);
    window.open(waUrl, '_blank');
  };

  const timeString = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
      {/* Status bar */}
      <div className={`h-1.5 w-full ${isAccepted ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />

      <div className="p-5 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{order.customerName}</h3>
            <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
              <Smartphone size={12} /> {order.mobileNumber}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              isAccepted ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {isAccepted ? '✓ Accepted' : '● Pending'}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={10} /> {dateString}, {timeString}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3.5 border border-indigo-100/50 mb-3 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 text-indigo-100"><Sparkles size={32} /></div>
          <p className="text-xs font-bold text-indigo-800 mb-1 uppercase tracking-wider">AI Summary</p>
          <p className="text-gray-700 text-sm leading-relaxed relative z-10">{order.aiSummary}</p>
        </div>

        {/* Original */}
        <div className="mb-4 flex-grow">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FileText size={11} /> Customer's Words
          </p>
          <p className="text-gray-500 text-xs italic line-clamp-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            "{order.orderDescription}"
          </p>
        </div>

        {/* Price if accepted */}
        {isAccepted && order.price > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg mb-3 border border-emerald-100">
            <IndianRupee size={14} /> {order.price.toLocaleString()} billed
          </div>
        )}

        {error && <p className="text-xs text-red-500 mb-2 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          {!isAccepted ? (
            !showPriceInput ? (
              <button
                onClick={() => setShowPriceInput(true)}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors gap-2"
              >
                <Check size={15} />
                Accept Order
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <IndianRupee size={14} />
                  </div>
                  <input
                    type="number"
                    placeholder="Enter bill amount (optional)"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebd5a] transition-colors gap-2 disabled:opacity-70"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><MessageCircle size={16} /> Accept & Send on WhatsApp</>
                  }
                </button>
                <button
                  onClick={() => setShowPriceInput(false)}
                  className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {order.paymentLink && (
                <div className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <span className="flex items-center text-gray-500 gap-1"><Receipt size={12} /> Payment Link</span>
                  <span className="text-indigo-600 font-mono truncate max-w-[130px]" title={order.paymentLink}>{order.paymentLink}</span>
                </div>
              )}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebd5a] transition-colors gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
