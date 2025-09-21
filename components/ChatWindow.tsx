import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message, User, ChatType } from '../types';
import MessageItem from './Message';
import FilesAndLinks from './FilesAndLinks';
import ThreadView from './ThreadView';
import { HashIcon, PaperClipIcon, XIcon } from './Icons';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  users: Record<string, User>;
  onAddTask: (messageText: string, chatId: string) => void;
  onViewProfile: (userId: string) => void;
  onSendMessage: (chatId: string, text: string, attachment?: File, parentId?: string) => void;
  onToggleReaction: (chatId: string, messageId: string, emoji: string) => void;
  activeThreadParentId: string | null;
  onOpenThread: (messageId: string) => void;
  onCloseThread: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    chat, messages, users, onAddTask, onViewProfile, onSendMessage, onToggleReaction,
    activeThreadParentId, onOpenThread, onCloseThread
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const memberNames = chat.members.map(id => users[id]?.name).filter(Boolean).join(', ');
  const otherUserId = chat.type === ChatType.PERSONAL ? chat.members.find(id => id !== 'user-1') : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    if (activeTab === 'chat' && !activeThreadParentId) {
        scrollToBottom();
    }
  }, [messages, activeTab, activeThreadParentId]);

  useEffect(() => {
    setActiveTab('chat');
  }, [chat.id]);

  const handleSendMessage = () => {
    if (newMessage.trim() || attachment) {
      onSendMessage(chat.id, newMessage.trim(), attachment || undefined);
      setNewMessage('');
      setAttachment(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const TabButton: React.FC<{label: string, name: string}> = ({ label, name }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === name ? 'bg-gray-200 text-brand-text-primary' : 'text-brand-text-secondary hover:bg-gray-100'}`}
    >
      {label}
    </button>
  );

  const mainMessages = messages.filter(msg => !msg.parentId);
  const parentMessage = activeThreadParentId ? messages.find(m => m.id === activeThreadParentId) : null;
  const threadReplies = activeThreadParentId ? messages.filter(m => m.parentId === activeThreadParentId) : [];

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <header className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center font-bold text-lg">
            <HashIcon className="w-5 h-5 mr-2 text-gray-400" />
            {otherUserId ? (
              <button 
                onClick={() => onViewProfile(otherUserId)}
                className="hover:underline focus:outline-none"
                aria-label={`View profile of ${chat.name}`}
              >
                <h2>{chat.name}</h2>
              </button>
            ) : (
              <h2>{chat.name}</h2>
            )}
          </div>
          <p className="text-sm text-brand-text-secondary">{memberNames}</p>
        </header>
        {chat.type === ChatType.PROJECT && (
          <div className="px-6 py-2 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <TabButton label="Chat" name="chat" />
              <TabButton label="Files & Links" name="files" />
            </div>
          </div>
        )}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'chat' ? (
            <div className="space-y-6">
              {mainMessages.map((msg, index) => {
                const user = users[msg.userId];
                const showHeader = index === 0 || mainMessages[index - 1].userId !== msg.userId;
                return user ? <MessageItem key={msg.id} chat={chat} message={msg} user={user} users={users} showHeader={showHeader} onAddTask={() => onAddTask(msg.text, chat.id)} onToggleReaction={(emoji) => onToggleReaction(chat.id, msg.id, emoji)} onViewProfile={onViewProfile} onOpenThread={onOpenThread} isInThread={false} /> : null;
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
              <FilesAndLinks messages={messages} users={users} />
          )}
        </div>
        {activeTab === 'chat' && (
            <footer className="p-4 border-t border-gray-200 bg-white">
              {attachment && (
                <div className="mb-2 px-3 py-1.5 bg-brand-light-teal/50 text-sm rounded-md flex items-center justify-between">
                  <span className="font-medium text-brand-blue">{attachment.name}</span>
                  <button onClick={() => setAttachment(null)} className="p-1 rounded-full hover:bg-black/10">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="relative flex items-center">
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      className="hidden" 
                  />
                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach file"
                      className="p-2 mr-2 text-gray-500 hover:text-brand-blue hover:bg-gray-100 rounded-full"
                  >
                      <PaperClipIcon className="w-5 h-5" />
                  </button>
                  <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message #${chat.name}`}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
              </div>
            </footer>
        )}
      </div>

      {/* Thread View */}
      {parentMessage && (
        <ThreadView
            chat={chat}
            parentMessage={parentMessage}
            replies={threadReplies}
            users={users}
            onClose={onCloseThread}
            onSendMessage={(text, attachment) => onSendMessage(chat.id, text, attachment, parentMessage.id)}
            onToggleReaction={onToggleReaction}
            onViewProfile={onViewProfile}
            onAddTask={onAddTask}
        />
      )}
    </div>
  );
};

export default ChatWindow;