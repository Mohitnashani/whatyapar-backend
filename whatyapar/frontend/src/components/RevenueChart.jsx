import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BarChart2, TrendingUp, ShoppingBag } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const VIEWS = [
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'revenue', label: 'Revenue', icon: TrendingUp },
  { key: 'items', label: 'Item Qty', icon: BarChart2 },
];

const RevenueChart = ({ monthly }) => {
  const hasRevenue = monthly.some(m => m.revenue > 0);
  const hasOrders = monthly.some(m => m.orders > 0);
  const hasItems = monthly.some(m => m.itemQty > 0);

  // Default to orders if revenue is all zero (no prices set yet)
  const defaultView = hasRevenue ? 'revenue' : 'orders';
  const [view, setView] = useState(defaultView);

  const labels = monthly.map(m => m.label);
  const isEmpty = !hasOrders && !hasRevenue && !hasItems;

  // --- Dataset configs per view ---
  const configs = {
    orders: {
      datasets: [
        {
          label: 'Total Orders',
          data: monthly.map(m => m.orders),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Accepted',
          data: monthly.map(m => m.accepted || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Pending',
          data: monthly.map(m => m.pending || 0),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
      tooltipLabel: (ctx) => ` ${ctx.parsed.y} ${ctx.dataset.label.toLowerCase()}`,
      yLabel: (v) => `${v}`,
      title: 'Order Breakdown',
      sub: 'Total, accepted & pending per month',
    },
    revenue: {
      datasets: [
        {
          label: 'Revenue (₹)',
          data: monthly.map(m => m.revenue),
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 8,
          borderSkipped: false,
          fill: true,
        },
      ],
      tooltipLabel: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
      yLabel: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`,
      title: 'Revenue',
      sub: 'Total billed amount per month',
    },
    items: {
      datasets: [
        {
          label: 'Total Items Ordered',
          data: monthly.map(m => m.itemQty || 0),
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
      tooltipLabel: (ctx) => ` ${ctx.parsed.y} units`,
      yLabel: (v) => `${v}`,
      title: 'Item Quantities',
      sub: 'Total units ordered per month',
    },
  };

  const current = configs[view];

  const chartData = { labels, datasets: current.datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 11, family: 'Inter, sans-serif' },
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: current.tooltipLabel,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#9ca3af' },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: {
          callback: current.yLabel,
          font: { size: 11 },
          color: '#9ca3af',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">{current.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{current.sub}</p>
        </div>
        {/* View switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart or empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <BarChart2 className="text-gray-200 mb-3" size={40} />
          <p className="text-sm font-medium text-gray-400">No data yet</p>
          <p className="text-xs text-gray-300 mt-1">Start accepting orders to see your analytics</p>
        </div>
      ) : (
        <>
          {/* No revenue hint */}
          {view === 'revenue' && !hasRevenue && (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
              💡 Revenue will show here once you set a bill amount when accepting orders
            </div>
          )}
          <div style={{ height: 220 }}>
            <Bar data={chartData} options={options} />
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueChart;
