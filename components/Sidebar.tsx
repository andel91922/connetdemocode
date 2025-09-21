import React, { useState } from 'react';
import { Chat, ChatType, User } from '../types';
import { HashIcon, NoteIcon, ChevronDownIcon, VideoCameraIcon, ConNetLogo } from './Icons';

interface SidebarProps {
  chats: Chat[];
  activeId: string | null;
  onSelectChat: (chatId: string) => void;
  onSelectView: (view: string) => void;
  onOpenSettings: () => void;
  users: Record<string, User>;
}

const ChatLink: React.FC<{ chat: Chat; isActive: boolean; onClick: () => void; users: Record<string, User> }> = ({ chat, isActive, onClick, users }) => {
  const activeClasses = 'bg-brand-teal text-white';
  const inactiveClasses = 'text-gray-300 hover:bg-brand-blue/60 hover:text-white';
  
  const otherUserId = chat.type === ChatType.PERSONAL ? chat.members.find(id => id !== 'user-1') : null;
  const otherUser = otherUserId ? users[otherUserId] : null;

  return (
    <li className="px-4">
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`group flex items-center justify-between py-2 px-3 rounded-md transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      >
        <div className="flex items-center truncate">
          {chat.type === ChatType.PROJECT ? (
            <HashIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
             otherUser && (
                <div className="relative mr-3 flex-shrink-0">
                    <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-7 h-7 rounded-full" />
                    <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-brand-blue"></span>
                </div>
             )
          )}
          <span className="truncate">{chat.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          {chat.type === ChatType.PERSONAL && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open('https://meet.google.com/new', '_blank');
              }}
              title="Start instant meeting"
              className="p-1 rounded-full text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-green-500 hover:text-white transition-opacity"
              aria-label={`Start video call with ${chat.name}`}
            >
              <VideoCameraIcon className="w-5 h-5" />
            </button>
          )}
          {chat.unreadCount && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </a>
    </li>
  );
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider hover:text-white"
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            {isOpen && <ul className="space-y-1">{children}</ul>}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ chats, activeId, onSelectChat, onSelectView, onOpenSettings, users }) => {
  const projectChats = chats.filter(c => c.type === ChatType.PROJECT);
  const personalChats = chats.filter(c => c.type === ChatType.PERSONAL);
  const currentUser = users['user-1'];

  return (
    <div className="w-72 bg-brand-blue text-white flex flex-col flex-shrink-0">
      <div className="px-6 py-4 border-b border-white/10 flex items-center space-x-3">
        <ConNetLogo className="w-8 h-8" />
        <h1 className="text-xl font-bold">CON NET</h1>
      </div>
      <nav className="flex-1 py-4 space-y-4 overflow-y-auto">
        <div>
          <button 
            onClick={() => onSelectView('notepad')}
            className={`flex items-center w-[calc(100%-2rem)] mx-4 py-2 px-3 rounded-md transition-colors duration-200 ${activeId === 'notepad' ? 'bg-brand-teal text-white' : 'text-gray-300 hover:bg-brand-blue/60 hover:text-white'}`}
          >
            <NoteIcon className="w-5 h-5 mr-2" />
            <span>My Task</span>
          </button>
        </div>

        <CollapsibleSection title="Projects">
            {projectChats.map(chat => (
                <ChatLink key={chat.id} chat={chat} users={users} isActive={activeId === chat.id} onClick={() => onSelectChat(chat.id)} />
            ))}
        </CollapsibleSection>
        
        <CollapsibleSection title="Personal">
            {personalChats.map(chat => (
                <ChatLink key={chat.id} chat={chat} users={users} isActive={activeId === chat.id} onClick={() => onSelectChat(chat.id)} />
            ))}
        </CollapsibleSection>
      </nav>
      <div className="px-4 py-3 border-t border-white/10">
          <button 
            onClick={onOpenSettings}
            className="flex items-center w-full p-2 rounded-md hover:bg-white/10 transition-colors"
            title="Open settings"
          >
            <img src={currentUser.avatarUrl} alt="My Avatar" className="w-10 h-10 rounded-full mr-3" />
            <div className="text-left">
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-sm text-green-400">Online</p>
            </div>
          </button>
      </div>
    </div>
  );
};

export default Sidebar;