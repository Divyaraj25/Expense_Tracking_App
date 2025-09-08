
import React, { useState } from 'react';
import Icon from '../shared/Icon';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary p-3 rounded-full text-white mb-3">
            <Icon name="Wallet" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">FinTrack Pro</h1>
          <p className="text-text-secondary mt-1">Welcome back! Please login to your account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Mail" className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-secondary">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Lock" className="text-gray-400" />
                </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter any password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          For demo, use <code className="bg-gray-200 p-1 rounded">alex@example.com</code> or <code className="bg-gray-200 p-1 rounded">john@example.com</code>.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
