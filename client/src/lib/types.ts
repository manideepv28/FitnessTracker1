export interface DashboardStats {
  steps: number;
  calories: number;
  workoutTime: number;
  water: number;
}

export interface ActivityData {
  name: string;
  details: string;
  time: string;
  icon: string;
  color: string;
}

export interface NutritionSummary {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export interface GoalProgress {
  name: string;
  current: number;
  target: number;
  percentage: number;
  color: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface WeeklyActivityData {
  day: string;
  calories: number;
}

export interface WorkoutTypeCount {
  type: string;
  count: number;
  color: string;
}
