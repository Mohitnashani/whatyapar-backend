import React from 'react';
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
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const RevenueChart = ({ monthly }) => {
  const labels = monthly.map(m => m.label);

  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: monthly.map(m => m.revenue),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: monthly.map(m => m.orders),
        backgroundColor: 'rgba(167, 139, 250, 0.5)',
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 12, family: 'Inter, sans-serif' }, usePointStyle: true, pointStyle: 'circle' },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ctx.dataset.label === 'Revenue (₹)'
            ? ` ₹${ctx.parsed.y.toLocaleString()}`
            : ` ${ctx.parsed.y} orders`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { callback: (v) => `₹${v}`, font: { size: 11 } },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Revenue & Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">Last 6 months performance</p>
        </div>
      </div>
      <div style={{ height: 240 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueChart;
