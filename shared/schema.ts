import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  goal: z.enum(["weight_loss", "muscle_gain", "maintain_weight", "improve_endurance"]).optional(),
  createdAt: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Workout Schema
export const workoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["running", "cycling", "swimming", "weightlifting", "yoga", "cardio", "strength", "flexibility", "sports"]),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  calories: z.number().min(0).optional(),
  notes: z.string().optional(),
  date: z.string(),
});

export const insertWorkoutSchema = workoutSchema.omit({ id: true, date: true });

// Meal Schema
export const mealSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  food: z.string().min(1, "Food item is required"),
  calories: z.number().min(0, "Calories must be positive"),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  date: z.string(),
});

export const insertMealSchema = mealSchema.omit({ id: true, date: true });

// Goal Schema
export const goalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["weight", "steps", "calories", "workouts"]),
  target: z.number().min(0),
  current: z.number().min(0).default(0),
  period: z.enum(["daily", "weekly", "monthly"]),
  startDate: z.string(),
  endDate: z.string(),
});

export const insertGoalSchema = goalSchema.omit({ id: true, current: true });

// Weight Entry Schema
export const weightEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  weight: z.number().min(0),
  date: z.string(),
});

export const insertWeightEntrySchema = weightEntrySchema.omit({ id: true });

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Meal = z.infer<typeof mealSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type WeightEntry = z.infer<typeof weightEntrySchema>;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
