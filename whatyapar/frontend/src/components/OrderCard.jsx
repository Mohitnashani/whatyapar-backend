import React, { useState } from 'react';
import { acceptOrder } from '../api';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { ChevronDown, ChevronUp, Check, MessageCircle, Loader2 } from 'lucide-react';

const OrderCard = ({ order, onOrderUpdated }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const updatedOrder = await acceptOrder(order._id);
      onOrderUpdated(updatedOrder);
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert('Failed to accept order.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSendMessage = () => {
    sendWhatsAppMessage(order.mobileNumber, order.aiSummary, order.paymentLink);
  };

  const isPending = order.status === 'Pending';
  const isAccepted = order.status === 'Accepted';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-50 flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{order.customerName}</h3>
          <p className="text-gray-500 text-sm">{order.mobileNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPending ? 'bg-yellow-100 text-yellow-800' : 
          isAccepted ? 'bg-green-100 text-green-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Summary</h4>
          <p className="text-gray-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            {order.aiSummary || "Processing..."}
          </p>
        </div>

        <div>
          <button 
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            {showOriginal ? <ChevronUp className="w-4 h-4 mr-1"/> : <ChevronDown className="w-4 h-4 mr-1"/>}
            {showOriginal ? 'Hide Original Message' : 'View Original Message'}
          </button>
          
          {showOriginal && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 whitespace-pre-wrap">
              {order.orderDescription}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 bg-gray-50 border-t border-gray-100">
        {isPending && (
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isAccepting ? 'Accepting...' : 'Accept Order'}
          </button>
        )}

        {isAccepted && (
          <button
            onClick={handleSendMessage}
            className="w-full py-2.5 bg-primary hover:bg-primaryDark text-white rounded-lg font-medium shadow-sm transition-colors flex justify-center items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Send Message to Customer
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
