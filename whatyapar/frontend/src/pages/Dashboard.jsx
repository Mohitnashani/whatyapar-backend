import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { getOrders, getAnalytics } from '../api';
import OrderCard from '../components/OrderCard';
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';
import TopItems from '../components/TopItems';
import CustomerDirectory from '../components/CustomerDirectory';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Store, LogOut, Copy, Check, ExternalLink,
  LayoutDashboard, ShoppingBag, Users, Settings,
  TrendingUp, Clock, PackageCheck, IndianRupee,
  Download, MessageSquare, ChevronRight, Menu, X, RefreshCw
} from 'lucide-react';

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
  toast.success('CSV downloaded');
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

  const prevOrdersCount = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ordersData, analyticsData] = await Promise.all([getOrders(), getAnalytics()]);
      
      // Check for new orders (only if it's a silent background poll)
      if (silent && prevOrdersCount.current !== null && ordersData.length > prevOrdersCount.current) {
        toast.success(`You have ${ordersData.length - prevOrdersCount.current} new order(s)!`, {
          icon: '🔔',
          style: { background: '#4f46e5', color: '#fff' }
        });
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio blocked', e));
        } catch (e) {}
      }
      
      setOrders(ordersData);
      setAnalytics(analyticsData);
      prevOrdersCount.current = ordersData.length;

    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (!silent) toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    toast.success('Order status updated');
    setTimeout(() => fetchData(true), 1500);
  };

  const storeUrl = `${window.location.origin}/${user?.storeSlug}`;
  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success('Store link copied to clipboard');
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

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white ${mobile ? '' : 'border-r border-gray-100'}`}>
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
            <Store size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{user?.storeName}</p>
            <p className="text-xs text-gray-400">Whatyapar Dashboard</p>
          </div>
        </div>
        {mobile && <button onClick={() => setSidebarOpen(false)}><X size={20} className="text-gray-400" /></button>}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); if (mobile) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
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

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <button
          onClick={() => downloadCSV(orders)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Download size={18} /> Export CSV
        </button>
        <button
          onClick={() => { toast.success('Logged out successfully'); logout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={ShoppingBag} label="Total Orders" value={analytics?.totalOrders || 0} color="indigo" />
        <StatsCard icon={Clock} label="Pending" value={analytics?.pendingOrders || 0} sub="Need action" color="amber" />
        <StatsCard icon={PackageCheck} label="Accepted" value={analytics?.acceptedOrders || 0} sub="Fulfilled" color="emerald" />
        <StatsCard icon={IndianRupee} label="Revenue" value={`₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`} sub="All time" color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {analytics?.monthly && <RevenueChart monthly={analytics.monthly} />}
        </div>
        <div>
          <TopItems items={analytics?.topItems || []} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
          <button onClick={() => setActiveTab('orders')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
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

  const OrdersTab = () => {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? orders : filter === 'pending' ? pendingOrders : acceptedOrders;
    return (
      <div className="animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{filtered.length} orders found</p>
          </div>
          <div className="flex gap-2">
            {[['all', 'All'], ['pending', 'Pending'], ['accepted', 'Accepted']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === val ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
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

  const SettingsTab = () => (
    <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Your Store Link</h2>
        <p className="text-xs text-gray-500 mb-4">Share this with your customers on WhatsApp to accept orders</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-mono truncate select-all">
            {storeUrl}
          </div>
          <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm active:scale-95">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={16} className="text-[#25D366]" />
          <h2 className="text-sm font-bold text-gray-900">WhatsApp Broadcast</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Send a message to all your customers at once</p>
        <BroadcastPanel customers={analytics?.customers || []} storeName={user?.storeName} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Account</h2>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500">Store Name</span>
            <span className="font-medium text-gray-900">{user?.storeName}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500">Store Slug</span>
            <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{user?.storeSlug}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 shadow-2xl bg-white">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 capitalize tracking-tight">{activeTab}</h1>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchData(true)}
                className={`p-2 rounded-xl text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all ${refreshing ? 'animate-spin text-indigo-500' : ''}`}
                title="Refresh manually"
              >
                <RefreshCw size={18} />
              </button>
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200 cursor-default">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user?.storeName}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-none">{user?.email}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                  {user?.storeName?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'customers' && (
             <div className="animate-in fade-in duration-200">
               <CustomerDirectory customers={analytics?.customers || []} storeName={user?.storeName} />
             </div>
          )}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

const BroadcastPanel = ({ customers, storeName }) => {
  const [message, setMessage] = useState('');

  const handleBroadcast = () => {
    if (!message.trim() || customers.length === 0) return;
    const text = `📢 *Update from ${storeName}:*\n\n${message}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        placeholder={`e.g., "We have new arrivals this week! Visit our store to check them out."`}
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#25D366] focus:border-[#25D366] outline-none bg-gray-50 transition-all"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 hidden sm:block">Reach all {customers.length} customers instantly.</p>
        <button
          onClick={handleBroadcast}
          disabled={!message.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#1ebd5a] hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:hover:shadow-none transition-all active:scale-95"
        >
          <MessageSquare size={16} />
          Send Broadcast
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
