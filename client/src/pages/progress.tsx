import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightChart } from '@/components/charts/weight-chart';
import { WorkoutFrequencyChart } from '@/components/charts/workout-frequency-chart';
import { Trophy, Flame, Target } from 'lucide-react';
import type { ChartDataPoint, WorkoutTypeCount } from '@/lib/types';

export function ProgressPage() {
  const { user } = useAuth();

  const { weightData, workoutTypeData, achievements } = useMemo(() => {
    if (!user) return { weightData: [], workoutTypeData: [], achievements: [] };

    const userData = storage.getUserData(user.id);
    
    // Mock weight data (in a real app, this would come from user weight entries)
    const weightData: ChartDataPoint[] = [
      { label: 'Jan', value: 78 },
      { label: 'Feb', value: 76.5 },
      { label: 'Mar', value: 75.8 },
      { label: 'Apr', value: 74.2 },
      { label: 'May', value: 73.5 },
      { label: 'Jun', value: 72.8 },
    ];

    // Calculate workout type frequency
    const workoutCounts = userData.workouts.reduce((acc, workout) => {
      acc[workout.type] = (acc[workout.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const workoutTypeData: WorkoutTypeCount[] = Object.entries(workoutCounts).map(([type, count], index) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      color: getWorkoutTypeColor(index),
    }));

    // Calculate achievements
    const totalWorkouts = userData.workouts.length;
    const uniqueWorkoutDays = new Set(
      userData.workouts.map(w => new Date(w.date).toDateString())
    ).size;

    const achievements = [
      {
        title: '7-Day Streak',
        description: 'Worked out 7 days in a row',
        icon: Flame,
        achieved: uniqueWorkoutDays >= 7,
        color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
      },
      {
        title: 'First Workout',
        description: 'Completed your first workout',
        icon: Target,
        achieved: totalWorkouts >= 1,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
      },
      {
        title: 'Consistency King',
        description: 'Complete 20 workouts',
        icon: Trophy,
        achieved: totalWorkouts >= 20,
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
      },
    ];

    return { weightData, workoutTypeData, achievements };
  }, [user]);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-muted-foreground">Track your fitness journey and achievements</p>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart data={weightData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {workoutTypeData.length > 0 ? (
              <WorkoutFrequencyChart data={workoutTypeData} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start working out to see your exercise distribution!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.title}
                  className={`border rounded-lg p-6 text-center transition-all ${
                    achievement.achieved 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 opacity-50 dark:border-gray-700'
                  }`}
                >
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    achievement.achieved ? achievement.color : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h4 className={`font-semibold ${achievement.achieved ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  {achievement.achieved && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓ Achieved
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getWorkoutTypeColor(index: number): string {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  return colors[index % colors.length];
}
