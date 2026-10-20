import { motion } from 'framer-motion';
import { MapPin, Pencil, Cake, Droplet, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileCardProps {
  name: string;
  specialty?: string;
  location?: string;
  crn?: string;
  workingHours?: string;
  logoUrl?: string | null;
}

export function ProfileCard({
  name,
  specialty = 'NUTRICIONISTA',
  location = 'Brasil',
  crn = '—',
  workingHours = '9h - 18h',
  logoUrl,
}: ProfileCardProps) {
  const initials = name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'N';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-soft"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#518C5B] to-[#3d7047] px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-semibold tracking-wide text-sm">MEU PERFIL</h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Pencil className="w-4 h-4 text-white" />
        </motion.button>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <Avatar className="w-16 h-16 ring-4 ring-[#518C5B]/10">
              {logoUrl && <AvatarImage src={logoUrl} alt={name} className="object-cover" />}
              <AvatarFallback className="bg-gradient-to-br from-[#518C5B] to-[#3d7047] text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-foreground truncate">{name || 'Nutricionista'}</h4>
            <p className="text-xs text-[#C4764A] font-semibold tracking-wider mt-0.5">{specialty}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
          <StatItem icon={Cake} label="CRN" value={crn} color="text-[#518C5B]" />
          <StatItem icon={Droplet} label="Espec." value="Clínica" color="text-[#C4764A]" />
          <StatItem icon={Clock} label="Horário" value={workingHours} color="text-blue-500" />
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-xs font-bold text-foreground mt-0.5 truncate">{value}</p>
    </div>
  );
}