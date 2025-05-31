import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ActivityChart } from '@/components/charts/activity-chart';
import { Footprints, Flame, Clock, Droplets } from 'lucide-react';
import type { DashboardStats, ActivityData, GoalProgress, WeeklyActivityData } from '@/lib/types';

export function DashboardPage() {
  const { user } = useAuth();

  const { stats, recentActivities, goalProgress, weeklyData } = useMemo(() => {
    if (!user) return { stats: null, recentActivities: [], goalProgress: [], weeklyData: [] };

    const userData = storage.getUserData(user.id);
    const today = new Date().toDateString();
    
    // Calculate today's stats
    const todayWorkouts = userData.workouts.filter(w => 
      new Date(w.date).toDateString() === today
    );
    
    const todayMeals = userData.meals.filter(m => 
      new Date(m.date).toDateString() === today
    );

    const totalCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalWorkoutTime = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCaloriesConsumed = todayMeals.reduce((sum, m) => sum + m.calories, 0);

    const stats: DashboardStats = {
      steps: 8247, // Mock data for steps (would come from wearable integration)
      calories: totalCaloriesBurned,
      workoutTime: totalWorkoutTime,
      water: 1.8, // Mock water intake
    };

    // Recent activities
    const recentActivities: ActivityData[] = userData.workouts
      .slice(0, 3)
      .map(workout => ({
        name: workout.type.charAt(0).toUpperCase() + workout.type.slice(1),
        details: `${workout.duration} min • ${workout.calories || 0} cal`,
        time: formatTimeAgo(workout.date),
        icon: getWorkoutIcon(workout.type),
        color: getWorkoutColor(workout.type),
      }));

    // Goal progress (mock data)
    const goalProgress: GoalProgress[] = [
      {
        name: 'Weekly Workouts',
        current: userData.workouts.filter(w => 
          new Date(w.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        target: 5,
        percentage: 0,
        color: 'hsl(var(--primary))',
      },
      {
        name: 'Weight Loss',
        current: 3.2,
        target: 5,
        percentage: 0,
        color: 'hsl(var(--secondary))',
      },
      {
        name: 'Daily Steps',
        current: stats.steps,
        target: 10000,
        percentage: 0,
        color: 'hsl(var(--accent))',
      },
    ].map(goal => ({
      ...goal,
      percentage: Math.round((goal.current / goal.target) * 100),
    }));

    // Weekly activity data (mock)
    const weeklyData: WeeklyActivityData[] = [
      { day: 'Mon', calories: 320 },
      { day: 'Tue', calories: 450 },
      { day: 'Wed', calories: 380 },
      { day: 'Thu', calories: 520 },
      { day: 'Fri', calories: 490 },
      { day: 'Sat', calories: 380 },
      { day: 'Sun', calories: totalCaloriesBurned || 420 },
    ];

    return { stats, recentActivities, goalProgress, weeklyData };
  }, [user]);

  if (!stats) return null;

  return (
    <div className="p-6 space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Steps</p>
                <p className="text-2xl font-bold">{stats.steps.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% from yesterday</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-900">
                <Footprints className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calories Burned</p>
                <p className="text-2xl font-bold">{stats.calories}</p>
                <p className="text-sm text-green-600">Goal: 600 cal</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center dark:bg-red-900">
                <Flame className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workout Time</p>
                <p className="text-2xl font-bold">{stats.workoutTime}m</p>
                <p className="text-sm text-green-600">
                  {stats.workoutTime > 0 ? 'Great job!' : 'Start your first workout!'}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center dark:bg-green-900">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Water Intake</p>
                <p className="text-2xl font-bold">{stats.water}L</p>
                <p className="text-sm text-blue-600">Goal: 2.5L</p>
              </div>
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center dark:bg-cyan-900">
                <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart data={weeklyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {goalProgress.map((goal) => (
              <div key={goal.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{goal.name}</span>
                  <span className="font-medium">{goal.current}/{goal.target}</span>
                </div>
                <Progress value={goal.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            {recentActivities.length > 0 && (
              <button className="text-primary hover:underline text-sm">
                View All
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities yet. Start your first workout to see your progress here!
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${activity.color}`}>
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
}

function getWorkoutIcon(type: string): string {
  const icons: Record<string, string> = {
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊',
    weightlifting: '🏋️',
    yoga: '🧘',
    cardio: '❤️',
    strength: '💪',
    flexibility: '🤸',
    sports: '⚽',
  };
  return icons[type] || '💪';
}

function getWorkoutColor(type: string): string {
  const colors: Record<string, string> = {
    running: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    cycling: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    swimming: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
    weightlifting: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    yoga: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
    cardio: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    strength: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    flexibility: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    sports: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
}
