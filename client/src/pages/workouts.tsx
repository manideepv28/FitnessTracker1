import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutModal } from '@/components/modals/workout-modal';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Dumbbell, Heart, Bike, Trophy } from 'lucide-react';
import type { Workout, InsertWorkout } from '@shared/schema';

export function WorkoutsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { workouts, refreshWorkouts } = useMemo(() => {
    if (!user) return { workouts: [], refreshWorkouts: () => {} };

    const userData = storage.getUserData(user.id);
    const refreshWorkouts = () => {
      // Force re-render by creating new object reference
      return userData;
    };
    
    return { 
      workouts: userData.workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      refreshWorkouts
    };
  }, [user]);

  const handleAddWorkout = (workoutData: InsertWorkout) => {
    if (!user) return;

    const newWorkout: Workout = {
      ...workoutData,
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString(),
    };

    const userData = storage.getUserData(user.id);
    userData.workouts.unshift(newWorkout);
    storage.saveUserData(user.id, userData);
    
    // Force component re-render
    window.location.reload();
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (!user) return;

    const userData = storage.getUserData(user.id);
    userData.workouts = userData.workouts.filter(w => w.id !== workoutId);
    storage.saveUserData(user.id, userData);
    
    toast({
      title: 'Workout deleted',
      description: 'The workout has been removed from your log.',
    });
    
    // Force component re-render
    window.location.reload();
  };

  const workoutCategories = [
    {
      title: 'Cardio',
      description: 'Running, cycling, swimming',
      icon: Heart,
      color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    },
    {
      title: 'Strength',
      description: 'Weight training, bodyweight',
      icon: Dumbbell,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    },
    {
      title: 'Flexibility',
      description: 'Yoga, stretching, pilates',
      icon: Heart,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    },
    {
      title: 'Sports',
      description: 'Tennis, basketball, soccer',
      icon: Trophy,
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">Track and log your fitness activities</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Workout</span>
        </Button>
      </div>

      {/* Workout Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {workoutCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${category.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold">{category.title}</h4>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {workouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No workouts logged yet</p>
              <p>Start your fitness journey by adding your first workout!</p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                Add Your First Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getWorkoutColor(workout.type)}`}>
                      <span className="text-lg">{getWorkoutIcon(workout.type)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">{workout.type.replace('_', ' ')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {workout.duration} min • {workout.calories || 0} cal
                      </p>
                      {workout.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{workout.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(workout.date)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddWorkout}
      />
    </div>
  );
}

function formatDate(dateString: string): string {
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
