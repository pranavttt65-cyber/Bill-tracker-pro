import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Calculator, ArrowLeft, Search, User as UserIcon } from 'lucide-react';
import { Bill, BillItem, DiscountType, PaymentMethod, BillStatus, Customer } from '../types';
import { Card, Input, Button } from './UI';
import { StorageService } from '../services/storage';

interface BillFormProps {
  onSuccess: () => void;
  onBack: () => void;
  user: any;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateBillNumber = () => `INV-${Date.now().toString().substr(-6)}`;

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const BillForm: React.FC<BillFormProps> = ({ onSuccess, onBack, user }) => {
  // Customer State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [billDate, setBillDate] = useState(getTodayString());
  
  // Autocomplete State
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currency, setCurrency] = useState('₹');

  // Items State
  const [items, setItems] = useState<any[]>([
    { id: generateId(), name: '', quantity: 1, rate: '', total: 0 }
  ]);

  // Calculations State
  const [discountType, setDiscountType] = useState<DiscountType>('NONE');
  const [discountValue, setDiscountValue] = useState<number | string>('');
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  useEffect(() => {
    const loadedCustomers = StorageService.getCustomers();
    setAllCustomers(loadedCustomers);
    setCurrency(StorageService.getSettings().currency);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);
    
    if (val.trim()) {
      const filtered = allCustomers.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase()) || 
        c.phone.includes(val)
      );
      setFilteredCustomers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    if (customer.email) setCustomerEmail(customer.email);
    setShowSuggestions(false);
  };

  // Derived Values
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  
  const discountValNum = Number(discountValue) || 0;
  const discountAmount = discountType === 'NONE' ? 0 : 
    discountType === 'PERCENTAGE' ? (subtotal * discountValNum / 100) : discountValNum;
    
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = 0;
  const taxAmount = 0;
  const totalAmount = taxableAmount + taxAmount;
  
  const paidAmountNum = Number(paidAmount) || 0;
  const balance = Math.max(0, totalAmount - paidAmountNum);

  // Handlers
  const handleItemChange = (id: string, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updates: any = { [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const qty = field === 'quantity' ? Number(value) : Number(item.quantity);
          const rate = field === 'rate' ? Number(value) : Number(item.rate);
          updates.total = (qty || 0) * (rate || 0);
        }
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: generateId(), name: '', quantity: 1, rate: '', total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.some(i => !i.name)) {
      alert("Please fill all required fields");
      return;
    }

    const cleanItems: BillItem[] = items.map(i => ({
      id: i.id,
      name: i.name,
      quantity: Number(i.quantity) || 0,
      rate: Number(i.rate) || 0,
      total: Number(i.total) || 0
    }));

    const status: BillStatus = balance <= 0 ? 'PAID' : paidAmountNum === 0 ? 'PENDING' : 'PARTIAL';

    const newBill: Bill = {
      id: generateId(),
      billNumber: generateBillNumber(),
      customerName,
      customerPhone,
      customerEmail,
      date: billDate,
      items: cleanItems,
      subtotal,
      discountType,
      discountValue: discountValNum,
      discountAmount,
      taxRate,
      taxAmount,
      totalAmount,
      paidAmount: paidAmountNum,
      balance,
      paymentMethod,
      status,
      createdBy: user.id,
      createdAt: Date.now()
    };

    StorageService.saveBill(newBill);
    onSuccess();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Button variant="ghost" onClick={onBack} icon={ArrowLeft} className="text-gray-600 hover:bg-gray-100">
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Bill</h2>
          <p className="text-gray-500">Add items and generate invoice for your customer.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Customer & Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Customer Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative mb-4" ref={wrapperRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      value={customerName}
                      onChange={handleCustomerNameChange}
                      onFocus={() => customerName && setShowSuggestions(true)}
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  {showSuggestions && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.map(c => (
                        <div 
                          key={c.id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => selectCustomer(c)}
                        >
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Input label="Phone Number *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
                <Input label="Email Address" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                <Input label="Bill Date" type="date" value={billDate} onChange={e => setBillDate(e.target.value)} required />
              </div>
            </Card>

            <Card title="Items Cart">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-full md:w-5/12">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Item Name</label>
                      <input 
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Item name"
                        value={item.name}
                        onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-1/3 md:w-2/12">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Qty</label>
                      <input 
                        type="number" min="1"
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={item.quantity}
                        onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="w-1/3 md:w-2/12">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Rate</label>
                      <input 
                        type="number" min="0" step="0.01"
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={item.rate}
                        onChange={e => handleItemChange(item.id, 'rate', e.target.value)}
                      />
                    </div>
                    <div className="w-1/3 md:w-2/12">
                       <label className="text-xs font-medium text-gray-500 mb-1 block">Total</label>
                       <div className="px-3 py-2 bg-gray-700 border border-gray-300 rounded text-sm font-semibold text-white">
                         {Number(item.total).toFixed(2)}
                       </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <Button type="button" onClick={addItem} variant="secondary" icon={Plus} className="w-full">
                  Add Item
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Calculations */}
          <div className="space-y-6">
            <Card title="Billing Summary" className="sticky top-6">
              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{currency}{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount Section */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">Discount</label>
                  <div className="flex gap-2">
                    <select 
                      className="rounded border-gray-300 text-sm p-2 bg-white text-gray-900 flex-1"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    >
                      <option value="NONE">None</option>
                      <option value="PERCENTAGE">% Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                    {discountType !== 'NONE' && (
                      <input 
                        type="number" 
                        min="0"
                        className="w-20 rounded border-gray-300 text-sm p-2 bg-white text-gray-900"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                      />
                    )}
                  </div>
                  {discountType !== 'NONE' && (
                    <div className="text-right text-sm text-green-600 font-medium">
                      - {currency}{discountAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                <hr className="border-dashed border-gray-300" />

                {/* Total */}
                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-blue-600">{currency}{totalAmount.toFixed(2)}</span>
                </div>

                {/* Payment */}
                <div className="pt-4 space-y-3">
                   <Input 
                     label="Amount Paid"
                     type="number" 
                     min="0" 
                     step="0.01"
                     value={paidAmount}
                     onChange={e => setPaidAmount(e.target.value)}
                     icon={Calculator}
                   />
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                     <select 
                       className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-900"
                       value={paymentMethod}
                       onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                     >
                       <option value="CASH">Cash</option>
                       <option value="UPI">UPI</option>
                       <option value="CARD">Card</option>
                       <option value="BANK_TRANSFER">Bank Transfer</option>
                       <option value="CHEQUE">Cheque</option>
                     </select>
                   </div>

                   <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                     <span className="text-blue-800 font-medium">Balance Due</span>
                     <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                       {currency}{balance.toFixed(2)}
                     </span>
                   </div>
                </div>

                <Button type="submit" className="w-full py-3 text-lg shadow-xl" icon={Save}>
                  Save Bill
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};