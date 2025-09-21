
import React from 'react';
import { CheckIcon } from './Icons';

interface NotificationProps {
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <div className="fixed top-5 right-5 bg-brand-blue text-white py-3 px-5 rounded-lg shadow-lg flex items-center animate-fade-in-down z-50">
      <CheckIcon className="w-5 h-5 mr-3 text-brand-light-teal" />
      <p>{message}</p>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Notification;
