import React from 'react';
import { Meeting, User, Chat } from '../types';

interface CalendarProps {
    meetings: Meeting[];
    users: Record<string, User>;
    chats: Chat[];
}

const Calendar: React.FC<CalendarProps> = ({ meetings, users, chats }) => {
    const projectMap = new Map(chats.map(c => [c.id, c.name]));
    const projectColors: Record<string, { bg: string, border: string, text: string }> = {
        'proj-1': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700'},
        'proj-2': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
        'proj-3': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
    };
    const defaultColor = { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700' };

    const today = new Date();
    const dayOfWeek = today.getDay(); // Sun=0, Mon=1...
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const weekDays = Array.from({ length: 5 }, (_, i) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        return day;
    });

    const timeRange = { start: 8, end: 18 }; // 8 AM to 6 PM
    const hours = Array.from({ length: timeRange.end - timeRange.start }, (_, i) => timeRange.start + i);

    return (
        <div className="flex flex-col border border-gray-200 rounded-lg bg-white">
            {/* Header */}
            <div className="grid grid-cols-[4rem_repeat(5,1fr)] flex-shrink-0">
                <div className="w-16"></div> {/* Gutter */}
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="text-center py-2 border-l border-b border-gray-200">
                        <div className="font-semibold text-sm text-brand-text-primary">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-gray-500 text-lg">{day.getDate()}</div>
                    </div>
                ))}
            </div>

            {/* Body */}
            <div className="grid grid-cols-[4rem_repeat(5,1fr)] h-[60vh] overflow-y-auto">
                {/* Time Gutter */}
                <div className="row-start-1 col-start-1 grid" style={{ gridTemplateRows: `repeat(${hours.length}, 5rem)`}}>
                    {hours.map(hour => (
                        <div key={hour} className="flex justify-end pr-2 border-r border-t border-gray-200">
                            <span className="text-xs text-gray-500 -translate-y-1/2">{hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}</span>
                        </div>
                    ))}
                </div>
                {/* Calendar Grid */}
                <div className="col-start-2 col-span-5 grid grid-cols-5 relative" style={{ gridTemplateRows: `repeat(${hours.length}, 5rem)`}}>
                    {/* Vertical Lines */}
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="row-start-1 row-span-full col-start-1 col-span-full border-l border-gray-200" style={{gridColumnStart: i + 2}}></div>
                    ))}
                    {/* Horizontal Lines */}
                    {hours.map((_, i) => (
                        <div key={i} className="row-start-1 row-span-full col-start-1 col-span-full border-t border-gray-200" style={{gridRowStart: i + 1}}></div>
                    ))}
                    
                    {/* Meetings */}
                    {meetings.map(meeting => {
                        const meetingDay = meeting.start.getDay(); // Sun=0, Mon=1...
                        if (meetingDay < 1 || meetingDay > 5) return null;
                        
                        const weekStartDay = monday.getDate();
                        const meetingDate = meeting.start.getDate();
                        const weekEndDay = weekStartDay + 5;
                        
                        if (meeting.start.getMonth() !== monday.getMonth() || meetingDate < weekStartDay || meetingDate >= weekEndDay) {
                            return null;
                        }

                        const dayIndex = meetingDay - 1; // Mon=0
                        
                        const startMinutes = (meeting.start.getHours() * 60) + meeting.start.getMinutes();
                        const endMinutes = (meeting.end.getHours() * 60) + meeting.end.getMinutes();
                        
                        const durationMinutes = endMinutes - startMinutes;
                        
                        const top = ((startMinutes - timeRange.start * 60) / 60) * 5; // 5rem per hour
                        const height = (durationMinutes / 60) * 5;

                        const colors = meeting.projectId ? projectColors[meeting.projectId] || defaultColor : defaultColor;

                        const meetingContent = (
                            <>
                                <p className="font-bold truncate">{meeting.title}</p>
                                {projectMap.has(meeting.projectId || '') && <p className="opacity-80 truncate">{projectMap.get(meeting.projectId!)}</p>}
                                <div className="absolute bottom-1.5 flex -space-x-1.5">
                                    {meeting.attendees.map(uid => users[uid] && (
                                        <img key={uid} src={users[uid].avatarUrl} title={users[uid].name} className="w-5 h-5 rounded-full border-2 border-white"/>
                                    ))}
                                </div>
                            </>
                        );

                        const commonClasses = `absolute rounded p-2 text-xs overflow-hidden border ${colors.bg} ${colors.border} ${colors.text}`;
                        const commonStyle = {
                            left: `calc(${dayIndex * 20}% + 4px)`,
                            top: `${top}rem`,
                            width: `calc(20% - 8px)`,
                            height: `${height}rem`,
                        };

                        if (meeting.meetLink) {
                             return (
                                <a
                                    key={meeting.id}
                                    href={meeting.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Join Google Meet for "${meeting.title}"`}
                                    className={`${commonClasses} cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg`}
                                    style={commonStyle}
                                >
                                    {meetingContent}
                                </a>
                            )
                        }

                        return (
                             <div key={meeting.id} className={commonClasses} style={commonStyle}>
                                {meetingContent}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default Calendar;