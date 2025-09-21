export enum ChatType {
  PROJECT = 'PROJECT',
  PERSONAL = 'PERSONAL',
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  availability?: string[];
}

export interface Message {
  id:string;
  text: string;
  timestamp: string;
  userId: string;
  reactions?: Record<string, string[]>; // e.g., { '👍': ['user-1', 'user-2'] }
  attachment?: {
    name: string;
    type: string;
    size: number; // in bytes
  };
  parentId?: string; // ID of the message this is a reply to
  replyCount?: number; // Number of replies in the thread
  threadParticipants?: string[]; // IDs of users who replied
  readBy?: string[]; // IDs of users who have read the message
}

export interface Chat {
  id: string;
  name: string;
  type: ChatType;
  unreadCount?: number;
  members: string[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  sourceMessageId?: string;
  projectId?: string;
}

export interface Meeting {
  id:string;
  title: string;
  attendees: string[];
  start: Date;
  end: Date;
  projectId?: string;
  meetLink?: string;
}

export interface Notes {
  tasks: Task[];
  meetings: Meeting[];
}