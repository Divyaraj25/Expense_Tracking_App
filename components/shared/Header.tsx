
import React from 'react';
import type { User } from '../../types';
import Icon from './Icon';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-card h-20 flex items-center justify-between px-6 shadow-sm border-b border-gray-200">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Welcome back, {currentUser.name.split(' ')[0]}!</h2>
        <p className="text-sm text-text-secondary">Here's your financial overview for today.</p>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-500 hover:text-primary">
          <Icon name="Bell" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="flex items-center">
            <img 
                className="h-10 w-10 rounded-full object-cover" 
                src={`https://i.pravatar.cc/150?u=${currentUser.id}`}
                alt="User avatar" 
            />
            <div className="ml-3">
                <p className="text-sm font-semibold text-text-primary">{currentUser.name}</p>
                <p className="text-xs text-text-secondary">{currentUser.email}</p>
            </div>
        </div>
        <button onClick={onLogout} className="text-gray-500 hover:text-primary" title="Logout">
          <Icon name="LogOut" />
        </button>
      </div>
    </header>
  );
};

export default Header;
