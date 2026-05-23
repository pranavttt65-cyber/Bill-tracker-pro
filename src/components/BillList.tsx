import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Trash2, Download } from 'lucide-react';
import { Bill, User } from '../types';
import { StorageService } from '../services/storage';
import { Invoice } from './Invoice';

interface BillListProps {
  user: User;
  onBack: () => void;
}

type ViewMode = 'list' | 'detail';

export const BillList: React.FC<BillListProps> = ({ user, onBack }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    const userBills = StorageService.getBills(user.id);
    setBills(userBills);
  }, [user.id]);

  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    return bill.status === filter;
  });

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewMode('detail');
  };

  const handleDeleteBill = (billId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      StorageService.deleteBill(billId);
      setBills(bills.filter(b => b.id !== billId));
    }
  };

  const handleDownloadPDF = (bill: Bill) => {
    // PDF download functionality would be implemented here
    alert('PDF download feature coming soon!');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.draft;
  };

  if (viewMode === 'detail' && selectedBill) {
    return (
      <Invoice
        bill={selectedBill}
        onBack={() => setViewMode('list')}
        user={user}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Invoice History</h2>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex space-x-2 overflow-x-auto">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({filteredBills.length})
          </button>
        ))}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill, index) => (
                  <tr key={bill.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">{bill.billNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{bill.customerName}</p>
                        <p className="text-sm text-gray-500">{bill.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {user.currency} {bill.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewBill(bill)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(bill)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
