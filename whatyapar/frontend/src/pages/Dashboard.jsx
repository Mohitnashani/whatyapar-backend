import React, { useState, useEffect, useContext } from 'react';
import { getOrders } from '../api';
import OrderCard from '../components/OrderCard';
import { AuthContext } from '../context/AuthContext';
import { Store, LogOut, Copy, Check, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // In a real app, you might poll here or use WebSockets
  }, []);

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
  };

  const storeUrl = `${window.location.origin}/${user?.storeSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center">
                  <Store size={18} />
                </div>
                <span className="font-bold text-xl text-gray-900">{user?.storeName}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store URL Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Store Link</h2>
            <p className="text-sm text-gray-500 mt-1">Share this link with your customers on WhatsApp for them to place orders.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex-1 md:w-80 truncate text-sm text-gray-600 font-mono">
              {storeUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shrink-0"
              title="Copy link"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
              title="Open store"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
            {orders.length} Total
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              When customers place orders using your unique store link, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onUpdate={handleOrderUpdate} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
