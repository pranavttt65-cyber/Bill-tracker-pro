import React, { useState, useEffect } from 'react';
import { Bill, PaymentMethod, AppSettings } from '../types';
import { X, Printer, ArrowLeft, Edit2, Save, RotateCcw } from 'lucide-react';
import { Button, formatDate } from './UI';
import { StorageService } from '../services/storage';

interface InvoiceProps {
  bill: Bill;
  onClose: () => void;
  onUpdate?: () => void;
}

export const Invoice: React.FC<InvoiceProps> = ({ bill, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Allow empty string for better UX when clearing input. Convert 0 to '' for initial state.
  const [editPaidAmount, setEditPaidAmount] = useState<number | string>(bill.paidAmount === 0 ? '' : bill.paidAmount);
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>(bill.paymentMethod);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  // Reset state when bill changes
  useEffect(() => {
    setEditPaidAmount(bill.paidAmount === 0 ? '' : bill.paidAmount);
    setEditPaymentMethod(bill.paymentMethod);
    setIsEditing(false);
    setSettings(StorageService.getSettings());
  }, [bill]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const paidAmountNum = Number(editPaidAmount) || 0;
    const newBalance = Math.max(0, bill.totalAmount - paidAmountNum);
    const newStatus = newBalance <= 0 ? 'PAID' : paidAmountNum === 0 ? 'PENDING' : 'PARTIAL';

    const updatedBill: Bill = {
      ...bill,
      paidAmount: paidAmountNum,
      balance: newBalance,
      paymentMethod: editPaymentMethod,
      status: newStatus
    };

    StorageService.saveBill(updatedBill);
    if (onUpdate) onUpdate();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditPaidAmount(bill.paidAmount === 0 ? '' : bill.paidAmount);
    setEditPaymentMethod(bill.paymentMethod);
    setIsEditing(false);
  };

  // Calculate dynamic balance for display during edit
  const currentPaid = isEditing ? (Number(editPaidAmount) || 0) : bill.paidAmount;
  const currentBalance = Math.max(0, bill.totalAmount - currentPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Modal Header - Hidden in Print */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 no-print">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onClose} icon={ArrowLeft} className="mr-4 text-gray-600 hover:text-gray-900">
              Back
            </Button>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Payment Details' : 'Invoice Preview'}
            </h2>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print:p-8" id="invoice-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">{settings.companyName}</h1>
              <p className="text-gray-500 mt-1 whitespace-pre-line">{settings.companyAddress}</p>
              <div className="mt-4 text-sm text-gray-600">
                {settings.companyPhone && <p>Phone: {settings.companyPhone}</p>}
                {settings.companyEmail && <p>Email: {settings.companyEmail}</p>}
                {settings.companyWebsite && <p>Web: {settings.companyWebsite}</p>}
                {settings.taxId && <p className="font-medium mt-1">Tax ID: {settings.taxId}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-gray-500 mt-1">#{bill.billNumber}</p>
              <div className="mt-4 text-sm text-gray-600">
                <p>Date: <span className="font-medium text-gray-900">{formatDate(bill.date)}</span></p>
                <p className="mt-1">Status: 
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    (isEditing ? (currentBalance <= 0 ? 'PAID' : currentPaid === 0 ? 'PENDING' : 'PARTIAL') : bill.status) === 'PAID' ? 'bg-green-100 text-green-700' : 
                    (isEditing ? (currentBalance <= 0 ? 'PAID' : currentPaid === 0 ? 'PENDING' : 'PARTIAL') : bill.status) === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isEditing ? (currentBalance <= 0 ? 'PAID' : currentPaid === 0 ? 'PENDING' : 'PARTIAL') : bill.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-bold text-gray-900">{bill.customerName}</p>
                {bill.customerEmail && <p className="text-gray-600">{bill.customerEmail}</p>}
                <p className="text-gray-600">{bill.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase">Item Description</th>
                <th className="text-center py-3 text-sm font-bold text-gray-600 uppercase">Qty</th>
                <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Rate</th>
                <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bill.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 text-gray-800 font-medium">{item.name}</td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">{settings.currency}{item.rate.toFixed(2)}</td>
                  <td className="py-4 text-right text-gray-800 font-semibold">{settings.currency}{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{settings.currency}{bill.subtotal.toFixed(2)}</span>
              </div>
              
              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {bill.discountType === 'PERCENTAGE' ? `(${bill.discountValue}%)` : '(Fixed)'}</span>
                  <span>- {settings.currency}{bill.discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              {bill.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({bill.taxRate}%)</span>
                  <span>+ {settings.currency}{bill.taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t-2 border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">{settings.currency}{bill.totalAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm">
                <span className="text-gray-600">Amount Paid</span>
                {isEditing ? (
                   <div className="flex items-center justify-end">
                     <span className="mr-1 text-gray-500">{settings.currency}</span>
                     <input 
                       type="number"
                       min="0"
                       max={bill.totalAmount}
                       step="0.01"
                       value={editPaidAmount}
                       onChange={(e) => setEditPaidAmount(e.target.value)}
                       className="w-32 text-right rounded border border-blue-300 px-2 py-1 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                   </div>
                ) : (
                   <span className="font-medium">{settings.currency}{bill.paidAmount.toFixed(2)}</span>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <select 
                     value={editPaymentMethod}
                     onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                     className="w-32 text-right rounded border border-blue-300 px-2 py-1 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  >
                     <option value="CASH">Cash</option>
                     <option value="UPI">UPI</option>
                     <option value="CARD">Card</option>
                     <option value="BANK_TRANSFER">Bank Transfer</option>
                     <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Balance Due</span>
                <span className={`font-medium ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {settings.currency}{currentBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
            <p className="mt-1">For questions concerning this invoice, please contact us.</p>
          </div>

          {/* New Action Buttons Section - Hidden in Print */}
          <div className="mt-8 flex justify-end space-x-3 no-print border-t border-gray-100 pt-6">
            {!isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(true)} icon={Edit2}>
                  Edit Payment
                </Button>
                <Button onClick={handlePrint} icon={Printer}>Print Invoice</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={handleCancel} icon={RotateCcw}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} icon={Save} className="bg-green-600 hover:bg-green-700 shadow-green-500/30">
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};