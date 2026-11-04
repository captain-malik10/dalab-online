import React, { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useVendorDashboard } from '../hooks/useVendorDashboard';
import DashboardCard from './DashboardCard';
import { Package, ShoppingCart, DollarSign, Percent } from 'lucide-react';

function StoreDashboardCharts() {
  const { dashboardData, loading, error } = useVendorDashboard();
  const [duration, setDuration] = useState<'weekly' | 'monthly'>('weekly'); // New state for duration

  if (loading) {
    return <div className="p-6">Loading chart data...</div>;
  }

  if (error) {
    return <div className="p-6">Error loading chart data: {error.message}</div>;
  }

  const rawChartData = dashboardData?.revenueByDay || [];
  let dates: (string | number)[] = [];
  let revenues: number[] = [];

  if (duration === 'weekly') {
    const today = new Date();
    const last7Days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7Days.push(d);
    }

    dates = last7Days.map((d) => d.getDate().toString()); // Day of month, converted to string
    revenues = last7Days.map((d) => {
      const matchingDay = rawChartData.find(
        (item) => new Date(item.date).toDateString() === d.toDateString(),
      );
      return matchingDay ? parseFloat(matchingDay.revenue) : 0;
    });
  } else {
    // monthly
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const allDaysInMonth: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      allDaysInMonth.push(new Date(year, month, i));
    }

    dates = allDaysInMonth.map((d) => d.getDate().toString());
    revenues = allDaysInMonth.map((d) => {
      const matchingDay = rawChartData.find(
        (item) => new Date(item.date).toDateString() === d.toDateString(),
      );
      return matchingDay ? parseFloat(matchingDay.revenue) : 0;
    });
  }

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center">
        {' '}
        <h2 className="text-xl font-semibold">Daily Revenue</h2>
        <div>
          <button
            className={`px-4 py-1 rounded-l ${duration === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setDuration('weekly')}
          >
            Weekly
          </button>
          <button
            className={`px-4 py-1 rounded-r ${duration === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setDuration('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      {revenues.length > 0 ? (
        <BarChart
          xAxis={[{ scaleType: 'band', data: dates, label: 'Day' }]}
          series={[{ data: revenues, label: 'Revenue' }]}
          height={380}
        />
      ) : (
        <div className="h-[380px] justify-center items-center">
          No revenue data to display for the selected duration.
        </div>
      )}
    </div>
  );
}

export default StoreDashboardCharts;
