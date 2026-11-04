import React from 'react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import TopSellingProductsChart from '../../components/TopSellingProductsChart';
import TopPerformingVendorsChart from '../../components/TopPerformingVendorsChart';
import RevenuePayoutChart from '../../components/RevenuePayoutChart';
import DashboardStatsSkeleton from '../../components/DashboardStatsSkeleton';
import RevenuePayoutChartSkeleton from '../../components/RevenuePayoutChartSkeleton';
import TopSellingProductsChartSkeleton from '../../components/TopSellingProductsChartSkeleton';
import TopPerformingVendorsChartSkeleton from '../../components/TopPerformingVendorsChartSkeleton';
import DashboardStats from '../../components/DashboardStats';

export default function AdminDashboardPage() {
  const { dashboardData, loading, error } = useAdminDashboard();

  if (error) {
    return <div className="p-6">Error loading dashboard data: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600 mb-6">
        Welcome to the admin dashboard. Here you can manage the entire platform.
      </p>

      {loading ? <DashboardStatsSkeleton /> : <DashboardStats dashboardData={dashboardData} />}

      <div className="mt-8">
        {loading ? <RevenuePayoutChartSkeleton /> : <RevenuePayoutChart />}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? <TopSellingProductsChartSkeleton /> : <TopSellingProductsChart />}
        {loading ? <TopPerformingVendorsChartSkeleton /> : <TopPerformingVendorsChart />}
      </div>
    </div>
  );
}
