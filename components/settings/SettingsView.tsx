
import React from 'react';
import type { User } from '../../types';
import Button from '../shared/Button';
import Icon from '../shared/Icon';

interface SettingsViewProps {
  currentUser: User;
}

const SettingsCard: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
    <div className="bg-card p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary border-b pb-3 mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
        
        <SettingsCard title="Profile Information">
            <div className="flex items-center">
                <img 
                    className="h-16 w-16 rounded-full object-cover" 
                    src={`https://i.pravatar.cc/150?u=${currentUser.id}`}
                    alt="User avatar" 
                />
                <div className="ml-4">
                    <p className="text-xl font-bold text-text-primary">{currentUser.name}</p>
                    <p className="text-text-secondary">{currentUser.email}</p>
                </div>
            </div>
             <Button className="w-auto" variant="secondary">Edit Profile</Button>
        </SettingsCard>

        <SettingsCard title="Security">
            <div>
                <label className="block text-sm font-medium text-text-secondary">Password</label>
                <div className="flex items-center justify-between mt-1">
                    <p>************</p>
                    <Button className="w-auto" variant="secondary">Change Password</Button>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary">Two-Factor Authentication</label>
                 <div className="flex items-center justify-between mt-1">
                    <p className="text-text-secondary">Not enabled</p>
                    <Button className="w-auto" variant="secondary">Enable 2FA</Button>
                </div>
            </div>
        </SettingsCard>
        
        <SettingsCard title="Notifications">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-text-primary">Email Notifications</p>
                    <p className="text-sm text-text-secondary">Receive weekly summaries and alerts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-text-primary">Push Notifications</p>
                    <p className="text-sm text-text-secondary">Get real-time alerts on your devices.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
        </SettingsCard>

         <SettingsCard title="Danger Zone">
             <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                    <p className="font-bold text-red-800">Delete Account</p>
                    <p className="text-sm text-red-700">Permanently delete your account and all associated data. This action is irreversible.</p>
                </div>
                <Button variant="danger" className="w-auto">Delete My Account</Button>
             </div>
         </SettingsCard>
    </div>
  );
};

export default SettingsView;
