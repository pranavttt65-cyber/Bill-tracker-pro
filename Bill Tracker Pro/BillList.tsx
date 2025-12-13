import React, { useState, useEffect } from 'react';
import { Bill, User } from '../types';
import { StorageService } from '../services/storage';
import { Eye, Search, Trash2, ArrowLeft } from 'lucide-react';
import { Card, Button, formatDate } from './UI';
import { Invoice } from './Invoice';

interface BillListProps {
  user: User;
  onBack: () => void;
}

export const BillList: React.FC<BillListProps> = ({ user, onBack }) => {
  const [bills, setBills] = useState<Bill[]>(StorageService.getBills().sort((a, b) => b.createdAt - a.createdAt));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [currency, setCurrency] = useState('₹');

  useEffect(() => {
    setCurrency(StorageService.getSettings().currency);
  }, []);

  const filteredBills = bills.filter(bill => 
    bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerPhone.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      StorageService.deleteBill(id);
      setBills(bills.filter(b => b.id !== id));
    }
  };

  const handleBillUpdate = () => {
    const updatedBills = StorageService.getBills().sort((a, b) => b.createdAt - a.createdAt);
    setBills(updatedBills);
    if (selectedBill) {
      const updatedSelected = updatedBills.find(b => b.id === selectedBill.id);
      if (updatedSelected) {
        setSelectedBill(updatedSelected);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Button variant="ghost" onClick={onBack} icon={ArrowLeft} className="text-gray-600 hover:bg-gray-100">
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-gray-500">View and manage all your past invoices.</p>
        </div>
      </div>

      <Card title="History" className="min-h-[500px]">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by customer, phone, or bill number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 rounded-tl-lg">Bill No</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 rounded-tr-lg text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">No bills found.</td>
                </tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 font-medium text-gray-900">{bill.billNumber}</td>
                    <td className="p-4 text-gray-500">{formatDate(bill.date)}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{bill.customerName}</div>
                      <div className="text-xs text-gray-500">{bill.customerPhone}</div>
                    </td>
                    <td className="p-4 text-right font-semibold text-gray-900">{currency}{bill.totalAmount.toFixed(2)}</td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bill.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        bill.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <Button variant="secondary" onClick={() => setSelectedBill(bill)} className="p-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* Authorization: Only ADMIN can delete bills */}
                      {user.role === 'ADMIN' && (
                        <Button 
                          variant="danger" 
                          onClick={() => handleDelete(bill.id)} 
                          className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {selectedBill && (
        <Invoice 
          bill={selectedBill} 
          onClose={() => setSelectedBill(null)} 
          onUpdate={handleBillUpdate}
        />
      )}
    </div>
  );
};