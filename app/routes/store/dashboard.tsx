import React, { useState, useEffect } from 'react'; // Added useState, useEffect for DashboardCard
import StoreDashboardCharts from '~/components/StoreDashboardCharts';
import { useVendorDashboard } from '../../hooks/useVendorDashboard'; // Import useVendorDashboard
import { Package, ShoppingCart, DollarSign, Percent } from 'lucide-react'; // Import icons

// Define DashboardCard component locally
interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-red-100', 'bg-purple-100'];

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value }) => {
  const [bgColor, setBgColor] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    setBgColor(colors[randomIndex]);
  }, []);

  return (
    <div className={`p-4 rounded flex flex-col justify-between ${bgColor} min-h-24`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-gray-600 text-xl">{icon}</div>
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-gray-900 text-right">{value}</p>
    </div>
  );
};

export default function StoreDashboardPage() {
  const { dashboardData, loading, error } = useVendorDashboard(); // Use the hook here

  if (loading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-6">Error loading dashboard data: {error.message}</div>;
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600 mb-6">
        Welcome to your store dashboard. Analytics and other information will be displayed here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
        <DashboardCard
          icon={<Package />}
          title="Total Products"
          value={dashboardData?.totalProducts ?? 0}
        />
        <DashboardCard
          icon={<ShoppingCart />}
          title="Pending Orders"
          value={dashboardData?.pendingOrders ?? 0}
        />
        <DashboardCard
          icon={<DollarSign />}
          title="Total Revenue"
          value={`$${dashboardData?.totalRevenue ?? '0.00'}`}
        />
        <DashboardCard
          icon={<Package />}
          title="Total Products Sold"
          value={dashboardData?.totalProducts ?? 0}
        />
      </div>

      <StoreDashboardCharts />
    </div>
  );
}
