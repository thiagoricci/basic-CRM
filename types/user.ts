export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'rep';
  avatar?: string | null;
  bio?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
