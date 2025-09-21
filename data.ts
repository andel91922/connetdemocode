import { User, Chat, Message, ChatType, Notes } from './types';

export const initialUsers: Record<string, User> = {
  'user-1': { id: 'user-1', name: 'You', avatarUrl: 'https://picsum.photos/seed/you/40/40' },
  'user-2': { 
    id: 'user-2', 
    name: 'Alice Johnson', 
    avatarUrl: 'https://picsum.photos/seed/alice/40/40',
    availability: ['Mon, Wed: 9:00 AM - 12:00 PM (EST)', 'Tue, Thu: 2:00 PM - 5:00 PM (EST)']
  },
  'user-3': { 
    id: 'user-3', 
    name: 'Bob Williams', 
    avatarUrl: 'https://picsum.photos/seed/bob/40/40',
    availability: ['Mon - Fri: 10:00 AM - 6:00 PM (PST)']
  },
  'user-4': { 
    id: 'user-4', 
    name: 'Charlie Brown', 
    avatarUrl: 'https://picsum.photos/seed/charlie/40/40',
    availability: ['Wed: 1:00 PM - 4:00 PM (EST)', 'Fri: 9:00 AM - 11:00 AM (EST)']
  },
  'user-5': { 
    id: 'user-5', 
    name: 'Diana Prince', 
    avatarUrl: 'https://picsum.photos/seed/diana/40/40',
    availability: ['Mon - Fri: 9:00 AM - 5:00 PM (GMT)']
  },
  'user-6': { 
    id: 'user-6', 
    name: 'Bruce Wayne', 
    avatarUrl: 'https://picsum.photos/seed/bruce/40/40',
    availability: ['Evenings only']
  },
  'user-7': { 
    id: 'user-7', 
    name: 'Clark Kent', 
    avatarUrl: 'https://picsum.photos/seed/clark/40/40',
    availability: ['Flexible, please message first']
  },
};

export const initialChats: Chat[] = [
  { id: 'proj-1', name: 'Project Alpha', type: ChatType.PROJECT, unreadCount: 3, members: ['user-1', 'user-2', 'user-3'] },
  { id: 'proj-2', name: 'Market Entry Strategy', type: ChatType.PROJECT, members: ['user-1', 'user-4'] },
  { id: 'proj-3', name: 'Due Diligence Q4', type: ChatType.PROJECT, unreadCount: 1, members: ['user-1', 'user-2', 'user-4'] },
  { id: 'pers-1', name: 'Alice Johnson', type: ChatType.PERSONAL, members: ['user-1', 'user-2'] },
  { id: 'pers-2', name: 'Charlie Brown', type: ChatType.PERSONAL, unreadCount: 5, members: ['user-1', 'user-4'] },
  { id: 'pers-3', name: 'Diana Prince', type: ChatType.PERSONAL, members: ['user-1', 'user-5'] },
  { id: 'pers-4', name: 'Bruce Wayne', type: ChatType.PERSONAL, unreadCount: 1, members: ['user-1', 'user-6'] },
  { id: 'pers-5', name: 'Clark Kent', type: ChatType.PERSONAL, members: ['user-1', 'user-7'] },
];

export const initialMessages: Record<string, Message[]> = {
  'proj-1': [
    { id: 'm1-1', text: 'Hey team, the client meeting is confirmed for Friday at 10 AM. Please have your slides ready by EOD Thursday.', userId: 'user-2', timestamp: '9:30 AM', reactions: { '👍': ['user-1', 'user-3'] }, readBy: ['user-1', 'user-3'] },
    { id: 'm1-2', text: 'Got it, Alice. I\'ll have the market analysis section done.', userId: 'user-3', timestamp: '9:32 AM', reactions: { '🚀': ['user-2'] }, readBy: ['user-1', 'user-2'] },
    { id: 'm1-3', text: 'I can take care of the financial projections. Can someone help with the competitive landscape?', userId: 'user-1', timestamp: '9:35 AM', replyCount: 1, threadParticipants: ['user-2'], readBy: ['user-1', 'user-2', 'user-3'] },
    { id: 'm1-4', text: 'I can handle the competitive landscape, no problem.', userId: 'user-2', timestamp: '9:38 AM', parentId: 'm1-3', readBy: ['user-1', 'user-3'] },
    { id: 'm1-5', text: 'Here is the final report document.', userId: 'user-3', timestamp: '10:15 AM', attachment: { name: 'Final_Client_Report_v3.pdf', type: 'application/pdf', size: 2345678 }, readBy: ['user-1', 'user-2'] },
    { id: 'm1-6', text: 'Also, check out this competitor analysis I found: https://www.competitor-analysis-weekly.com/article/123', userId: 'user-2', timestamp: '10:20 AM', readBy: ['user-1', 'user-3'] },
  ],
  'proj-2': [
    { id: 'm2-1', text: 'Charlie, could you find some data on the APAC region market size for Q2?', userId: 'user-1', timestamp: 'Yesterday', readBy: ['user-1', 'user-4'] },
    { id: 'm2-2', text: 'On it. Will share the report by noon.', userId: 'user-4', timestamp: 'Yesterday', readBy: ['user-1'] },
  ],
  'proj-3': [
      { id: 'm3-1', text: 'The data room access has been granted. Please start reviewing the financial statements.', userId: 'user-4', timestamp: '11:00 AM', readBy: ['user-1'] }
  ],
  'pers-1': [
    { id: 'm4-1', text: 'Hey, do you have a moment to sync on the Project Alpha deck?', userId: 'user-2', timestamp: '2:15 PM', readBy: ['user-1'] },
    { id: 'm4-2', text: 'Sure, give me 5 minutes.', userId: 'user-1', timestamp: '2:16 PM', readBy: ['user-1'] },
  ],
  'pers-2': [
    { id: 'm5-1', text: 'FYI, I\'ve uploaded the preliminary findings to the shared drive.', userId: 'user-4', timestamp: '1:00 PM', readBy: ['user-1'] },
    { id: 'm5-2', text: 'Thanks! Reviewing now.', userId: 'user-1', timestamp: '1:02 PM', readBy: ['user-1', 'user-4'] },
    { id: 'm5-3', text: 'Let me know your thoughts.', userId: 'user-4', timestamp: '1:03 PM', readBy: ['user-1'] },
    { id: 'm5-4', text: 'Looks great, just one minor comment on slide 5.', userId: 'user-1', timestamp: '1:15 PM', readBy: ['user-1'] },
    { id: 'm5-5', text: 'Which part?', userId: 'user-4', timestamp: '1:16 PM', readBy: ['user-1'] },
  ],
  'pers-3': [
    { id: 'm6-1', text: 'Hi, just wanted to check in on the Project Alpha timeline. Are we on track?', userId: 'user-5', timestamp: '10:45 AM', readBy: ['user-1'] },
    { id: 'm6-2', text: 'Hey Diana, yes, things are looking good. I just pushed the latest updates.', userId: 'user-1', timestamp: '10:46 AM', readBy: ['user-1'] },
  ],
  'pers-4': [
    { id: 'm7-1', text: 'I need the final numbers for the Q4 diligence report by EOD.', userId: 'user-6', timestamp: '3:00 PM', readBy: ['user-1'] },
  ],
  'pers-5': [
    { id: 'm8-1', text: 'Great work on the market entry presentation!', userId: 'user-7', timestamp: 'Yesterday', readBy: ['user-1'] },
    { id: 'm8-2', text: 'Thanks Clark! Appreciate the feedback.', userId: 'user-1', timestamp: 'Yesterday', readBy: ['user-1', 'user-7'] },
  ],
};

// For meetings, let's create dynamic dates for the current week
const today = new Date();
const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
const monday = new Date(today);
monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Set to the Monday of the current week
monday.setHours(0, 0, 0, 0);

const createDate = (dayOffset: number, hour: number, minute: number = 0) => {
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const initialNotes: Notes = {
  tasks: [
    { id: 't-1', text: 'Finalize Q3 financial model', completed: false, projectId: 'proj-1' },
    { id: 't-2', text: 'Draft client workshop agenda', completed: true, projectId: 'proj-2' },
    { id: 't-3', text: 'Book team dinner', completed: false }, // No project
  ],
  meetings: [
    { 
      id: 'mt-1', 
      title: 'Project Alpha Weekly Sync', 
      attendees: ['user-2', 'user-3'], 
      start: createDate(0, 10), // Monday 10:00 AM
      end: createDate(0, 11, 30),  // Monday 11:30 AM
      projectId: 'proj-1',
      meetLink: 'https://meet.google.com/new'
    },
    {
      id: 'mt-2',
      title: 'Market Entry Strategy Brainstorm',
      attendees: ['user-4'],
      start: createDate(2, 14), // Wednesday 2:00 PM
      end: createDate(2, 16),   // Wednesday 4:00 PM
      projectId: 'proj-2',
      meetLink: 'https://meet.google.com/new'
    },
    {
      id: 'mt-3',
      title: 'Due Diligence Check-in',
      attendees: ['user-2', 'user-4'],
      start: createDate(4, 9),  // Friday 9:00 AM
      end: createDate(4, 9, 30), // Friday 9:30 AM
      projectId: 'proj-3',
      meetLink: 'https://meet.google.com/new'
    }
  ],
};