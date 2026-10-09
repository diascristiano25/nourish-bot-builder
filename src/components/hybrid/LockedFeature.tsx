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
    <Card className="relative overflow-hidden border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-8">
      {/* Lock Icon in top-right */}
      <div className="absolute top-4 right-4 w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
        {icon || <Lock className="w-5 h-5 text-slate-400" />}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-100 pr-14">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>

        {/* CTA Button */}
        <Link to="/auth">
          <Button className="mt-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold">
            Desbloquear Agora
          </Button>
        </Link>
      </div>

      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600/5 to-transparent pointer-events-none" />
    </Card>
  );
}
