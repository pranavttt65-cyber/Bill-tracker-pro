import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Card, formatDate } from './UI';

interface DashboardProps {
  onCreateNewBill: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateNewBill }) => {
  const [stats, setStats] = useState(StorageService.getStats());
  const [currency, setCurrency] = useState('₹');

  useEffect(() => {
    setStats(StorageService.getStats());
    setCurrency(StorageService.getSettings().currency);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`${currency}${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Pending Amount" 
          value={`${currency}${stats.pendingAmount.toLocaleString()}`} 
          icon={AlertCircle} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Total Bills" 
          value={stats.totalBills.toString()} 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Avg. Bill Value" 
          value={`${currency}${(stats.totalRevenue / (stats.totalBills || 1)).toFixed(0)}`} 
          icon={TrendingUp} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Revenue Overview" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                  formatter={(value: number) => [`${currency}${value}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div>
          <Card title="Recent Transactions" className="h-[400px]">
            <div className="space-y-4">
              {stats.recentBills.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent transactions</p>
              ) : (
                stats.recentBills.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {bill.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{bill.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(bill.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{currency}{bill.totalAmount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bill.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        bill.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {bill.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Action Button for New Bill */}
      <button
        onClick={onCreateNewBill}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all z-40 flex items-center justify-center group"
        aria-label="Create New Bill"
        title="Create New Bill"
      >
        <Plus className="w-8 h-8" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium ml-0 group-hover:ml-2">
          New Bill
        </span>
      </button>
    </div>
  );
};