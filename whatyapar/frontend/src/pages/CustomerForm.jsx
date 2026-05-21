import React, { useState } from 'react';
import { createOrder } from '../api';
import { CheckCircle2, Loader2 } from 'lucide-react';

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    orderDescription: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Enforce digits only for mobile number
    if (name === 'mobileNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await createOrder(formData);
      setIsSuccess(true);
      setFormData({ customerName: '', mobileNumber: '', orderDescription: '' });
    } catch (err) {
      setError('Failed to submit order. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Order Received!</h2>
          <p className="text-gray-600">
            Thank you for your order. We will review it and send you a payment link on WhatsApp shortly.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="mt-6 w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Whatyapar Order</h1>
          <p className="opacity-90 mt-1">Quick and easy ordering</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              required
              value={formData.customerName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              required
              value={formData.mobileNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label htmlFor="orderDescription" className="block text-sm font-medium text-gray-700 mb-1">
              What would you like to order?
            </label>
            <textarea
              id="orderDescription"
              name="orderDescription"
              required
              rows={5}
              value={formData.orderDescription}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
              placeholder="Type your order details here in plain text..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary hover:bg-primaryDark text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Order...
              </>
            ) : (
              'Submit Order'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
