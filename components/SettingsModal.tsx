import React, { useState } from 'react';
import { User } from '../types';
import { XIcon } from './Icons';
import AvailabilitySelector from './AvailabilitySelector';

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onSave: (updatedData: Partial<User>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentUser, onClose, onSave }) => {
  const [name, setName] = useState(currentUser.name);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [availability, setAvailability] = useState(currentUser.availability || []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        name,
        avatarUrl,
        availability,
    });
  };

  const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="block text-sm font-bold text-brand-text-secondary mb-2">{children}</label>
  );

  const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
      {...props}
      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
    />
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 p-8 relative transform animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close settings"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-brand-text-primary mb-6">Settings</h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center space-x-6">
            <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="flex-1">
              <FormLabel>Profile Picture URL</FormLabel>
              <FormInput
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>

          <div>
            <FormLabel>Full Name</FormLabel>
            <FormInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <FormLabel>Availability</FormLabel>
            <AvailabilitySelector value={availability} onChange={setAvailability} />
            <p className="text-xs text-gray-500 mt-2">Click and drag on the calendar to mark your available time slots.</p>
          </div>
          
          <div className="flex justify-end items-center pt-4 border-t border-gray-200">
             <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-brand-text-secondary hover:bg-gray-100 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-brand-teal text-white font-semibold rounded-md hover:bg-brand-blue transition-colors"
              >
                Save Changes
              </button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SettingsModal;
