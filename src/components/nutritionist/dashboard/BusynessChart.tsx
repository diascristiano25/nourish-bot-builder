import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BusynessChartProps {
  consultations?: number;
  analyzes?: number;
  meetings?: number;
  busynessPercent?: number;
}

export function BusynessChart({
  consultations = 0,
  analyzes = 0,
  meetings = 0,
  busynessPercent = 0,
}: BusynessChartProps) {
  const data = [
    { name: 'Consultations', value: consultations, color: '#518C5B' },
    { name: 'Analyzes', value: analyzes, color: '#C4764A' },
    { name: 'Meetings', value: meetings, color: '#ec4899' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-soft"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          MEUS EVENTOS AGENDADOS
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 bg-[#518C5B]/10 text-[#518C5B] text-xs font-semibold rounded-lg hover:bg-[#518C5B]/20 transition-colors"
        >
          Hoje
        </motion.button>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Chart */}
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{busynessPercent}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Ocupação
            </span>
          </div>
        </div>

        {/* Stats List */}
        <div className="flex-1 space-y-3">
          <StatRow value={consultations} label="Consultas" color="bg-[#518C5B]" />
          <StatRow value={analyzes} label="Análises" color="bg-[#C4764A]" />
          <StatRow value={meetings} label="Reuniões" color="bg-pink-500" />
        </div>
      </div>
    </motion.div>
  );
}

function StatRow({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xl font-bold text-foreground w-8">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}