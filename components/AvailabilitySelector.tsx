import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface AvailabilitySelectorProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayMap: Record<string, number> = { 'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6 };

const START_HOUR = 7;
const END_HOUR = 22;

const timeSlots = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => {
    const totalMinutes = START_HOUR * 60 + i * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
        totalMinutes,
        label: `${displayHour}:${minute === 0 ? '00' : '30'} ${ampm}`,
    };
});

const minutesToDisplayTime = (totalMinutes: number) => {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute === 0 ? '00' : '30'} ${ampm}`;
};

const parseAvailabilityStrings = (strings: string[]): Set<string> => {
    const selected = new Set<string>();
    const dayRegex = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/g;
    const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM))/g;

    strings.forEach(str => {
        const parts = str.split(':');
        if (parts.length < 2) return;

        const dayPart = parts[0];
        const timePart = parts.slice(1).join(':');

        const parsedDays = new Set<string>();
        
        // Handle ranges like "Mon-Fri"
        const rangeMatch = dayPart.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*-\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/);
        if(rangeMatch) {
            const startDayIndex = days.indexOf(rangeMatch[1]);
            const endDayIndex = days.indexOf(rangeMatch[2]);
            if(startDayIndex !== -1 && endDayIndex !== -1) {
                for(let i = startDayIndex; i <= endDayIndex; i++) {
                    parsedDays.add(days[i]);
                }
            }
        } else {
            // Handle lists like "Mon, Wed"
            const dayMatches = dayPart.match(dayRegex);
            if (dayMatches) {
                dayMatches.forEach(day => parsedDays.add(day));
            }
        }
        
        const timeMatches = timePart.match(timeRegex);
        if (timeMatches && timeMatches.length === 2) {
            const [startTimeStr, endTimeStr] = timeMatches;
            
            const parseTime = (timeStr: string) => {
                const [time, ampm] = timeStr.split(' ');
                let [hour, minute] = time.split(':').map(Number);
                if (ampm === 'PM' && hour !== 12) hour += 12;
                if (ampm === 'AM' && hour === 12) hour = 0;
                return hour * 60 + minute;
            };

            const startMinutes = parseTime(startTimeStr);
            const endMinutes = parseTime(endTimeStr);

            parsedDays.forEach(day => {
                for (let m = startMinutes; m < endMinutes; m += 30) {
                    selected.add(`${dayMap[day]}-${m}`);
                }
            });
        }
    });

    return selected;
};

const formatSlotsToStrings = (selectedSlots: Set<string>): string[] => {
    if (selectedSlots.size === 0) return [];

    const slotsByDay: Record<number, number[]> = {};
    selectedSlots.forEach(slot => {
        const [day, minutes] = slot.split('-').map(Number);
        if (!slotsByDay[day]) slotsByDay[day] = [];
        slotsByDay[day].push(minutes);
    });

    const rangesByDay: Record<number, { start: number, end: number }[]> = {};
    Object.entries(slotsByDay).forEach(([day, minutes]) => {
        const dayNum = Number(day);
        minutes.sort((a, b) => a - b);
        
        if (minutes.length === 0) return;
        
        rangesByDay[dayNum] = [];
        let currentRange = { start: minutes[0], end: minutes[0] + 30 };
        
        for (let i = 1; i < minutes.length; i++) {
            if (minutes[i] === currentRange.end) {
                currentRange.end += 30;
            } else {
                rangesByDay[dayNum].push(currentRange);
                currentRange = { start: minutes[i], end: minutes[i] + 30 };
            }
        }
        rangesByDay[dayNum].push(currentRange);
    });

    const rangesToString = (r: { start: number, end: number }) => `${minutesToDisplayTime(r.start)} - ${minutesToDisplayTime(r.end)}`;
    
    const stringsByTime: Record<string, number[]> = {};
    Object.entries(rangesByDay).forEach(([day, ranges]) => {
        const dayNum = Number(day);
        ranges.forEach(range => {
            const timeStr = rangesToString(range);
            if (!stringsByTime[timeStr]) stringsByTime[timeStr] = [];
            stringsByTime[timeStr].push(dayNum);
        });
    });

    return Object.entries(stringsByTime).map(([timeStr, dayIndices]) => {
        dayIndices.sort((a, b) => a - b);
        const dayStr = dayIndices.map(i => days[i]).join(', ');
        return `${dayStr}: ${timeStr}`;
    });
};

const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({ value, onChange }) => {
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);
    const dragStartSlot = useRef<string | null>(null);

    useEffect(() => {
        setSelectedSlots(parseAvailabilityStrings(value));
    }, [value]);

    const handleSlotsChanged = (newSlots: Set<string>) => {
        setSelectedSlots(newSlots);
        onChange(formatSlotsToStrings(newSlots));
    };
    
    const handleMouseDown = (dayIndex: number, minutes: number) => {
        const slotId = `${dayIndex}-${minutes}`;
        setIsDragging(true);
        dragStartSlot.current = slotId;
        setDragMode(selectedSlots.has(slotId) ? 'remove' : 'add');
        toggleSlot(dayIndex, minutes, selectedSlots.has(slotId) ? 'remove' : 'add');
    };
    
    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragMode(null);
            dragStartSlot.current = null;
            // Final update on mouse up
            onChange(formatSlotsToStrings(selectedSlots));
        }
    };

    const toggleSlot = (dayIndex: number, minutes: number, mode: 'add' | 'remove') => {
        const slotId = `${dayIndex}-${minutes}`;
        const newSlots = new Set(selectedSlots);
        if (mode === 'add') {
            newSlots.add(slotId);
        } else {
            newSlots.delete(slotId);
        }
        setSelectedSlots(newSlots);
    };

    const handleMouseEnter = (dayIndex: number, minutes: number) => {
        if (isDragging && dragMode) {
            toggleSlot(dayIndex, minutes, dragMode);
        }
    };
    
    return (
        <div className="border border-gray-200 rounded-lg p-2 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] text-center">
                <div />
                {days.map(day => <div key={day} className="text-xs font-bold py-1">{day}</div>)}

                {timeSlots.map(({ totalMinutes, label }, timeIndex) => (
                    <React.Fragment key={totalMinutes}>
                        {timeIndex % 2 === 0 && <div className="row-span-2 text-right pr-2 text-xs text-gray-500 relative -top-2">{label.split(' ')[0]}</div>}
                        {days.map((_, dayIndex) => {
                            const slotId = `${dayIndex}-${totalMinutes}`;
                            const isSelected = selectedSlots.has(slotId);
                            return (
                                <div
                                    key={slotId}
                                    onMouseDown={() => handleMouseDown(dayIndex, totalMinutes)}
                                    onMouseEnter={() => handleMouseEnter(dayIndex, totalMinutes)}
                                    className={`h-3 border-t border-l border-gray-200 cursor-pointer transition-colors ${isSelected ? 'bg-brand-teal' : 'hover:bg-brand-light-teal'}`}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default AvailabilitySelector;
