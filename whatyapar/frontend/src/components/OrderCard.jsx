import React, { useState } from 'react';
import { acceptOrder } from '../api';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { Clock, MessageCircle, Check, Smartphone, FileText, Sparkles, Receipt } from 'lucide-react';

const OrderCard = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const updatedOrder = await acceptOrder(order._id);
      onUpdate(updatedOrder);
    } catch (error) {
      console.error('Failed to accept order:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAccepted = order.status === 'accepted';
  const timeString = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = new Date(order.createdAt).toLocaleDateString();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full relative">
      {/* Top Banner / Status Indicator */}
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

        {/* AI Summary Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/50 mb-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-indigo-200">
            <Sparkles size={24} />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <h4 className="text-sm font-bold text-indigo-900">AI Summary</h4>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed relative z-10">{order.aiSummary}</p>
        </div>

        {/* Original Text (Collapsible/Subtle) */}
        <div className="mb-6 flex-grow">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FileText size={12} /> Original Request
          </h4>
          <p className="text-gray-600 text-sm italic line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            "{order.orderDescription}"
          </p>
        </div>

        {/* Actions - Pushed to bottom */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {!isAccepted ? (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Accept & Generate Payment
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <span className="flex items-center text-gray-600 font-medium"><Receipt size={14} className="mr-1.5" /> Payment Link</span>
                <span className="text-indigo-600 font-mono text-xs truncate max-w-[120px]" title={order.paymentLink}>{order.paymentLink}</span>
              </div>
              <a
                href={generateWhatsAppLink(order.mobileNumber, order.aiSummary, order.paymentLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebd5a] transition-colors shadow-sm shadow-green-200"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp Customer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
