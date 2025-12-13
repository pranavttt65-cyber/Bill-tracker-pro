import React, { useState, useEffect } from 'react';
import { User, AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { Card, Input, Button } from './UI';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Save, 
  Building2, 
  Shield, 
  Globe, 
  Phone, 
  MapPin, 
  Download,
  CreditCard,
  Bell,
  Monitor,
  ArrowLeft
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BUSINESS' | 'PREFERENCES'>('PERSONAL');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Personal State
  const [personalForm, setPersonalForm] = useState({
    name: user.name,
    email: user.email,
    password: '',
    confirmPassword: ''
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState<AppSettings>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    taxId: '',
    currency: '',
    invoicePrefix: ''
  });

  useEffect(() => {
    setSettingsForm(StorageService.getSettings());
  }, []);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalForm({ ...personalForm, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettingsForm({ ...settingsForm, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (personalForm.password && personalForm.password !== personalForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    const updatedUser: User = {
      ...user,
      name: personalForm.name,
      email: personalForm.email,
      passwordHash: personalForm.password ? personalForm.password : user.passwordHash
    };

    StorageService.updateUser(updatedUser);
    onUpdate(updatedUser);
    setMessage({ type: 'success', text: 'Personal profile updated successfully' });
    setPersonalForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settingsForm);
    setMessage({ type: 'success', text: 'Organization settings saved successfully' });
  };

  const handleExportData = () => {
    const data = {
      bills: StorageService.getBills(),
      settings: StorageService.getSettings(),
      user: user,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billtracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage({ type: 'success', text: 'Data export started.' });
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium transition-colors ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" onClick={onBack} icon={ArrowLeft} className="text-gray-600 hover:bg-gray-100">
           Back to Dashboard
        </Button>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative flex items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 uppercase">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="ml-6 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <span className="flex items-center mr-4"><Shield className="w-4 h-4 mr-1 text-blue-500" /> {user.role}</span>
                <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {user.email}</span>
              </div>
            </div>
            <div className="ml-auto mb-2 hidden md:block">
              <Button variant="secondary" onClick={handleExportData} icon={Download}>
                Export Data
              </Button>
            </div>
          </div>

          <div className="flex border-b border-gray-200">
            <TabButton id="PERSONAL" label="Personal Info" icon={UserIcon} />
            <TabButton id="BUSINESS" label="Organization" icon={Building2} />
            <TabButton id="PREFERENCES" label="Preferences" icon={CreditCard} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'PERSONAL' && (
            <Card title="Personal Information">
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" name="name" value={personalForm.name} onChange={handlePersonalChange} icon={UserIcon} required />
                  <Input label="Email Address" name="email" type="email" value={personalForm.email} onChange={handlePersonalChange} icon={Mail} required />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider flex items-center">
                    <Lock className="w-4 h-4 mr-2" /> Security
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="New Password" name="password" type="password" placeholder="Leave blank to keep" value={personalForm.password} onChange={handlePersonalChange} icon={Lock} />
                    <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm new password" value={personalForm.confirmPassword} onChange={handlePersonalChange} icon={Lock} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" icon={Save}>Update Profile</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'BUSINESS' && (
            <Card title="Organization Details">
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 mb-4">
                  These details will appear on your generated invoices.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Company Name" name="companyName" value={settingsForm.companyName} onChange={handleSettingsChange} icon={Building2} required />
                  <Input label="Tax ID / GSTIN" name="taxId" value={settingsForm.taxId} onChange={handleSettingsChange} icon={Shield} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Support Email" name="companyEmail" type="email" value={settingsForm.companyEmail} onChange={handleSettingsChange} icon={Mail} />
                  <Input label="Support Phone" name="companyPhone" value={settingsForm.companyPhone} onChange={handleSettingsChange} icon={Phone} />
                </div>

                <Input label="Website" name="companyWebsite" value={settingsForm.companyWebsite} onChange={handleSettingsChange} icon={Globe} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea 
                      name="companyAddress"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      value={settingsForm.companyAddress}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" icon={Save}>Save Settings</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'PREFERENCES' && (
            <div className="space-y-6">
               <Card title="Application Settings">
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Default Currency Symbol" name="currency" value={settingsForm.currency} onChange={handleSettingsChange} placeholder="₹, $, €" />
                    <Input label="Invoice Prefix" name="invoicePrefix" value={settingsForm.invoicePrefix} onChange={handleSettingsChange} placeholder="INV-" />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" icon={Save}>Save Preferences</Button>
                  </div>
                </form>
              </Card>

              <Card title="Notifications (Demo)">
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                     <div className="flex items-center">
                       <Bell className="w-5 h-5 text-gray-500 mr-3" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                         <p className="text-xs text-gray-500">Receive updates about new bills</p>
                       </div>
                     </div>
                     <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                       <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-500 right-0"/>
                       <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-blue-500 cursor-pointer"></label>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                     <div className="flex items-center">
                       <Monitor className="w-5 h-5 text-gray-500 mr-3" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Desktop Alerts</p>
                         <p className="text-xs text-gray-500">Show popup notifications</p>
                       </div>
                     </div>
                     <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <div className="w-10 h-5 bg-gray-300 rounded-full"></div>
                        <div className="absolute left-0 top-0 bg-white w-5 h-5 rounded-full border border-gray-300 shadow-sm"></div>
                     </div>
                   </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card title="Account Overview">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Member Since</span>
                <span className="font-medium text-gray-900">Oct 2023</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Last Login</span>
                <span className="font-medium text-gray-900">Just now</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Plan</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Enterprise
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">2FA Status</span>
                <span className="text-red-500 text-xs font-medium cursor-pointer hover:underline">Disabled</span>
              </div>
            </div>
          </Card>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
             <h4 className="font-bold text-blue-900 mb-2">Need Help?</h4>
             <p className="text-sm text-blue-700 mb-4">
               Contact our support team for any issues regarding your account or billing.
             </p>
             <button className="text-blue-600 text-sm font-semibold hover:underline">
               Contact Support &rarr;
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};