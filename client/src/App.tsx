import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth.tsx";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import { WorkoutsPage } from "@/pages/workouts";
import { NutritionPage } from "@/pages/nutrition";
import { ProgressPage } from "@/pages/progress";
import { ProfilePage } from "@/pages/profile";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/workouts': return 'Workouts';
      case '/nutrition': return 'Nutrition';
      case '/progress': return 'Progress';
      case '/profile': return 'Profile';
      default: return 'FitTracker';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <Switch>
          <Route path="/">
            {() => {
              return (
                <>
                  <Header title={getPageTitle('/')} />
                  <DashboardPage />
                </>
              );
            }}
          </Route>
          <Route path="/workouts">
            {() => {
              return (
                <>
                  <Header title={getPageTitle('/workouts')} />
                  <WorkoutsPage />
                </>
              );
            }}
          </Route>
          <Route path="/nutrition">
            {() => {
              return (
                <>
                  <Header title={getPageTitle('/nutrition')} />
                  <NutritionPage />
                </>
              );
            }}
          </Route>
          <Route path="/progress">
            {() => {
              return (
                <>
                  <Header title={getPageTitle('/progress')} />
                  <ProgressPage />
                </>
              );
            }}
          </Route>
          <Route path="/profile">
            {() => {
              return (
                <>
                  <Header title={getPageTitle('/profile')} />
                  <ProfilePage />
                </>
              );
            }}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
