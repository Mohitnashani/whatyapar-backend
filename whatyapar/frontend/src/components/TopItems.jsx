import React from 'react';
import { ShoppingBag, TrendingUp } from 'lucide-react';

const TopItems = ({ items }) => {
  const max = items[0]?.count || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
          <TrendingUp size={16} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Most Ordered Items</h2>
          <p className="text-xs text-gray-500">Parsed from customer requests</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingBag className="mx-auto text-gray-200 mb-2" size={32} />
          <p className="text-sm text-gray-400">No orders yet to analyze</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className={`text-xs font-bold w-5 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                #{idx + 1}
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{item.name}</span>
                  <span className="text-xs font-bold text-gray-500">{item.count}x</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopItems;
