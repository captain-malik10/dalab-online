import React from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { LayoutDashboard, ShoppingCart, Package, Truck, Store, Settings, DollarSign } from 'lucide-react';
import Logo from './Logo';

interface Tab {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface SidebarProps {
  type: 'admin' | 'store';
}

const adminTabs: Tab[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Financials', path: '/admin/financials', icon: DollarSign },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Deliveries', path: '/admin/deliveries', icon: Truck },
  { name: 'Stores', path: '/admin/stores', icon: Store },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const params = useParams();

  const storeName = params.storeName;

  const storeTabs: Tab[] = storeName
    ? [
        {
          name: 'Dashboard',
          path: `/store/${storeName}/dashboard`,
          icon: LayoutDashboard,
        },
        {
          name: 'Orders',
          path: `/store/${storeName}/orders`,
          icon: ShoppingCart,
        },
        {
          name: 'Products',
          path: `/store/${storeName}/products`,
          icon: Package,
        },
        {
          name: 'Settings',
          path: `/store/${storeName}/settings`,
          icon: Settings,
        },
      ]
    : [];

  const tabs = type === 'admin' ? adminTabs : storeTabs;

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex-col h-screen hidden md:flex">
      <div className="border-b border-gray-200">
        <div className="px-4 py-5">
          <Logo to={type === 'admin' ? '/admin' : '/store'} />
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            {type === 'admin' ? 'Admin panel' : 'Seller center'}
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex items-center px-4 text-sm rounded py-3 transition-colors duration-200 ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className={isActive ? 'font-bold' : 'font-medium'}>{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
