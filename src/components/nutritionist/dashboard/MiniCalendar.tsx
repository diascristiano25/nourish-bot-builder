import { motion } from 'framer-motion';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  time: string;
  title: string;
  color: string;
}

interface MiniCalendarProps {
  events?: CalendarEvent[];
}

const defaultEvents: CalendarEvent[] = [];

export function MiniCalendar({ events = defaultEvents }: MiniCalendarProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const [selectedDate, setSelectedDate] = useState(today);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-soft"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#518C5B] to-[#3d7047] px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-semibold tracking-wide text-sm">MEU CALENDÁRIO</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-colors"
        >
          {format(today, 'MMMM', { locale: ptBR })}
          <ChevronDown className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Week strip */}
      <div className="px-4 pt-5 pb-3">
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center py-2 rounded-xl transition-all",
                  isSelected
                    ? "bg-gradient-to-br from-[#518C5B] to-[#3d7047] text-white shadow-lg shadow-emerald-500/30"
                    : "hover:bg-slate-50 text-foreground"
                )}
              >
                <span className={cn(
                  "text-[10px] font-medium uppercase",
                  isSelected ? "text-white/80" : "text-muted-foreground"
                )}>
                  {dayLabels[i]}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {format(day, 'd')}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-[#C4764A] mt-0.5" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Events list */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h4>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {events.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-400">Nenhuma consulta agendada para este dia</p>
              </div>
            ) : events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 group cursor-pointer"
            >
              <span className="text-xs font-semibold text-muted-foreground w-12 pt-0.5 shrink-0">
                {event.time}
              </span>
              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", event.color)} />
              <span className="text-sm text-foreground group-hover:text-[#518C5B] transition-colors leading-snug">
                {event.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}