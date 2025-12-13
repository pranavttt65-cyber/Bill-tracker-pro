import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { StorageService } from '../services/storage';
import { Search, Trash2, ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import { Card, Button, formatDate } from './UI';

interface CustomerListProps {
  onBack: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onBack }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCustomers(StorageService.getCustomers().sort((a, b) => (b.lastBilled || 0) - (a.lastBilled || 0)));
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer? This will not delete their existing bills.')) {
      StorageService.deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Button variant="ghost" onClick={onBack} icon={ArrowLeft} className="text-gray-600 hover:bg-gray-100">
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Directory</h2>
          <p className="text-gray-500">Manage your saved customer contacts.</p>
        </div>
      </div>

      <Card title="Saved Customers">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search customers by name, phone or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No customers found. Customers are automatically added when you create bills.
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow relative group">
                 <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase text-lg">
                          {customer.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-900">{customer.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                             <Calendar className="w-3 h-3 mr-1" />
                             <span>Added: {new Date(customer.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <button 
                       onClick={() => handleDelete(customer.id)}
                       className="text-gray-400 hover:text-red-500 transition-colors"
                       title="Delete Customer"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
                 
                 <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                       <Phone className="w-4 h-4 mr-2 text-gray-400" />
                       {customer.phone}
                    </div>
                    {customer.email && (
                       <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.email}
                       </div>
                    )}
                 </div>

                 {customer.lastBilled && (
                    <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                       Last Billed: {new Date(customer.lastBilled).toLocaleDateString()}
                    </div>
                 )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};