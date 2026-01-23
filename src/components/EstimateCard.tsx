import { Calendar, Clock, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EstimateCardProps {
  totalPrayers: number;
  dailyGoal: number;
  daysToComplete: number;
  onGoalChange: (goal: number) => void;
}

export function EstimateCard({
  totalPrayers,
  dailyGoal,
  daysToComplete,
  onGoalChange,
}: EstimateCardProps) {
  const formatDuration = (days: number) => {
    if (!isFinite(days) || days === 0) return 'Set a goal to calculate';
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (remainingDays > 0 || parts.length === 0) {
      parts.push(`${remainingDays} day${remainingDays !== 1 ? 's' : ''}`);
    }

    return parts.join(', ');
  };

  const completionDate = () => {
    if (!isFinite(daysToComplete) || daysToComplete === 0) return null;
    const date = new Date();
    date.setDate(date.getDate() + daysToComplete);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="gradient-primary rounded-2xl p-6 text-primary-foreground shadow-elevated animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5" />
        <h2 className="font-display text-xl font-semibold">Time Estimate</h2>
      </div>

      <div className="grid gap-6">
        {/* Daily Goal Input */}
        <div className="space-y-2">
          <Label htmlFor="dailyGoal" className="text-primary-foreground/80 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Prayers per day
          </Label>
          <Input
            id="dailyGoal"
            type="number"
            min={1}
            max={100}
            value={dailyGoal}
            onChange={(e) => onGoalChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-body"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <p className="text-sm text-primary-foreground/70 font-body">Total Qadha</p>
            <p className="font-display text-3xl font-bold">{totalPrayers}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <p className="text-sm text-primary-foreground/70 font-body">Days Needed</p>
            <p className="font-display text-3xl font-bold">
              {isFinite(daysToComplete) ? daysToComplete : '—'}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-primary-foreground/10 rounded-xl p-4">
          <p className="text-sm text-primary-foreground/70 font-body mb-1">Estimated Duration</p>
          <p className="font-display text-lg font-semibold">{formatDuration(daysToComplete)}</p>
        </div>

        {/* Completion Date */}
        {completionDate() && (
          <div className="bg-primary-foreground/10 rounded-xl p-4 flex items-start gap-3">
            <Calendar className="h-5 w-5 mt-0.5 text-primary-foreground/70" />
            <div>
              <p className="text-sm text-primary-foreground/70 font-body">Expected Completion</p>
              <p className="font-display text-lg font-semibold">{completionDate()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
