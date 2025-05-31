import { useAuth } from '@/hooks/use-auth.tsx';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
          </Button>
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback className="bg-primary text-white">
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-700 font-medium dark:text-gray-200">
              {user?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
