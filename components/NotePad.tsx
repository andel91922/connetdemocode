import React, { useState, useMemo } from 'react';
import { Notes, User, Task, Chat } from '../types';
import TaskItem from './TaskItem';
import Calendar from './Calendar';
import { PlusIcon } from './Icons';

interface NotePadProps {
  notes: Notes;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (taskText: string, projectId?: string) => void;
  users: Record<string, User>;
  chats: Chat[];
}

const NotePad: React.FC<NotePadProps> = ({ notes, onToggleTask, onDeleteTask, onAddTask, users, chats }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(newTaskText, selectedProjectId || undefined);
    setNewTaskText('');
    setSelectedProjectId('');
  };

  const tasksByProject = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    const projectMap = new Map(chats.map(c => [c.id, c.name]));

    notes.tasks.forEach(task => {
        const key = task.projectId || 'general';
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(task);
    });
    
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'general') return 1;
      if (b === 'general') return -1;
      return (projectMap.get(a) || '').localeCompare(projectMap.get(b) || '');
    });

    return sortedKeys.map(key => ({
      id: key,
      name: key === 'general' ? 'General Tasks' : projectMap.get(key) || 'Unknown Project',
      tasks: grouped[key]
    }));
  }, [notes.tasks, chats]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <header className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-lg">My Task</h2>
        <p className="text-sm text-brand-text-secondary">Your personal tasks and schedule</p>
      </header>
      <div className="flex-1 p-6 overflow-y-auto space-y-8">
        <section>
            <h3 className="text-base font-semibold text-brand-text-secondary mb-3 uppercase tracking-wider">Add New Task</h3>
            <form onSubmit={handleAddTaskSubmit} className="flex items-center gap-2 mb-4">
                <input 
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-grow px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
                <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal w-48"
                >
                    <option value="">No Project</option>
                    {chats.map(chat => (
                        <option key={chat.id} value={chat.id}>{chat.name}</option>
                    ))}
                </select>
                <button type="submit" className="p-2 bg-brand-teal text-white rounded-md hover:bg-brand-blue transition-colors flex-shrink-0">
                <PlusIcon className="w-5 h-5" />
                </button>
            </form>
        </section>

        <section>
          <h3 className="text-base font-semibold text-brand-text-secondary mb-3 uppercase tracking-wider">Task List</h3>
          {tasksByProject.map(projectGroup => (
              <div key={projectGroup.id} className="mb-6">
                  <h4 className="font-bold text-brand-text-primary mb-2 text-md">{projectGroup.name}</h4>
                  <ul className="space-y-2 border-l-2 pl-4 ml-1 border-gray-200">
                      {projectGroup.tasks.length > 0 ? projectGroup.tasks.map(task => (
                          <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
                      )) : <p className="text-sm text-gray-400 italic">No tasks for this project.</p>}
                  </ul>
              </div>
          ))}
        </section>
        
        <section>
          <h3 className="text-base font-semibold text-brand-text-secondary mb-3 uppercase tracking-wider">Weekly Schedule</h3>
          <Calendar meetings={notes.meetings} users={users} chats={chats} />
        </section>
      </div>
    </div>
  );
};

export default NotePad;
