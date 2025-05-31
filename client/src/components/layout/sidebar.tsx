import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth.tsx';
import { 
  BarChart3, 
  Dumbbell, 
  Apple, 
  Trophy, 
  User, 
  LogOut,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/workouts', label: 'Workouts', icon: Dumbbell },
  { path: '/nutrition', label: 'Nutrition', icon: Apple },
  { path: '/progress', label: 'Progress', icon: Trophy },
  { path: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 dark:bg-gray-900">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">FitTracker</h1>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
