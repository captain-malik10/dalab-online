import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, Percent } from 'lucide-react'; // Example icons

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

export default DashboardCard;
