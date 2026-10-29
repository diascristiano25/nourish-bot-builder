import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format, getDaysInMonth, startOfMonth, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  appointmentDates: Date[];
  isLoading?: boolean;
}

// Comparação segura por componentes locais (evita problemas de fuso/toDateString)
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function Calendar({
  selectedDate,
  onSelectDate,
  appointmentDates = [],
  isLoading = false
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));

  // Sincroniza o mês visível sempre que selectedDate muda (ex: ao agendar para
  // novembro via dialog, o calendário passa a mostrar novembro automaticamente)
  useEffect(() => {
    const target = startOfMonth(selectedDate);
    if (target.getTime() !== currentMonth.getTime()) {
      setCurrentMonth(target);
    }
  }, [selectedDate]);

  // Get all days in current month
  const monthStart = startOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) =>
      addDays(monthStart, i)
    );
  }, [monthStart, daysInMonth]);

  // Convert appointment dates to stable YYYY-MM-DD keys (timezone-safe)
  const appointmentDateKeys = useMemo(() =>
    new Set(appointmentDates.map(d => dateKey(new Date(d)))),
    [appointmentDates]
  );

  const todayKey = useMemo(() => dateKey(new Date()), []);
  const selectedKey = dateKey(selectedDate);

  const isToday = (date: Date) => dateKey(date) === todayKey;
  const isSelected = (date: Date) => dateKey(date) === selectedKey;
  const hasAppointment = (date: Date) => appointmentDateKeys.has(dateKey(date));

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-foreground">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const selected = isSelected(day);
            const today = isToday(day);
            const appointment = hasAppointment(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                disabled={isLoading}
                style={{
                  animation: `fadeInScale 0.3s ease-out ${index * 0.01}s both`,
                }}
                className={`
                  relative h-10 rounded-lg font-medium text-sm transition-all duration-200
                  ${selected
                    ? 'bg-gradient-to-r from-cyber-lime to-electric-violet text-background shadow-lg'
                    : today
                    ? 'bg-electric-violet/20 text-electric-violet border border-electric-violet/50'
                    : 'hover:bg-muted text-foreground'
                  }
                  ${appointment && !selected ? 'ring-1 ring-cyber-lime/50' : ''}
                  disabled:opacity-50
                `}
                aria-label={format(day, 'd MMMM yyyy', { locale: ptBR })}
                aria-current={today ? 'date' : undefined}
              >
                {format(day, 'd')}
                {appointment && !selected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyber-lime rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
