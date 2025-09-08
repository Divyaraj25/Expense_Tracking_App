
import React from 'react';
import Icon from './Icon';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{ icon: string; label: string; view: string; activeView: string; onClick: (view: string) => void; }> = ({ icon, label, view, activeView, onClick }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-indigo-100 hover:text-primary'
      }`}
    >
      <Icon name={icon} className="mr-4" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { icon: 'LayoutDashboard', label: 'Dashboard', view: 'dashboard' },
    { icon: 'Landmark', label: 'Accounts', view: 'accounts' },
    { icon: 'ArrowRightLeft', label: 'Transactions', view: 'transactions' },
    { icon: 'Target', label: 'Budgets', view: 'budgets' },
    { icon: 'Settings', label: 'Settings', view: 'settings' },
  ];

  return (
    <aside className="w-64 bg-card h-screen p-4 flex flex-col shadow-md border-r border-gray-200">
      <div className="flex items-center p-4 mb-8">
        <div className="bg-primary p-3 rounded-full text-white mr-3">
            <Icon name="Wallet" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">FinTrack</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map(item => (
          <NavItem
            key={item.view}
            icon={item.icon}
            label={item.label}
            view={item.view}
            activeView={activeView}
            onClick={setActiveView}
          />
        ))}
      </nav>
      <div className="mt-auto p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-sm text-indigo-800">Upgrade to Pro for advanced features!</p>
          <button className="mt-3 w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Upgrade</button>
      </div>
    </aside>
  );
};

export default Sidebar;
