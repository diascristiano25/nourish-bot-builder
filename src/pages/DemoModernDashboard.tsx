import { motion } from 'framer-motion';
import { ModernLayout } from '@/components/layout/ModernLayout';
import {
  Calendar, TrendingUp, Users, DollarSign, Clock,
  ChevronRight, Sparkles, Search, Bell, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Mock data
const mockChartData = [
  { month: 'Jan', atendimentos: 45 },
  { month: 'Fev', atendimentos: 52 },
  { month: 'Mar', atendimentos: 61 },
  { month: 'Abr', atendimentos: 58 },
  { month: 'Mai', atendimentos: 69 },
  { month: 'Jun', atendimentos: 73 },
];

const mockWeeklyData = [
  { day: 'Seg', atendimentos: 12 },
  { day: 'Ter', atendimentos: 15 },
  { day: 'Qua', atendimentos: 18 },
  { day: 'Qui', atendimentos: 14 },
  { day: 'Sex', atendimentos: 16 },
  { day: 'Sáb', atendimentos: 8 },
  { day: 'Dom', atendimentos: 5 },
];

const mockAppointments = [
  { id: '1', patient: 'Andrea Silva', time: '15:00' },
  { id: '2', patient: 'Bruno Costa', time: '16:30' },
  { id: '3', patient: 'Carlos Lima', time: '17:00' },
  { id: '4', patient: 'Diana Souza', time: '18:00' },
];

const statCards = [
  {
    title: 'Pacientes Hoje',
    value: '10',
    subtitle: 'Agendados',
    icon: Calendar,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600'
  },
  {
    title: 'Total Consultas',
    value: '65',
    subtitle: 'Este mês',
    icon: Users,
    bgColor: 'bg-[#518C5B]/10',
    iconColor: 'text-[#518C5B]'
  },
  {
    title: 'Receita',
    value: 'R$ 1.250',
    subtitle: '+18%',
    icon: DollarSign,
    bgColor: 'bg-[#C4764A]/10',
    iconColor: 'text-[#C4764A]'
  },
  {
    title: 'Pacientes Ativos',
    value: '156',
    subtitle: 'Total',
    icon: TrendingUp,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-700'
  }
];

export default function DemoModernDashboard() {
  return (
    <ModernLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF8F5]/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <motion.h1
              className="text-2xl font-bold text-foreground"
              whileHover={{ scale: 1.02, x: 5 }}
            >
              Bom dia, Cristiano
            </motion.h1>
            <motion.p
              className="text-sm text-muted-foreground mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Segunda-feira, 10 de janeiro
            </motion.p>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                className="pl-10 w-[280px] h-10 rounded-xl bg-white border-border/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl relative">
                <Bell className="w-5 h-5" />
                <motion.span
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-emerald-500/20 hover:ring-emerald-500/40 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  C
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative cursor-pointer"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="relative bg-white rounded-3xl p-6 border border-border/40"
                whileHover={{
                  boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)"
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center`}
                    whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-emerald-600" />
                  </motion.div>
                </div>
                <motion.h3
                  className="text-3xl font-bold text-foreground mb-1"
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <motion.p
                  className="text-xs text-emerald-600 font-medium mt-1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {stat.subtitle}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart Area - 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
            className="lg:col-span-2 bg-white rounded-3xl p-6 border border-border/40 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-foreground">Evolução</h3>
                <p className="text-sm text-muted-foreground">Total por mês</p>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                {['Dia', 'Semana', 'Mês', 'Ano'].map((period, i) => (
                  <motion.div
                    key={period}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={i === 1 ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 text-xs ${i === 1 ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    >
                      {period}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              className="h-[320px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '8px 12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="atendimentos"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                    animationDuration={1500}
                    animationBegin={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/40">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05, x: 5 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Taxa de Crescimento</p>
                <motion.p
                  className="text-2xl font-bold text-emerald-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  +18%
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05, x: 5 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Média Semanal</p>
                <motion.p
                  className="text-2xl font-bold text-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                >
                  23
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

          {/* Appointments Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)"
            }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white overflow-hidden relative"
          >
            {/* Animated background circles */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.h3
                  className="text-lg font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Próximos Pacientes
                </motion.h3>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 h-8 rounded-xl"
                  >
                    Ver todos
                  </Button>
                </motion.div>
              </div>

              <div className="space-y-3">
                {mockAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -30, rotateY: -15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{
                      delay: 0.6 + index * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{
                      scale: 1.05,
                      x: 5,
                      backgroundColor: "rgba(255, 255, 255, 0.25)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
                        whileHover={{
                          rotate: [0, -10, 10, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <UserIcon className="w-5 h-5" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.p
                          className="font-medium truncate"
                          whileHover={{ x: 3 }}
                        >
                          {apt.patient}
                        </motion.p>
                        <p className="text-xs text-white/70">{apt.time}</p>
                      </div>
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Clock className="w-4 h-4 text-white/70" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="secondary"
                  className="w-full mt-6 bg-white text-emerald-600 hover:bg-white/90 rounded-xl h-11 font-medium shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  Agendar Consulta
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          whileHover={{
            scale: 1.01,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}
          className="bg-white rounded-3xl p-6 border border-border/40"
        >
          <motion.h3
            className="text-lg font-semibold text-foreground mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            Atendimentos por Dia
          </motion.h3>
          <motion.div
            className="h-[240px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyData}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '8px 12px'
                  }}
                />
                <Bar
                  dataKey="atendimentos"
                  fill="#10b981"
                  radius={[12, 12, 0, 0]}
                  animationDuration={1000}
                  animationBegin={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
