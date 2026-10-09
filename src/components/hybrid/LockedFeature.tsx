import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface LockedFeatureProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function LockedFeature({ title, description, icon }: LockedFeatureProps) {
  return (
    <Card className="relative overflow-hidden border-[#C4764A]/30 bg-gradient-to-br from-[#FAF8F5] to-white p-8">
      {/* Lock Icon in top-right */}
      <div className="absolute top-4 right-4 w-10 h-10 bg-[#C4764A]/10 rounded-lg flex items-center justify-center">
        {icon || <Lock className="w-5 h-5 text-[#C4764A]" />}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-[#518C5B] pr-14">{title}</h3>
        <p className="text-[#C4764A]/80 leading-relaxed">{description}</p>

        {/* CTA Button */}
        <Link to="/auth">
          <Button className="mt-6 bg-[#518C5B] hover:bg-[#518C5B]/90 text-white font-semibold">
            Desbloquear Agora
          </Button>
        </Link>
      </div>

      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#518C5B]/5 to-transparent pointer-events-none" />
    </Card>
  );
}
