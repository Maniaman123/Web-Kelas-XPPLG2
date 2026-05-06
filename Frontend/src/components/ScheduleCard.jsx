import { useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import schedule from '../data/schedule';

export default function ScheduleCard() {
  const today = new Date().getDay();
  const defaultDay = today >= 1 && today <= 5 ? today - 1 : 0;
  const [activeDay, setActiveDay] = useState(defaultDay);
  const dayData = schedule[activeDay];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-base sm:text-lg font-bold text-inverted">Jadwal Kelas</h3>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {schedule.map((day, idx) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(idx)}
            className={`py-2 rounded-xl text-xs sm:text-sm font-medium text-center transition-all cursor-pointer ${
              activeDay === idx
                ? 'bg-primary text-white shadow-sm'
                : 'text-outlined hover:bg-black/5'
            }`}
          >
            {day.day}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {dayData.subjects.map((subject, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-alt hover:bg-secondary/50 transition-colors group"
          >
            <div className="text-[10px] sm:text-xs text-outlined font-mono whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
              {subject.time}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-inverted truncate">{subject.name}</p>
              <p className="text-[10px] sm:text-xs text-outlined truncate">{subject.teacher}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-outlined/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
