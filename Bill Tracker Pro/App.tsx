import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  LogOut, 
  Menu,
  Settings,
  User as UserIcon
} from 'lucide-react';
import { StorageService } from './services/storage';
import { User } from './types';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { BillForm } from './components/BillForm';
import { BillList } from './components/BillList';
import { Profile } from './components/Profile';

type View = 'DASHBOARD' | 'CREATE_BILL' | 'BILLS' | 'PROFILE';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BillTracker Pro
            </h1>
            <p className="text-xs text-gray-400 mt-1">Enterprise Edition</p>
          </div>

          <div className="flex-1 px-4 py-6 space-y-2">
            <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="CREATE_BILL" icon={PlusCircle} label="Create New Bill" />
            <NavItem view="BILLS" icon={FileText} label="History" />
            {/* Customer Directory removed from UI as requested, data remains in backend */}
            <NavItem view="PROFILE" icon={Settings} label="Profile" />
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div 
              className="flex items-center space-x-3 mb-4 px-2 py-2 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer transition-all"
              onClick={() => setCurrentView('PROFILE')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">BillTracker Pro</h1>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {currentView === 'DASHBOARD' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <p className="text-gray-500">Welcome back, here's what's happening today.</p>
                </div>
                <Dashboard onCreateNewBill={() => setCurrentView('CREATE_BILL')} />
              </>
            )}
            {currentView === 'CREATE_BILL' && (
              <BillForm 
                onSuccess={() => setCurrentView('BILLS')} 
                onBack={() => setCurrentView('DASHBOARD')}
                user={user} 
              />
            )}
            {currentView === 'BILLS' && (
              <BillList 
                user={user} 
                onBack={() => setCurrentView('DASHBOARD')}
              />
            )}
            {currentView === 'PROFILE' && (
              <Profile 
                user={user} 
                onUpdate={setUser} 
                onBack={() => setCurrentView('DASHBOARD')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;