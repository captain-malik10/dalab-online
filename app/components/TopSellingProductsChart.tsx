import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export default function TopSellingProductsChart() {
  const { dashboardData, loading, error } = useAdminDashboard();

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart data.</div>;

  const productsData = dashboardData?.charts.topSellingProducts || [];

  const chartData = productsData.map((product, index) => ({
    id: index,
    value: Number(product.total_sold),
    label: product.name,
  }));

  return (
    <div className="p-4 rounded border-l-4 bg-blue-100 border-blue-500">
      <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
      <PieChart
        series={[
          {
            data: chartData,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            valueFormatter: (item) => `${item.value} sold`,
          },
        ]}
        height={300}
      />
    </div>
  );
}
