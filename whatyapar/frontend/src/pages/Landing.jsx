import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight, Zap, MessageSquare, PieChart, ShieldCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .hero-bg { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
        .glass-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); }
      `}</style>
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 py-4 px-6 sm:px-10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Whatyapar</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
          <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
            Create Store
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="hero-bg text-white py-20 px-6 sm:px-10 text-center relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-3xl mx-auto relative z-10">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Turn WhatsApp messages into <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">organized orders.</span>
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
              Whatyapar uses AI to automatically parse unstructured WhatsApp orders from your customers into a beautiful management dashboard. Free for small businesses.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/register" className="px-8 py-4 bg-white text-indigo-600 text-base font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-2">
                Start for free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 sm:px-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run your store</h2>
            <p className="text-gray-500">Ditch the notebook. Manage your entire business from one screen.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap} color="text-amber-500" bg="bg-amber-50"
              title="AI Order Parsing" 
              desc="Customers just type what they want in any language. Our AI extracts items, quantities, and units automatically." 
            />
            <FeatureCard 
              icon={MessageSquare} color="text-green-500" bg="bg-green-50"
              title="WhatsApp Native" 
              desc="Generate instant payment links and automated WhatsApp replies with exactly one click." 
            />
            <FeatureCard 
              icon={PieChart} color="text-purple-500" bg="bg-purple-50"
              title="Smart Analytics" 
              desc="Track revenue, monitor most popular items, and see which customers spend the most over time." 
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Store size={20} className="text-indigo-600" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">Whatyapar</span>
        </div>
        <p className="text-sm text-gray-500">© 2026 Whatyapar. Designed for Indian SMBs.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, bg }) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${bg}`}>
      <Icon className={color} size={24} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default Landing;
