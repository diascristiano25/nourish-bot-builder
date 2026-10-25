import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, Leaf, Heart, Activity, Coffee, Pill, Stethoscope, Apple, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRef } from 'react';

interface DashboardHeroProps {
  name: string;
}

export function DashboardHero({ name }: DashboardHeroProps) {
  const firstName = name?.split(' ')[0] || 'Nutricionista';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dayName = format(new Date(), "EEEE", { locale: ptBR });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  // Parallax mouse tracking
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / 30);
    y.set((e.clientY - centerY) / 30);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#518C5B] via-[#4a7d52] to-[#2d5a37] p-8 md:p-10 text-white shadow-2xl shadow-emerald-900/30"
      style={{
        boxShadow: '0 25px 50px -12px rgba(45, 90, 55, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
    >
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Decorative floating icons with parallax */}
      <motion.div
        style={{ x: useTransform(springX, v => v * 1.5), y: useTransform(springY, v => v * 1.5) }}
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 right-40 opacity-20"
      >
        <Leaf className="w-10 h-10" />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, v => v * -1), y: useTransform(springY, v => v * -1) }}
        animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-24 right-56 opacity-15"
      >
        <Heart className="w-8 h-8" />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, v => v * 2), y: useTransform(springY, v => v * 2) }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-10 right-32 opacity-15"
      >
        <Coffee className="w-9 h-9" />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, v => v * -1.5), y: useTransform(springY, v => v * -1.5) }}
        animate={{ y: [0, 10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-16 right-16 opacity-20"
      >
        <Pill className="w-7 h-7" />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, v => v * 1), y: useTransform(springY, v => v * 1) }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-16 right-48 opacity-15"
      >
        <Activity className="w-10 h-10" />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, v => v * -2), y: useTransform(springY, v => v * -2) }}
        animate={{ y: [0, 6, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-12 right-72 opacity-10"
      >
        <Apple className="w-12 h-12" />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, v => v * 1.2), y: useTransform(springY, v => v * 1.2) }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="absolute bottom-8 right-64 opacity-10"
      >
        <Dumbbell className="w-8 h-8" />
      </motion.div>

      {/* Rich illustration with parallax */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 hidden md:block">
        <motion.div
          style={{ x: useTransform(springX, v => v * -0.5), y: useTransform(springY, v => v * -0.5) }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative w-44 h-44 lg:w-52 lg:h-52"
        >
          {/* Glow behind illustration */}
          <div className="absolute inset-0 bg-card/10 rounded-full blur-3xl scale-110" />
          <svg viewBox="0 0 200 200" className="relative w-full h-full drop-shadow-2xl">
            {/* Body/coat */}
            <ellipse cx="100" cy="165" rx="42" ry="30" fill="white" opacity="0.95" />
            <rect x="70" y="100" width="60" height="70" rx="8" fill="white" opacity="0.95" />
            {/* Head */}
            <circle cx="100" cy="75" r="28" fill="#F5D5B8" />
            {/* Hair */}
            <path d="M 72 68 Q 75 42 100 45 Q 125 42 128 68 Q 125 55 100 58 Q 75 55 72 68" fill="#3d2817" />
            {/* Stethoscope */}
            <path d="M 80 115 Q 80 135 100 135 Q 120 135 120 115" stroke="#518C5B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="140" r="6" fill="#518C5B" />
            <circle cx="100" cy="140" r="3" fill="#3d7047" />
            {/* Smile */}
            <path d="M 90 82 Q 100 90 110 82" stroke="#3d2817" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="90" cy="72" r="2" fill="#3d2817" />
            <circle cx="110" cy="72" r="2" fill="#3d2817" />
            {/* Eye shine */}
            <circle cx="91" cy="71" r="0.8" fill="white" />
            <circle cx="111" cy="71" r="0.8" fill="white" />
            {/* Coat details */}
            <line x1="100" y1="105" x2="100" y2="160" stroke="#e8e8e8" strokeWidth="1" />
            <circle cx="100" cy="120" r="2" fill="#ddd" />
            <circle cx="100" cy="135" r="2" fill="#ddd" />
            {/* Pocket */}
            <rect x="78" y="125" width="12" height="15" rx="2" fill="none" stroke="#e8e8e8" strokeWidth="1" />
            {/* Pen in pocket */}
            <line x1="82" y1="122" x2="82" y2="128" stroke="#518C5B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20 shadow-lg"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium tabular-nums">
            {format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR })} · {format(new Date(), "HH:mm")}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-3 leading-tight"
        >
          {greeting},{' '}
          <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            Dr. {firstName}
          </span>
          !
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/75 text-lg font-light"
        >
          Tenha uma ótima {capitalizedDay}!
        </motion.p>
      </div>
    </motion.div>
  );
}