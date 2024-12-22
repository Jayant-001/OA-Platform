export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  duration: number;
  rules: string[];
  problemCount: number;
  status: 'upcoming' | 'live' | 'past';
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  description: string;
}
