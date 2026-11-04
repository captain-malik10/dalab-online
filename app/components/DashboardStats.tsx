import React from 'react';
import { Users, Store, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  colorIndex: number;
}

const colors = [
  'bg-blue-100 border-blue-500',
  'bg-green-100 border-green-500',
  'bg-yellow-100 border-yellow-500',
  'bg-red-100 border-red-500',
  'bg-purple-100 border-purple-500',
  'bg-pink-100 border-pink-500',
];

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, colorIndex }) => {
  const color = colors[colorIndex % colors.length];

  return (
    <div className={`p-4 flex flex-col justify-between min-h-24 rounded border-l-4 ${color}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-gray-600 text-xl">{icon}</div>
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-gray-900 text-right">{value}</p>
    </div>
  );
};

interface DashboardStatsProps {
  dashboardData: any;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ dashboardData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-4">
      <DashboardCard
        icon={<Users />}
        title="Total Users"
        value={dashboardData?.coreStats?.totalUsers ?? 0}
        colorIndex={0}
      />
      <DashboardCard
        icon={<Store />}
        title="Total Vendors"
        value={dashboardData?.coreStats?.totalVendors ?? 0}
        colorIndex={1}
      />
      <DashboardCard
        icon={<Package />}
        title="Total Products"
        value={dashboardData?.coreStats?.totalProducts ?? 0}
        colorIndex={2}
      />
      <DashboardCard
        icon={<ShoppingCart />}
        title="Pending Orders"
        value={dashboardData?.coreStats?.pendingOrders ?? 0}
        colorIndex={3}
      />
      <DashboardCard
        icon={<DollarSign />}
        title="Total Revenue"
        value={`$${dashboardData?.financials?.totalRevenue?.toFixed(2) ?? '0.00'}`}
        colorIndex={4}
      />
      <DashboardCard
        icon={<TrendingUp />}
        title="Platform Commission"
        value={`$${dashboardData?.financials?.platformCommission?.toFixed(2) ?? '0.00'}`}
        colorIndex={5}
      />
    </div>
  );
};

export default DashboardStats;
