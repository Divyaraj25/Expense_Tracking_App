import React, { useState } from 'react';
// FIX: Removed unused imports from `firebase/auth` as we now use compat library methods.
import { auth } from '../../firebase';
import Icon from '../shared/Icon';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // FIX: Switched to firebase compat method `auth.createUserWithEmailAndPassword`.
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      // Set the user's display name
      if (userCredential.user) {
        // FIX: Switched to firebase compat method `user.updateProfile`.
        await userCredential.user.updateProfile({ displayName: name });
      }
      // User will be automatically logged in by onAuthStateChanged listener in App.tsx
    } catch (err: any) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary p-3 rounded-full text-white mb-3">
            <Icon name="Wallet" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-secondary mt-1">Get started with FinTrack Pro.</p>
        </div>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-text-secondary">Full Name</label>
            <div className="mt-1 relative rounded-md shadow-sm">
               <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-secondary">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
         <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-primary hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;