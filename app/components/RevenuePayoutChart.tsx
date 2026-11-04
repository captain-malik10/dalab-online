import React, { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import RevenuePayoutChartSkeleton from './RevenuePayoutChartSkeleton';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export default function RevenuePayoutChart() {
  const [duration, setDuration] = useState('monthly');
  const { dashboardData, loading, error } = useAdminDashboard(duration);

  if (error) return <div>Error loading chart data.</div>;

  const salesData = dashboardData?.charts.salesOverTime || [];
  const payoutData = dashboardData?.charts.payoutsOverTime || [];

  const generateDateRange = (duration: string) => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    if (duration === 'weekly') startDate.setDate(now.getDate() - 6);
    else if (duration === 'monthly') startDate.setMonth(now.getMonth() - 1);
    else if (duration === '6months') startDate.setMonth(now.getMonth() - 6);

    const dates = [];
    for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      dates.push(new Date(dt));
    }
    return dates;
  };

  const mergeDataWithDateRange = (
    data: any[],
    dateRange: Date[],
    key: string,
    duration: string,
  ) => {
    if (duration === '6months') {
      const monthMap = new Map<string, number>();
      data.forEach((item) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + parseFloat(item[key]));
      });

      const result: { x: Date; y: number }[] = [];
      dateRange.forEach((date) => {
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (
          !result.some(
            (r) => r.x.getMonth() === date.getMonth() && r.x.getFullYear() === date.getFullYear(),
          )
        ) {
          result.push({
            x: new Date(date.getFullYear(), date.getMonth(), 1),
            y: monthMap.get(monthKey) || 0,
          });
        }
      });
      return result;
    } else {
      const dataMap = new Map(
        data.map((item) => [new Date(item.date).toDateString(), parseFloat(item[key])]),
      );
      return dateRange.map((date) => ({
        x: date,
        y: dataMap.get(date.toDateString()) || 0,
      }));
    }
  };

  const formatXAxisLabel = (date: Date, duration: string) => {
    if (duration === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    } else if (duration === 'monthly') {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return `${date.getDate()} - ${monthNames[date.getMonth()]}`;
    } else if (duration === '6months') {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return monthNames[date.getMonth()];
    }
    return date.toLocaleDateString();
  };

  const dateRange = generateDateRange(duration);

  const chartData = {
    revenue: mergeDataWithDateRange(salesData, dateRange, 'revenue', duration),
    payout: mergeDataWithDateRange(payoutData, dateRange, 'payout', duration),
  };

  const series = [
    {
      data: chartData.revenue.map((d) => d.y),
      label: 'Revenue',
      color: '#2e7d32', // Green
    },
    {
      data: chartData.payout.map((d) => d.y),
      label: 'Payout',
      color: '#d32f2f', // Red
    },
  ];

  return (
    <div className="p-4 rounded border-l-4 bg-blue-100 border-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Revenue vs Payouts</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setDuration('weekly')}
            className={`px-3 py-1 rounded ${duration === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setDuration('monthly')}
            className={`px-3 py-1 rounded ${duration === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setDuration('6months')}
            className={`px-3 py-1 rounded ${duration === '6months' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            6 Months
          </button>
        </div>
      </div>
      {loading ? (
        <RevenuePayoutChartSkeleton />
      ) : (
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: chartData.revenue.map((d) => formatXAxisLabel(d.x, duration)),
            },
          ]}
          series={series}
          height={400}
        />
      )}
    </div>
  );
}
