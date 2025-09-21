
import React from 'react';
import { Task } from '../types';
import { TrashIcon, CheckIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <li className="flex items-center p-2 rounded-md hover:bg-gray-50 group">
      <button onClick={() => onToggle(task.id)} className="mr-3">
        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${task.completed ? 'bg-brand-teal border-brand-teal' : 'border-gray-300'}`}>
          {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
      </button>
      <span className={`flex-grow ${task.completed ? 'line-through text-gray-400' : ''}`}>
        {task.text}
      </span>
      <button onClick={() => onDelete(task.id)} className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <TrashIcon className="w-4 h-4" />
      </button>
    </li>
  );
};

export default TaskItem;
