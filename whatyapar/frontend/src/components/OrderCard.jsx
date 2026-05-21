import React, { useState } from 'react';
import { acceptOrder } from '../api';
import { Clock, MessageCircle, Check, Smartphone, FileText, Sparkles, Receipt } from 'lucide-react';

// Build the WhatsApp URL directly here — no separate utility needed
const buildWhatsAppUrl = (mobileNumber, aiSummary, paymentLink) => {
  const clean = (mobileNumber || '').replace(/\D/g, '');
  const number = clean.length === 10 ? `91${clean}` : clean;
  const text = `Hi! Here is your order summary:\n${aiSummary}\n\nPayment link:\n${paymentLink || 'Will be shared shortly'}\n\nThank you!`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

const OrderCard = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAccepted = order.status === 'Accepted' || order.status === 'accepted';

  const handleAccept = () => {
    // Step 1: Open WhatsApp IMMEDIATELY on button click (synchronous — no popup block)
    // Use a temp payment link first; it will be real after backend responds
    const tempPaymentLink = `https://pay.whatyapar.com/${order._id}`;
    const waUrl = buildWhatsAppUrl(order.mobileNumber, order.aiSummary, tempPaymentLink);
    window.open(waUrl, '_blank');

    // Step 2: Update backend in background (async, non-blocking)
    setLoading(true);
    setError('');
    acceptOrder(order._id)
      .then((updatedOrder) => {
        onUpdate(updatedOrder);
      })
      .catch((err) => {
        console.error('Failed to accept order:', err);
        setError('Accepted locally. Backend sync failed.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleWhatsApp = () => {
    const waUrl = buildWhatsAppUrl(order.mobileNumber, order.aiSummary, order.paymentLink);
    window.open(waUrl, '_blank');
  };

  const timeString = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Status bar */}
      <div className={`h-1.5 w-full ${isAccepted ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}></div>

      <div className="p-6 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.customerName}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1 gap-3">
              <span className="flex items-center gap-1"><Smartphone size={14} /> {order.mobileNumber}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
              isAccepted
                ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
            }`}>
              {isAccepted ? 'Accepted' : 'Pending'}
            </span>
            <span className="flex items-center text-xs text-gray-400 mt-2 font-medium">
              <Clock size={12} className="mr-1" /> {timeString}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/50 mb-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-indigo-200"><Sparkles size={24} /></div>
          <h4 className="text-sm font-bold text-indigo-900 mb-2">AI Summary</h4>
          <p className="text-gray-700 text-sm leading-relaxed relative z-10">{order.aiSummary}</p>
        </div>

        {/* Original */}
        <div className="mb-6 flex-grow">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FileText size={12} /> Original Request
          </h4>
          <p className="text-gray-600 text-sm italic line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            "{order.orderDescription}"
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {!isAccepted ? (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebd5a] transition-colors disabled:opacity-70 gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Accept & WhatsApp Customer
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              {order.paymentLink && (
                <div className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="flex items-center text-gray-600 font-medium"><Receipt size={14} className="mr-1.5" /> Payment Link</span>
                  <span className="text-indigo-600 font-mono text-xs truncate max-w-[120px]" title={order.paymentLink}>{order.paymentLink}</span>
                </div>
              )}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebd5a] transition-colors shadow-sm shadow-green-200 gap-2"
              >
                <MessageCircle size={18} />
                WhatsApp Customer Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
