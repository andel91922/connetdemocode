
import React from 'react';
import { User } from '../types';
import { XIcon } from './Icons';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-sm m-4 p-8 relative transform animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close profile"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
          <img 
            src={user.avatarUrl.replace('40/40', '128/128')} 
            alt={user.name} 
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200" 
          />
          <h2 className="text-2xl font-bold text-brand-text-primary">{user.name}</h2>
          <p className="text-sm text-green-500 font-semibold flex items-center justify-center mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Online
          </p>
        </div>
        <hr className="my-6 border-gray-200" />
        <div className="text-left">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Availability</h3>
          {user.availability && user.availability.length > 0 ? (
            <ul className="space-y-2 text-brand-text-secondary">
              {user.availability.map((slot, index) => (
                <li key={index} className="p-2 bg-gray-50 rounded-md text-sm">
                   <span>{slot}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm">No availability information provided.</p>
          )}
        </div>
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

export default ProfileModal;