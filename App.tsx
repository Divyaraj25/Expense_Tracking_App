
import React, { useState, useMemo } from 'react';
import type { User } from './types';
import { USERS } from './constants';
import LoginScreen from './components/auth/LoginScreen';
import Dashboard from './components/dashboard/Dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Memoize the login function to prevent re-creation on re-renders
  const handleLogin = useMemo(() => {
    return (email: string) => {
      // This is a mock authentication. In a real app, you'd call an API.
      const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user);
      } else {
        alert('User not found. Try alex@example.com or john@example.com');
      }
    };
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background font-sans">
      <Dashboard currentUser={currentUser} onLogout={handleLogout} />
    </div>
  );
};

export default App;
