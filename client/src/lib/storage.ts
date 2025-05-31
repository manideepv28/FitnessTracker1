import type { User, Workout, Meal, Goal, WeightEntry } from '@shared/schema';

const STORAGE_KEYS = {
  USERS: 'fittracker_users',
  CURRENT_USER: 'fittracker_current_user',
  USER_DATA: 'fittracker_user_data_',
} as const;

export interface UserData {
  workouts: Workout[];
  meals: Meal[];
  goals: Goal[];
  weightEntries: WeightEntry[];
  lastUpdated: string;
}

class LocalStorage {
  // User management
  getUsers(): User[] {
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // User data management
  getUserData(userId: string): UserData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA + userId);
      return data ? JSON.parse(data) : {
        workouts: [],
        meals: [],
        goals: [],
        weightEntries: [],
        lastUpdated: new Date().toISOString(),
      };
    } catch {
      return {
        workouts: [],
        meals: [],
        goals: [],
        weightEntries: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  saveUserData(userId: string, data: UserData): void {
    const updatedData = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_DATA + userId, JSON.stringify(updatedData));
  }

  // Export/Import functionality
  exportAllData(): string {
    const users = this.getUsers();
    const currentUser = this.getCurrentUser();
    const allUserData: Record<string, UserData> = {};

    users.forEach(user => {
      allUserData[user.id] = this.getUserData(user.id);
    });

    return JSON.stringify({
      users,
      currentUser,
      userData: allUserData,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key === STORAGE_KEYS.USER_DATA) {
        // Clear all user data keys
        const users = this.getUsers();
        users.forEach(user => {
          localStorage.removeItem(key + user.id);
        });
      } else {
        localStorage.removeItem(key);
      }
    });
  }
}

export const storage = new LocalStorage();
