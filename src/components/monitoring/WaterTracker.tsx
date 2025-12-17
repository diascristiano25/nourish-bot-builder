import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Plus, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WaterTrackerProps {
  currentMl: number;
  goalMl: number;
  onAddWater: (amount: number) => void;
  loading?: boolean;
}

export function WaterTracker({ currentMl, goalMl, onAddWater, loading }: WaterTrackerProps) {
  const [celebrated, setCelebrated] = useState(false);
  const percentage = Math.min((currentMl / goalMl) * 100, 100);
  const isGoalReached = currentMl >= goalMl;

  useEffect(() => {
    if (isGoalReached && !celebrated) {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      });
      setCelebrated(true);
    }
  }, [isGoalReached, celebrated]);

  // Reset celebration when a new day starts (current < goal again)
  useEffect(() => {
    if (!isGoalReached) {
      setCelebrated(false);
    }
  }, [isGoalReached]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Droplets className="w-4 h-4 text-info" />
          Água do Dia
          {isGoalReached && (
            <span className="ml-auto flex items-center gap-1 text-xs text-success font-normal">
              <Sparkles className="w-3 h-3" />
              Meta atingida!
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {(currentMl / 1000).toFixed(1)}
              </span>
              <span className="text-lg text-muted-foreground">L</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Meta: {(goalMl / 1000).toFixed(1)}L
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={percentage} 
              className="h-4 bg-muted/50"
            />
            <div 
              className={`absolute inset-0 h-4 rounded-full transition-all duration-500 ${
                isGoalReached 
                  ? 'bg-gradient-to-r from-primary to-success' 
                  : 'bg-gradient-to-r from-info/80 to-info'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {percentage.toFixed(0)}% da meta diária
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border/50 hover:bg-info/10 hover:border-info/30 hover:text-info transition-colors"
            onClick={() => onAddWater(250)}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            250ml
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border/50 hover:bg-info/10 hover:border-info/30 hover:text-info transition-colors"
            onClick={() => onAddWater(500)}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            500ml
          </Button>
        </div>

        {/* Water glass visualization */}
        <div className="flex justify-center gap-1 pt-2">
          {Array.from({ length: 8 }).map((_, i) => {
            const glassThreshold = (goalMl / 8) * (i + 1);
            const isFilled = currentMl >= glassThreshold;
            const isPartial = currentMl > (goalMl / 8) * i && currentMl < glassThreshold;
            
            return (
              <div
                key={i}
                className={`w-6 h-8 rounded-b-lg border-2 transition-all duration-300 ${
                  isFilled 
                    ? 'bg-info/80 border-info' 
                    : isPartial 
                      ? 'bg-info/30 border-info/50' 
                      : 'bg-muted/30 border-muted-foreground/20'
                }`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
