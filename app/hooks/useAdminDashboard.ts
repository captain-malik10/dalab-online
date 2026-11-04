import useApi from './useApi';

interface AdminDashboardData {
  coreStats: {
    totalUsers: number;
    totalVendors: number;
    totalProducts: number;
    pendingOrders: number;
  };
  financials: {
    totalRevenue: number;
    platformCommission: number;
  };
  recentActivity: {
    newUserSignups: number;
    newVendorRegistrations: number;
    recentOrders: any[];
  };
  charts: {
    salesOverTime: any[];
    payoutsOverTime: any[];
    topSellingProducts: any[];
    topPerformingVendors: any[];
  };
}

export const useAdminDashboard = (duration: string = 'monthly') => {
  const {
    data: dashboardData,
    loading,
    error,
    refetch,
  } = useApi<AdminDashboardData>(`/admin/dashboard?duration=${duration}`);
  return { dashboardData, loading, error, refetch };
};
