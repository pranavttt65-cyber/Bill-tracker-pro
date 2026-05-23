import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { BillItem, Bill, User } from '../types';
import { StorageService } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface BillFormProps {
  onSuccess: () => void;
  onBack: () => void;
  user: User;
}

export const BillForm: React.FC<BillFormProps> = ({ onSuccess, onBack, user }) => {
  const [bill, setBill] = useState<Partial<Bill>>({
    billNumber: `INV-${Date.now()}`,
    items: [{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, tax: 0, total: 0 }],
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    status: 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBill(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof BillItem,
    value: string | number
  ) => {
    const newItems = [...(bill.items || [])];
    const item = newItems[index];
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
      const numValue = parseFloat(value as string) || 0;
      item[field] = numValue;
    } else {
      item[field as string] = value;
    }

    // Calculate total
    const subtotal = item.quantity * item.unitPrice;
    item.total = subtotal + item.tax;

    newItems[index] = item;
    setBill(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const newItems = [
      ...(bill.items || []),
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        total: 0,
      },
    ];
    setBill(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    const newItems = bill.items?.filter((_, i) => i !== index) || [];
    setBill(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotals = () => {
    const items = bill.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!bill.customerName) newErrors.customerName = 'Customer name is required';
    if (!bill.customerEmail) newErrors.customerEmail = 'Customer email is required';
    if (!bill.items || bill.items.length === 0) newErrors.items = 'At least one item is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();

    const newBill: Bill = {
      id: uuidv4(),
      billNumber: bill.billNumber || `INV-${Date.now()}`,
      customerId: uuidv4(),
      customerName: bill.customerName || '',
      customerEmail: bill.customerEmail || '',
      items: bill.items || [],
      subtotal,
      taxAmount,
      total,
      dueDate: bill.dueDate || '',
      issueDate: bill.issueDate || '',
      status: 'draft',
      notes: bill.notes,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveBill(newBill);
    onSuccess();
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Create New Invoice</h2>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Bill Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              name="billNumber"
              value={bill.billNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              name="issueDate"
              value={bill.issueDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={bill.dueDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={bill.customerName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={bill.customerEmail || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-700">Description</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700 w-20">Qty</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700 w-24">Unit Price</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700 w-20">Tax</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700 w-24">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {bill.items?.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900">
                      {user.currency} {item.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}
        </div>

        {/* Totals */}
        <div className="flex justify-end space-y-2">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span>Subtotal:</span>
              <span className="font-medium">{user.currency} {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span>Tax:</span>
              <span className="font-medium">{user.currency} {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-base font-bold text-blue-600 bg-blue-50 p-2 rounded">
              <span>Total:</span>
              <span>{user.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={bill.notes || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes for the customer..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Invoice</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
