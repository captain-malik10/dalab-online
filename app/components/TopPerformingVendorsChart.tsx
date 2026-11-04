import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export default function TopPerformingVendorsChart() {
  const { dashboardData, loading, error } = useAdminDashboard();

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart data.</div>;

  const vendorsData = dashboardData?.charts.topPerformingVendors || [];

  const chartData = vendorsData.map((vendor, index) => ({
    id: index,
    value: Number(vendor.total_payout),
    label: vendor.store_name,
  }));

  return (
    <div className="p-4 rounded border-l-4 bg-green-100 border-green-500">
      <h3 className="text-lg font-semibold mb-4">Top Performing Vendors</h3>
      <PieChart
        colors={['#4189DD', '#FFB020', '#16A34A', '#0B1F3A', '#64A0E3', '#DC2626']}
        series={[
          {
            data: chartData,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            valueFormatter: (item) => `$${item.value.toFixed(2)}`,
          },
        ]}
        height={300}
      />
    </div>
  );
}
