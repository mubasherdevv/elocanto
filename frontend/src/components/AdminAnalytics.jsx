import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CurrencyDollarIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

const AdminAnalytics = () => {
  const [data, setData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    dailyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: analyticsData } = await api.get('/orders/analytics');
        setData(analyticsData);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center mb-8">
        Failed to load analytics: {error}
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-lg text-sm">
          <p className="font-bold text-dark mb-1">{label}</p>
          <p className="text-primary font-semibold">
            Revenue: ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-gray-medium text-xs mt-1">
            Orders: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-dark mb-4">Store Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
            <CurrencyDollarIcon className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-medium mb-1">Total Revenue</p>
            <h3 className="text-3xl font-extrabold text-dark tracking-tight">
              ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <PresentationChartLineIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-medium mb-1">Total Orders</p>
            <h3 className="text-3xl font-extrabold text-dark tracking-tight">
              {data.totalOrders.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* 7-Day Revenue Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-medium uppercase tracking-wider mb-6">7-Day Revenue Trend</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.dailyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#4f46e5" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
