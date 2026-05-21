import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getOrders, getAnalytics } from '../api';
import OrderCard from '../components/OrderCard';
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';
import TopItems from '../components/TopItems';
import CustomerDirectory from '../components/CustomerDirectory';
import { AuthContext } from '../context/AuthContext';
import {
  Store, LogOut, Copy, Check, ExternalLink,
  LayoutDashboard, ShoppingBag, Users, Settings,
  TrendingUp, Clock, PackageCheck, IndianRupee,
  Download, MessageSquare, ChevronRight, Menu, X, RefreshCw
} from 'lucide-react';

// --- CSV Export utility ---
const downloadCSV = (orders) => {
  const headers = ['Customer', 'Mobile', 'Order', 'AI Summary', 'Price', 'Status', 'Date'];
  const rows = orders.map(o => [
    o.customerName, o.mobileNumber, `"${o.orderDescription.replace(/"/g, "'")}"`,
    `"${o.aiSummary.replace(/"/g, "'")}"`, o.price || 0, o.status,
    new Date(o.createdAt).toLocaleDateString('en-IN')
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'orders.csv'; a.click();
  URL.revokeObjectURL(url);
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ordersData, analyticsData] = await Promise.all([getOrders(), getAnalytics()]);
      setOrders(ordersData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    // Refresh analytics silently in background
    setTimeout(() => fetchData(true), 1500);
  };

  const storeUrl = `${window.location.origin}/${user?.storeSlug}`;
  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const acceptedOrders = orders.filter(o => o.status === 'Accepted' || o.status === 'Paid');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }} />
          <p className="text-sm text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ---- Sidebar ----
  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white ${mobile ? '' : 'border-r border-gray-100'}`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{user?.storeName}</p>
            <p className="text-xs text-gray-400">Whatyapar</p>
          </div>
        </div>
        {mobile && <button onClick={() => setSidebarOpen(false)}><X size={20} className="text-gray-400" /></button>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); if (mobile) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon size={18} />
            {label}
            {id === 'orders' && pendingOrders.length > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            )}
            {activeTab === id && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <button
          onClick={() => downloadCSV(orders)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Download size={18} />
          Export CSV
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  // ---- Overview Tab ----
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={ShoppingBag} label="Total Orders" value={analytics?.totalOrders || 0} color="indigo" />
        <StatsCard icon={Clock} label="Pending" value={analytics?.pendingOrders || 0} sub="Need action" color="amber" />
        <StatsCard icon={PackageCheck} label="Accepted" value={analytics?.acceptedOrders || 0} sub="Fulfilled" color="emerald" />
        <StatsCard icon={IndianRupee} label="Revenue" value={`₹${(analytics?.totalRevenue || 0).toLocaleString()}`} sub="All time" color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {analytics?.monthly && <RevenueChart monthly={analytics.monthly} />}
        </div>
        <div>
          <TopItems items={analytics?.topItems || []} />
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
          <button onClick={() => setActiveTab('orders')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <ShoppingBag className="mx-auto text-gray-200 mb-3" size={40} />
            <p className="font-semibold text-gray-700">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Share your store link to start receiving orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.slice(0, 3).map(order => (
              <OrderCard key={order._id} order={order} onUpdate={handleOrderUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ---- Orders Tab ----
  const OrdersTab = () => {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? orders : filter === 'pending' ? pendingOrders : acceptedOrders;
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{filtered.length} orders</p>
          </div>
          <div className="flex gap-2">
            {[['all', 'All'], ['pending', 'Pending'], ['accepted', 'Accepted']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === val ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <ShoppingBag className="mx-auto text-gray-200 mb-3" size={40} />
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} orders yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(order => (
              <OrderCard key={order._id} order={order} onUpdate={handleOrderUpdate} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---- Settings Tab ----
  const SettingsTab = () => (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Store Link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-1">Your Store Link</h2>
        <p className="text-xs text-gray-500 mb-4">Share this with your customers on WhatsApp to accept orders</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-mono truncate">
            {storeUrl}
          </div>
          <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* WhatsApp Broadcast */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={16} className="text-green-500" />
          <h2 className="text-sm font-bold text-gray-900">WhatsApp Broadcast</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Send a message to all your customers at once</p>
        <BroadcastPanel customers={analytics?.customers || []} storeName={user?.storeName} />
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600"><span>Email</span><span className="font-medium text-gray-900">{user?.email}</span></div>
          <div className="flex justify-between text-gray-600"><span>Store Name</span><span className="font-medium text-gray-900">{user?.storeName}</span></div>
          <div className="flex justify-between text-gray-600"><span>Store Slug</span><span className="font-mono text-indigo-600">{user?.storeSlug}</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-sm font-bold text-gray-900 capitalize">{activeTab}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(true)}
                className={`p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.storeName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.storeName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'customers' && (
            <CustomerDirectory customers={analytics?.customers || []} storeName={user?.storeName} />
          )}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

// ---- Broadcast Panel ----
const BroadcastPanel = ({ customers, storeName }) => {
  const [message, setMessage] = useState('');

  const handleBroadcast = () => {
    if (!message.trim() || customers.length === 0) return;
    // Open WhatsApp links one by one (browser limitation: can't batch)
    // We generate the first customer's link and let them copy the message
    const text = `📢 *Message from ${storeName}:*\n\n${message}`;
    const encoded = encodeURIComponent(text);
    // Open WhatsApp with no specific number so they can pick from contacts
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        placeholder={`e.g., "We have new arrivals this week! Visit our store to check them out."`}
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50"
      />
      <button
        onClick={handleBroadcast}
        disabled={!message.trim()}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#1ebd5a] disabled:opacity-50 transition-colors"
      >
        <MessageSquare size={15} />
        Open in WhatsApp
      </button>
      <p className="text-xs text-gray-400">Opens WhatsApp with your message pre-filled. You can then forward to your customer groups.</p>
    </div>
  );
};

export default Dashboard;
