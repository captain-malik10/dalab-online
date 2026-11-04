import useVendorApi from './useVendorApi';

interface DashboardData {
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: string; // Changed to string based on user's example data
  commission: number;
  revenueByDay: { date: string; revenue: string }[]; // Changed to string based on user's example data
}

export const useVendorDashboard = () => {
  const {
    data: dashboardData,
    loading,
    error,
    refetch,
  } = useVendorApi<DashboardData>('/vendors/dashboard');
  return { dashboardData, loading, error, refetch };
};
