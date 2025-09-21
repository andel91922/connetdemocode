
import React, { useState, useCallback, useEffect } from 'react';
import { initialChats, initialMessages, initialUsers, initialNotes } from './data';
import { Chat, ChatType, Message, Notes, Task, User } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import NotePad from './components/NotePad';
import Notification from './components/Notification';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('chat'); // 'chat' or 'notepad'
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChats[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [notes, setNotes] = useState<Notes>(initialNotes);
  const [users, setUsers] = useState<Record<string, User>>(initialUsers);
  const [notification, setNotification] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [activeThreadParentId, setActiveThreadParentId] = useState<string | null>(null);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  const handleMarkMessagesAsReadByCurrentUser = (chatId: string) => {
    setMessages(prevMessages => {
        const chatMessages = prevMessages[chatId] || [];
        if (chatMessages.length === 0) return prevMessages;

        const updatedMessages = chatMessages.map(msg => {
            if (msg.userId === 'user-1') return msg;

            const readers = new Set(msg.readBy || []);
            if (!readers.has('user-1')) {
                readers.add('user-1');
                return { ...msg, readBy: Array.from(readers) };
            }
            return msg;
        });

        if (JSON.stringify(chatMessages) === JSON.stringify(updatedMessages)) {
            return prevMessages;
        }

        return { ...prevMessages, [chatId]: updatedMessages };
    });
  };

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setActiveView('chat');
    setActiveThreadParentId(null);
    handleMarkMessagesAsReadByCurrentUser(chatId);
  }, []);

  // Effect to simulate other users reading your messages
  useEffect(() => {
    if (!activeChatId || isSettingsModalOpen) return;

    const chat = initialChats.find(c => c.id === activeChatId);
    if (!chat) return;

    const chatMessages = messages[activeChatId] || [];
    const lastMessage = chatMessages[chatMessages.length - 1];
    
    // Only run if the last message is from the current user and not yet read by others
    if (lastMessage && lastMessage.userId === 'user-1') {
        const otherUserIds = chat.members.filter(id => id !== 'user-1');
        if(otherUserIds.length === 0) return;

        const isReadByOthers = (lastMessage.readBy || []).some(readerId => otherUserIds.includes(readerId));
        
        if (!isReadByOthers) {
            const timer = setTimeout(() => {
                setMessages(prevMessages => {
                    const currentChatMessages = prevMessages[activeChatId] || [];
                    const updatedMessages = currentChatMessages.map(msg => {
                        if (msg.id === lastMessage.id) {
                            const readers = new Set(msg.readBy || []);
                            otherUserIds.forEach(id => readers.add(id));
                            return { ...msg, readBy: Array.from(readers) };
                        }
                        return msg;
                    });
                    // Prevent update if nothing changed
                    if (JSON.stringify(currentChatMessages) === JSON.stringify(updatedMessages)) {
                        return prevMessages;
                    }
                    return { ...prevMessages, [activeChatId]: updatedMessages };
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }
  }, [activeChatId, messages, isSettingsModalOpen]);


  useEffect(() => {
    if (activeChatId) {
        handleMarkMessagesAsReadByCurrentUser(activeChatId);
    }
  }, [activeChatId]);

  const handleSelectView = useCallback((view: string) => {
    setActiveView(view);
    setActiveThreadParentId(null); // Close thread when switching views
    if (view !== 'chat') {
      setActiveChatId(null);
    } else if (!activeChatId && initialChats.length > 0) {
      setActiveChatId(initialChats[0].id);
    }
  }, [activeChatId]);

  const handleSendMessage = (chatId: string, text: string, attachment?: File, parentId?: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: 'user-1', // Always send as 'You'
      parentId,
      readBy: ['user-1'], // You've "read" your own message
    };

    if (attachment) {
      newMessage.attachment = {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
      };
    }

    setMessages(prevMessages => {
        const chatMessages = prevMessages[chatId] || [];
        let updatedMessages = [...chatMessages, newMessage];

        if (parentId) {
            updatedMessages = updatedMessages.map(msg => {
                if (msg.id === parentId) {
                    const newParticipants = new Set(msg.threadParticipants || []);
                    newParticipants.add('user-1');
                    return {
                        ...msg,
                        replyCount: (msg.replyCount || 0) + 1,
                        threadParticipants: Array.from(newParticipants),
                    };
                }
                return msg;
            });
        }
        return {
            ...prevMessages,
            [chatId]: updatedMessages,
        };
    });
  };
  
  const handleToggleReaction = (chatId: string, messageId: string, emoji: string) => {
    const currentUserId = 'user-1';
    setMessages(prevMessages => {
        const chatMessages = prevMessages[chatId];
        if (!chatMessages) return prevMessages;

        const updatedMessages = chatMessages.map(msg => {
            if (msg.id === messageId) {
                const reactions = { ...(msg.reactions || {}) };
                const userList = reactions[emoji] || [];

                if (userList.includes(currentUserId)) {
                    // User is removing their reaction
                    reactions[emoji] = userList.filter(id => id !== currentUserId);
                    if (reactions[emoji].length === 0) {
                        delete reactions[emoji];
                    }
                } else {
                    // User is adding a reaction
                    reactions[emoji] = [...userList, currentUserId];
                }
                return { ...msg, reactions };
            }
            return msg;
        });

        return { ...prevMessages, [chatId]: updatedMessages };
    });
  };

  const handleAddTaskFromMessage = useCallback((messageText: string, chatId: string) => {
    const chat = initialChats.find(c => c.id === chatId);
    const projectId = chat?.type === ChatType.PROJECT ? chat.id : undefined;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: messageText,
      completed: false,
      projectId: projectId,
    };
    setNotes(prevNotes => ({
      ...prevNotes,
      tasks: [newTask, ...prevNotes.tasks],
    }));
    showNotification('Task added to your Task Pad');
  }, []);

  const handleToggleTask = useCallback((taskId: string) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      tasks: prevNotes.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setNotes(prevNotes => ({
        ...prevNotes,
        tasks: prevNotes.tasks.filter(task => task.id !== taskId)
    }));
  }, []);
  
  const handleAddTaskFromNotePad = useCallback((taskText: string, projectId?: string) => {
      if (!taskText.trim()) return;
      const newTask: Task = {
          id: `task-${Date.now()}`,
          text: taskText,
          completed: false,
          projectId: projectId || undefined,
      };
      setNotes(prevNotes => ({
          ...prevNotes,
          tasks: [newTask, ...prevNotes.tasks]
      }));
  }, []);

  const handleViewProfile = (userId: string) => {
    setViewingProfile(users[userId] || null);
  };

  const handleCloseProfile = () => {
    setViewingProfile(null);
  };

  const handleOpenThread = (messageId: string) => {
    setActiveThreadParentId(messageId);
  };

  const handleCloseThread = () => {
    setActiveThreadParentId(null);
  };
  
  const handleOpenSettings = () => setSettingsModalOpen(true);
  const handleCloseSettings = () => setSettingsModalOpen(false);

  const handleUpdateUserSettings = (updatedData: Partial<User>) => {
      setUsers(prevUsers => ({
          ...prevUsers,
          'user-1': { ...prevUsers['user-1'], ...updatedData }
      }));
      showNotification('Profile updated successfully!');
      handleCloseSettings();
  };

  const activeChat = initialChats.find(c => c.id === activeChatId);
  const activeChatMessages = activeChatId ? messages[activeChatId] || [] : [];

  return (
    <div className="flex h-screen font-sans text-brand-text-primary antialiased">
      {notification && <Notification message={notification} />}
      {viewingProfile && <ProfileModal user={viewingProfile} onClose={handleCloseProfile} />}
      {isSettingsModalOpen && (
        <SettingsModal 
          currentUser={users['user-1']} 
          onClose={handleCloseSettings} 
          onSave={handleUpdateUserSettings} 
        />
      )}
      <Sidebar
        chats={initialChats}
        activeId={activeView === 'chat' ? activeChatId : 'notepad'}
        onSelectChat={handleSelectChat}
        onSelectView={handleSelectView}
        onOpenSettings={handleOpenSettings}
        users={users}
      />
      <main className="flex-1 flex flex-col bg-brand-surface">
        {activeView === 'chat' && activeChat && (
          <ChatWindow
            chat={activeChat}
            messages={activeChatMessages}
            users={users}
            onAddTask={handleAddTaskFromMessage}
            onViewProfile={handleViewProfile}
            onSendMessage={handleSendMessage}
            onToggleReaction={handleToggleReaction}
            activeThreadParentId={activeThreadParentId}
            onOpenThread={handleOpenThread}
            onCloseThread={handleCloseThread}
          />
        )}
        {activeView === 'notepad' && (
          <NotePad 
            notes={notes}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTaskFromNotePad}
            users={users}
            chats={initialChats.filter(c => c.type === ChatType.PROJECT)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
