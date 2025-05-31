import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MealModal } from '@/components/modals/meal-modal';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Apple } from 'lucide-react';
import type { Meal, InsertMeal } from '@shared/schema';
import type { NutritionSummary } from '@/lib/types';

export function NutritionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { todayMeals, nutritionSummary } = useMemo(() => {
    if (!user) return { todayMeals: [], nutritionSummary: null };

    const userData = storage.getUserData(user.id);
    const today = new Date().toDateString();
    
    const todayMeals = userData.meals
      .filter(meal => new Date(meal.date).toDateString() === today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate nutrition summary
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFat = todayMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

    const nutritionSummary: NutritionSummary = {
      calories: { current: totalCalories, target: 2200 },
      protein: { current: totalProtein, target: 120 },
      carbs: { current: totalCarbs, target: 250 },
      fat: { current: totalFat, target: 80 },
    };

    return { todayMeals, nutritionSummary };
  }, [user]);

  const handleAddMeal = (mealData: InsertMeal) => {
    if (!user) return;

    const newMeal: Meal = {
      ...mealData,
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString(),
    };

    const userData = storage.getUserData(user.id);
    userData.meals.unshift(newMeal);
    storage.saveUserData(user.id, userData);
    
    // Force component re-render
    window.location.reload();
  };

  const handleDeleteMeal = (mealId: string) => {
    if (!user) return;

    const userData = storage.getUserData(user.id);
    userData.meals = userData.meals.filter(m => m.id !== mealId);
    storage.saveUserData(user.id, userData);
    
    toast({
      title: 'Meal deleted',
      description: 'The meal has been removed from your log.',
    });
    
    // Force component re-render
    window.location.reload();
  };

  const mealsByType = useMemo(() => {
    const grouped = todayMeals.reduce((acc, meal) => {
      if (!acc[meal.type]) acc[meal.type] = [];
      acc[meal.type].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);

    return grouped;
  }, [todayMeals]);

  if (!nutritionSummary) return null;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nutrition</h1>
          <p className="text-muted-foreground">Track your meals and calories</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90">
          <Plus className="h-4 w-4" />
          <span>Add Meal</span>
        </Button>
      </div>

      {/* Daily Nutrition Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-2">Calories</h4>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-2xl font-bold">{nutritionSummary.calories.current}</span>
              <span className="text-muted-foreground">/ {nutritionSummary.calories.target}</span>
            </div>
            <Progress 
              value={(nutritionSummary.calories.current / nutritionSummary.calories.target) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-2">Protein</h4>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-2xl font-bold">{nutritionSummary.protein.current}g</span>
              <span className="text-muted-foreground">/ {nutritionSummary.protein.target}g</span>
            </div>
            <Progress 
              value={(nutritionSummary.protein.current / nutritionSummary.protein.target) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-2">Carbs</h4>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-2xl font-bold">{nutritionSummary.carbs.current}g</span>
              <span className="text-muted-foreground">/ {nutritionSummary.carbs.target}g</span>
            </div>
            <Progress 
              value={(nutritionSummary.carbs.current / nutritionSummary.carbs.target) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-2">Fat</h4>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-2xl font-bold">{nutritionSummary.fat.current}g</span>
              <span className="text-muted-foreground">/ {nutritionSummary.fat.target}g</span>
            </div>
            <Progress 
              value={(nutritionSummary.fat.current / nutritionSummary.fat.target) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Meal Log */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {todayMeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No meals logged today</p>
              <p>Start tracking your nutrition by adding your first meal!</p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-4 bg-secondary hover:bg-secondary/90">
                Add Your First Meal
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(mealsByType).map(([type, meals]) => (
                <div key={type} className="border-b border-gray-200 pb-4 last:border-b-0 dark:border-gray-700">
                  <h4 className="font-semibold mb-3 capitalize text-lg">
                    {type} ({meals.reduce((sum, meal) => sum + meal.calories, 0)} cal)
                  </h4>
                  <div className="space-y-2">
                    {meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                      >
                        <div>
                          <p className="font-medium">{meal.food}</p>
                          <p className="text-sm text-muted-foreground">
                            {meal.calories} cal • {meal.protein || 0}g protein
                            {meal.carbs && ` • ${meal.carbs}g carbs`}
                            {meal.fat && ` • ${meal.fat}g fat`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMeal}
      />
    </div>
  );
}
