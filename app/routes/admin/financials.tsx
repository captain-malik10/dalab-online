import React from 'react';
import { useAdminFinancials, type Financials } from 'app/hooks/useAdminFinancials';
import Table from 'app/components/Table';
import Badge from 'app/components/Badge';

const FinancialsPage: React.FC = () => {
  const { financials, loading } = useAdminFinancials();

  const columns = [
    { header: 'Store Name', accessor: 'store_name' },
    {
      header: 'Total Revenue',
      accessor: 'total_revenue',
      render: (item: Financials) => `$${item.total_revenue.toFixed(2)}`,
    },
    {
      header: "This Month's Revenue",
      accessor: 'monthly_revenue',
      render: (item: Financials) => `$${item.monthly_revenue.toFixed(2)}`,
    },
    { header: 'Total Orders', accessor: 'total_orders' },
    {
      header: 'Verified',
      accessor: 'isVerified',
      render: (item: Financials) => (
        <Badge
          state={item.isVerified ? 'success' : 'danger'}
          text={item.isVerified ? 'Yes' : 'No'}
        />
      ),
    },
  ];

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Financials</h1>
      <p className="mb-6 text-gray-600">
        An overview of the financial performance of stores on the platform.
      </p>
      {loading ? (
        <div className="flex items-center justify-center py-8">Loading...</div>
      ) : (
        <Table columns={columns} data={financials} />
      )}
    </div>
  );
};

export default FinancialsPage;
