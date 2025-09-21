import React, { useState, useRef, useEffect } from 'react';
import { Message, User, Chat } from '../types';
import MessageItem from './Message';
import { PaperClipIcon, XIcon } from './Icons';

interface ThreadViewProps {
    chat: Chat;
    parentMessage: Message;
    replies: Message[];
    users: Record<string, User>;
    onClose: () => void;
    onSendMessage: (text: string, attachment?: File) => void;
    onToggleReaction: (chatId: string, messageId: string, emoji: string) => void;
    onViewProfile: (userId: string) => void;
    onAddTask: (messageText: string, chatId: string) => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({
    chat, parentMessage, replies, users, onClose, onSendMessage, 
    onToggleReaction, onViewProfile, onAddTask
}) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [replies]);

    const handleSendMessage = () => {
        if (newMessage.trim() || attachment) {
            onSendMessage(newMessage.trim(), attachment || undefined);
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

    const parentUser = users[parentMessage.userId];

    return (
        <div className="w-96 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col h-full">
            <header className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-md">Thread</h3>
                    <p className="text-sm text-brand-text-secondary">Replies to a message</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                    <XIcon className="w-5 h-5" />
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Parent Message */}
                {parentUser && (
                    <MessageItem
                        key={parentMessage.id}
                        chat={chat}
                        message={parentMessage}
                        user={parentUser}
                        users={users}
                        showHeader={true}
                        onAddTask={() => onAddTask(parentMessage.text, chat.id)}
                        onToggleReaction={(emoji) => onToggleReaction(chat.id, parentMessage.id, emoji)}
                        onViewProfile={onViewProfile}
                        onOpenThread={() => {}}
                        isInThread={true}
                    />
                )}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">{parentMessage.replyCount || 0} {parentMessage.replyCount === 1 ? 'Reply' : 'Replies'}</span>
                    <hr className="flex-grow border-t border-gray-200" />
                </div>
                {/* Replies */}
                {replies.map((reply, index) => {
                    const user = users[reply.userId];
                    const showHeader = index === 0 || replies[index - 1].userId !== reply.userId;
                    return user ? (
                        <MessageItem
                            key={reply.id}
                            chat={chat}
                            message={reply}
                            user={user}
                            users={users}
                            showHeader={showHeader}
                            onAddTask={() => onAddTask(reply.text, chat.id)}
                            onToggleReaction={(emoji) => onToggleReaction(chat.id, reply.id, emoji)}
                            onViewProfile={onViewProfile}
                            onOpenThread={() => {}}
                            isInThread={true}
                        />
                    ) : null;
                })}
                <div ref={messagesEndRef} />
            </div>
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
                        placeholder="Reply..."
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                </div>
            </footer>
        </div>
    );
};

export default ThreadView;