import React from 'react';
import { ShoppingBag, TrendingUp } from 'lucide-react';

const TopItems = ({ items }) => {
  const max = items[0]?.totalQuantity || 1;

  const rankColor = (idx) => {
    if (idx === 0) return 'text-amber-500';
    if (idx === 1) return 'text-gray-400';
    if (idx === 2) return 'text-orange-400';
    return 'text-gray-300';
  };

  const formatQty = (qty, unit) => {
    if (!unit) return `${qty}×`;
    return `${qty} ${unit}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
          <TrendingUp size={16} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Most Ordered Items</h2>
          <p className="text-xs text-gray-500">By total quantity across all orders</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingBag className="mx-auto text-gray-200 mb-2" size={32} />
          <p className="text-sm text-gray-400">No orders yet to analyze</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-3">
              {/* Rank */}
              <span className={`text-xs font-bold w-5 text-center flex-shrink-0 ${rankColor(idx)}`}>
                #{idx + 1}
              </span>

              {/* Bar + Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-800 capitalize truncate">{item.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {/* Total quantity badge */}
                    <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                      {formatQty(item.totalQuantity, item.unit)}
                    </span>
                    {/* Order count */}
                    <span className="text-xs text-gray-400">
                      {item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${(item.totalQuantity / max) * 100}%` }}
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
