import React from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Bill, User } from '../types';
import { format } from 'date-fns';

interface InvoiceProps {
  bill: Bill;
  onBack: () => void;
  user: User;
}

export const Invoice: React.FC<InvoiceProps> = ({ bill, onBack, user }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('PDF download feature coming soon!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all no-print"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all no-print"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all no-print"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white rounded-xl shadow-sm p-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-gray-200">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              INVOICE
            </h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{bill.billNumber}</p>
            <p className="text-sm text-gray-600">
              Issued: {format(new Date(bill.issueDate), 'MMM dd, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">From</h3>
            <p className="text-lg font-semibold text-gray-900">{user.businessName || user.name}</p>
            {user.address && <p className="text-sm text-gray-600">{user.address}</p>}
            {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Bill To</h3>
            <p className="text-lg font-semibold text-gray-900">{bill.customerName}</p>
            <p className="text-sm text-gray-600">{bill.customerEmail}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 w-20">Qty</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 w-24">Unit Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 w-20">Tax</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-700">{item.description}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{item.quantity}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{user.currency} {item.unitPrice.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{user.currency} {item.tax.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">{user.currency} {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-72">
            <div className="flex justify-between py-2 border-b border-gray-300 mb-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold text-gray-900">{user.currency} {bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300 mb-3">
              <span className="text-gray-700">Tax:</span>
              <span className="font-semibold text-gray-900">{user.currency} {bill.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg">{user.currency} {bill.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {bill.notes && (
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Notes</h3>
            <p className="text-gray-700">{bill.notes}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center print-only">
          <div className="text-sm text-gray-600">
            Status: <span className="font-semibold text-gray-900">{bill.status.toUpperCase()}</span>
          </div>
          <div className="text-xs text-gray-500">
            Generated on {format(new Date(bill.createdAt), 'MMM dd, yyyy HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
};
