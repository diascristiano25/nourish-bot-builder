import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Droplets, Plus, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface CircularWaterTrackerProps {
  currentMl: number;
  goalMl: number;
  onAddWater: (amount: number) => void;
}

export function CircularWaterTracker({ currentMl, goalMl, onAddWater }: CircularWaterTrackerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  
  const percentage = Math.min((currentMl / goalMl) * 100, 100);
  const isGoalReached = currentMl >= goalMl;
  
  // Circle dimensions
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (isGoalReached && !celebrated) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#22C55E'],
      });
      setCelebrated(true);
    }
  }, [isGoalReached, celebrated]);

  useEffect(() => {
    if (!isGoalReached) {
      setCelebrated(false);
    }
  }, [isGoalReached]);

  const handleAddWater = (amount: number) => {
    setIsAnimating(true);
    onAddWater(amount);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular Progress */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isGoalReached ? "hsl(var(--success))" : "hsl(var(--info))"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <button
          onClick={() => handleAddWater(250)}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center",
            "transition-transform duration-200 active:scale-95",
            isAnimating && "scale-95"
          )}
        >
          <Droplets className={cn(
            "w-6 h-6 mb-1 transition-colors",
            isGoalReached ? "text-success" : "text-info"
          )} />
          <span className="text-2xl font-bold text-foreground">
            {(currentMl / 1000).toFixed(1)}L
          </span>
          <span className="text-xs text-muted-foreground">
            de {(goalMl / 1000).toFixed(1)}L
          </span>
          {isGoalReached && (
            <span className="flex items-center gap-1 text-[10px] text-success mt-1">
              <Sparkles className="w-3 h-3" />
              Meta atingida!
            </span>
          )}
        </button>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddWater(250)}
          className="h-9 px-4 rounded-full border-info/30 text-info hover:bg-info/10 hover:text-info"
        >
          <Plus className="w-4 h-4 mr-1" />
          250ml
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddWater(500)}
          className="h-9 px-4 rounded-full border-info/30 text-info hover:bg-info/10 hover:text-info"
        >
          <Plus className="w-4 h-4 mr-1" />
          500ml
        </Button>
      </div>
    </div>
  );
}
