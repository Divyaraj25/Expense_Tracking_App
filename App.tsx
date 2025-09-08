
import React, { useState, useEffect } from 'react';
// FIX: Switched to firebase compat library to resolve module errors.
// The FirebaseUser type is now available on the firebase object.
import firebase from 'firebase/compat/app';
// FIX: onAuthStateChanged is no longer a separate export from firebase.ts, it's a method on `auth`.
import { auth } from './firebase';
import type { User } from './types';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import Dashboard from './components/dashboard/Dashboard';
import Icon from './components/shared/Icon';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // FIX: Called onAuthStateChanged as a method on the `auth` object, per firebase compat library.
    const unsubscribe = auth.onAuthStateChanged((user: firebase.User | null) => {
      if (user) {
        // In a real app, you might fetch a user profile from Firestore here
        setCurrentUser({ 
          id: user.uid, 
          email: user.email || 'No email',
          name: user.displayName || user.email?.split('@')[0] || 'User'
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex justify-center items-center">
            <div className="flex flex-col items-center">
                <Icon name="Wallet" size={48} className="text-primary animate-pulse" />
                <p className="text-text-secondary mt-4">Loading FinTrack Pro...</p>
            </div>
        </div>
    );
  }

  if (!currentUser) {
    return view === 'login' ? (
      <LoginScreen onSwitchToRegister={() => setView('register')} />
    ) : (
      <RegisterScreen onSwitchToLogin={() => setView('login')} />
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans">
      <Dashboard currentUser={currentUser} onLogout={() => auth.signOut()} />
    </div>
  );
};

export default App;
