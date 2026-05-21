import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createOrder } from '../api';
import { Store, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';

const CustomerForm = () => {
  const { storeSlug } = useParams();
  const [storeName, setStoreName] = useState('');
  const [loadingStore, setLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await api.get(`/orders/store/${storeSlug}`);
        setStoreName(response.data.storeName);
      } catch (error) {
        console.error("Store not found", error);
        setStoreError(true);
      } finally {
        setLoadingStore(false);
      }
    };
    if (storeSlug) {
      fetchStore();
    } else {
      setStoreError(true);
      setLoadingStore(false);
    }
  }, [storeSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await createOrder(storeSlug, {
        customerName,
        mobileNumber,
        orderDescription
      });
      setStatus('success');
      // Reset form
      setCustomerName('');
      setMobileNumber('');
      setOrderDescription('');
    } catch (error) {
      setStatus('error');
    }
  };

  if (loadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-500 mb-6">The link you followed seems to be invalid or the store no longer exists.</p>
          <Link to="/" className="text-indigo-600 font-semibold hover:text-indigo-700">Go to homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white mb-4 shadow-lg border border-white/20">
              <Store size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{storeName}</h2>
            <p className="text-indigo-100 text-sm font-medium">Place your order via WhatsApp</p>
          </div>
        </div>

        {/* Form Area */}
        <div className="px-8 py-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order Submitted!</h3>
              <p className="text-gray-500 mb-6">
                Your order has been sent to {storeName}. They will review it and send you a payment link on WhatsApp shortly.
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Place another order
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Failed to submit order. Please try again or contact the store directly.</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  placeholder="+1 (555) 000-0000"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">What would you like to order?</label>
                <textarea
                  required
                  rows="4"
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 resize-none"
                  placeholder="E.g., I want 2 vanilla cakes and 1 dozen chocolate chip cookies for tomorrow evening..."
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                ></textarea>
                <p className="mt-2 text-xs text-gray-500 text-right">Just type naturally!</p>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {status === 'loading' ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    Submit Order
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="fixed bottom-6 left-0 w-full text-center pointer-events-none">
        <p className="text-xs font-medium text-gray-400">Powered by <span className="text-indigo-400 font-bold">Whatyapar</span></p>
      </div>
    </div>
  );
};

export default CustomerForm;
