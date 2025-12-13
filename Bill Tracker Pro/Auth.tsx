import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { Card, Input, Button } from './UI';
import { User as UserIcon, Lock, Mail, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = StorageService.login(formData.username, formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } else {
      // Register logic
      if (StorageService.getUsers().some(u => u.username === formData.username)) {
        setError('Username already exists');
        return;
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: formData.username,
        passwordHash: formData.password,
        email: formData.email,
        name: formData.name,
        role: 'USER'
      };
      
      StorageService.addUser(newUser);
      // Auto login after register
      const user = StorageService.login(formData.username, formData.password);
      if (user) onLogin(user);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BillTracker Pro</h1>
          <p className="text-blue-100">Manage your business with ease</p>
        </div>
        
        <Card className="shadow-2xl border-0">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <Input 
                    name="name" 
                    label="Full Name" 
                    placeholder="John Doe" 
                    value={formData.name} 
                    onChange={handleChange} 
                    icon={UserIcon}
                    required 
                  />
                  <Input 
                    name="email" 
                    label="Email Address" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    icon={Mail}
                    required 
                  />
                </>
              )}
              
              <Input 
                name="username" 
                label="Username" 
                placeholder="admin" 
                value={formData.username} 
                onChange={handleChange} 
                icon={UserIcon}
                required 
              />
              
              <Input 
                name="password" 
                label="Password" 
                type="password" 
                placeholder="••••••" 
                value={formData.password} 
                onChange={handleChange} 
                icon={Lock}
                required 
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                  <span className="font-medium">Error:</span>&nbsp;{error}
                </div>
              )}

              <Button type="submit" className="w-full py-3 mt-4" icon={ArrowRight}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                  className="ml-2 text-blue-600 font-semibold hover:underline focus:outline-none"
                >
                  {isLogin ? 'Register Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};