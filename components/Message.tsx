import React, { useState, useRef, useEffect } from 'react';
import { Message, User, Chat, ChatType } from '../types';
import { AddToTaskIcon, SmileyIcon, DocumentTextIcon, ReplyIcon, DoubleCheckIcon } from './Icons';

interface MessageProps {
  chat: Chat;
  message: Message;
  user: User;
  users: Record<string, User>;
  showHeader: boolean;
  onAddTask: () => void;
  onToggleReaction: (emoji: string) => void;
  onViewProfile: (userId: string) => void;
  onOpenThread: (messageId: string) => void;
  isInThread: boolean;
}

const ReactionPicker: React.FC<{ onSelect: (emoji: string) => void }> = ({ onSelect }) => {
    const emojis = ['👍', '❤️', '😂', '😮', '🚀', '🤔'];
    return (
        <div className="absolute bottom-full mb-2 right-0 bg-white shadow-lg rounded-full border border-gray-200 flex p-1 z-10">
            {emojis.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="p-1.5 rounded-full text-lg hover:bg-gray-100 transition-colors"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};


const MessageItem: React.FC<MessageProps> = ({ chat, message, user, users, showHeader, onAddTask, onToggleReaction, onViewProfile, onOpenThread, isInThread }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const reactions = message.reactions || {};
  const currentUserId = 'user-1';

  useEffect(() => {
    if (!showReactionPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setShowReactionPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactionPicker]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  const renderReadReceipt = () => {
    const isMyMessage = message.userId === currentUserId;
    if (!isMyMessage) return null;

    const otherReaders = (message.readBy || []).filter(id => id !== currentUserId);

    if (chat.type === ChatType.PERSONAL) {
        // Fix: Wrapped DoubleCheckIcon in a span to apply the title attribute for tooltips,
        // as the icon component itself does not accept a 'title' prop.
        return otherReaders.length > 0
            ? <span title="Read"><DoubleCheckIcon className="w-5 h-5 text-brand-teal"/></span>
            : <span title="Sent"><DoubleCheckIcon className="w-5 h-5 text-gray-400"/></span>;
    }

    if (chat.type === ChatType.PROJECT) {
        if (otherReaders.length === 0) return null;
        
        const readerUsers = otherReaders.map(id => users[id]).filter(Boolean);
        const tooltipText = "Read by " + readerUsers.map(u => u.name).join(', ');

        return (
            <div className="flex -space-x-2" title={tooltipText}>
                {readerUsers.slice(0, 4).map(u => (
                    <img key={u.id} src={u.avatarUrl} className="w-5 h-5 rounded-full border border-white"/>
                ))}
            </div>
        );
    }
    
    return null;
  };

  return (
    <div className="flex items-start group">
      <div className="w-10 h-10 mr-4">
        {showHeader && <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-md" />}
      </div>
      <div className="flex-1">
        {showHeader && (
          <div className="flex items-baseline mb-1">
            <button onClick={() => onViewProfile(user.id)} className="font-bold mr-2 hover:underline focus:outline-none">{user.name}</button>
            <span className="text-xs text-gray-500">{message.timestamp}</span>
          </div>
        )}
        <div className="flex items-start">
            <div className="flex-grow pr-4">
                {message.text && <p className="text-brand-text-primary break-words">{message.text}</p>}
                {message.attachment && (
                    <div className="mt-2 border rounded-lg p-3 flex items-center space-x-3 bg-gray-50 max-w-sm">
                        <div className="flex-shrink-0 bg-brand-blue text-white p-2 rounded-md">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-brand-blue truncate">{message.attachment.name}</p>
                            <p className="text-sm text-gray-500">{formatBytes(message.attachment.size)}</p>
                        </div>
                    </div>
                )}
                 {Object.keys(reactions).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(reactions).map(([emoji, userIds]) => (
                            <button
                                key={emoji}
                                onClick={() => onToggleReaction(emoji)}
                                className={`flex items-center border rounded-full px-2 py-0.5 text-sm transition-colors ${
                                    userIds.includes(currentUserId) ? 'bg-brand-light-teal border-brand-teal' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                                }`}
                            >
                                <span>{emoji}</span>
                                <span className="ml-1.5 font-medium text-xs text-brand-text-primary">{userIds.length}</span>
                            </button>
                        ))}
                    </div>
                )}
                {message.replyCount && message.replyCount > 0 && !isInThread && (
                    <div className="mt-2">
                        <button onClick={() => onOpenThread(message.id)} className="flex items-center space-x-2 text-sm text-brand-teal font-semibold hover:underline">
                             <div className="flex -space-x-2">
                                {(message.threadParticipants || []).slice(0, 3).map(uid => users[uid] && (
                                    <img key={uid} src={users[uid].avatarUrl} title={users[uid].name} className="w-5 h-5 rounded-full border-2 border-white"/>
                                ))}
                            </div>
                            <span>{message.replyCount} {message.replyCount > 1 ? 'replies' : 'reply'}</span>
                        </button>
                    </div>
                )}
                <div className="flex justify-end items-center mt-1 h-5 text-right">
                    {renderReadReceipt()}
                </div>
            </div>
            <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-start">
                <div 
                    className="relative"
                    ref={reactionPickerRef}
                >
                    <button 
                      onClick={() => setShowReactionPicker(prev => !prev)}
                      className="p-1 rounded-md text-gray-400 hover:bg-gray-200 hover:text-brand-blue"
                      title="Add reaction"
                    >
                      <SmileyIcon className="w-5 h-5" />
                    </button>
                    {showReactionPicker && <ReactionPicker onSelect={(emoji) => { onToggleReaction(emoji); setShowReactionPicker(false); }} />}
                </div>
                 <button 
                  onClick={onAddTask}
                  className="p-1 rounded-md text-gray-400 hover:bg-gray-200 hover:text-brand-blue"
                  title="Add to Task Pad"
                >
                  <AddToTaskIcon className="w-5 h-5" />
                </button>
                {!isInThread && (
                    <button 
                        onClick={() => onOpenThread(message.id)}
                        className="p-1 rounded-md text-gray-400 hover:bg-gray-200 hover:text-brand-blue"
                        title="Reply in thread"
                    >
                        <ReplyIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;