import { motion } from 'framer-motion';
import { Calendar, Leaf, Heart, Activity, Coffee, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardHeroProps {
  name: string;
}

export function DashboardHero({ name }: DashboardHeroProps) {
  const firstName = name?.split(' ')[0] || 'Nutricionista';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dayName = format(new Date(), "EEEE", { locale: ptBR });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#518C5B] via-[#4a7d52] to-[#3d7047] p-8 text-white shadow-xl shadow-emerald-900/20"
    >
      {/* Decorative floating icons */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-6 right-32 opacity-30"
      >
        <Leaf className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-20 right-48 opacity-25"
      >
        <Heart className="w-6 h-6" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-8 right-24 opacity-25"
      >
        <Coffee className="w-7 h-7" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-12 right-12 opacity-30"
      >
        <Pill className="w-6 h-6" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-12 right-40 opacity-20"
      >
        <Activity className="w-8 h-8" />
      </motion.div>

      {/* Abstract nutritionist illustration (CSS/SVG) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative w-40 h-40"
        >
          <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl" />
          <svg viewBox="0 0 160 160" className="relative w-full h-full drop-shadow-2xl">
            {/* Body */}
            <ellipse cx="80" cy="130" rx="35" ry="25" fill="white" opacity="0.95" />
            {/* Head */}
            <circle cx="80" cy="65" r="22" fill="#F5D5B8" />
            {/* Hair */}
            <path d="M 58 60 Q 60 40 80 42 Q 100 40 102 60 Q 100 50 80 52 Q 60 50 58 60" fill="#3d2817" />
            {/* Stethoscope */}
            <path d="M 65 95 Q 65 110 80 110 Q 95 110 95 95" stroke="#518C5B" strokeWidth="3" fill="none" />
            <circle cx="80" cy="115" r="5" fill="#518C5B" />
            {/* Smile */}
            <path d="M 73 72 Q 80 78 87 72" stroke="#3d2817" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="73" cy="63" r="1.5" fill="#3d2817" />
            <circle cx="87" cy="63" r="1.5" fill="#3d2817" />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR })} · {format(new Date(), "HH:mm")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold mb-2 leading-tight"
        >
          {greeting}, Dr. {firstName}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 text-lg"
        >
          Tenha uma ótima {capitalizedDay}!
        </motion.p>
      </div>
    </motion.div>
  );
}