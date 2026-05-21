import React from 'react';

const StatsCard = ({ icon: Icon, label, value, sub, color }) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-100',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-100',
    amber: 'from-amber-400 to-amber-500 shadow-amber-100',
    violet: 'from-violet-500 to-violet-600 shadow-violet-100',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.indigo} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
