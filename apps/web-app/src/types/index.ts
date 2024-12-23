export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

// export interface Contest {
//   id: string;
//   title: string;
//   description: string;
//   startTime: Date;
//   duration: number;
//   rules: string[];
//   problemCount: number;
//   status: 'upcoming' | 'live' | 'past';
// }

export interface Contest {
  id: string; 
  title: string; // Contest title (required field)
  description: string; // Contest description (optional)
  duration: number; // Duration in minutes (required field)
  startTime: string; // Start time of the contest (ISO string or Date object)
  contestCode: string; // Unique contest code (required field)
  joinDuration?: number; // Duration (in minutes) to join after the contest starts (optional)
  strictTime: boolean; // Boolean indicating whether strict time rules apply
  createdBy: string; // The ID of the admin who created the contest (foreign key reference)
  createdAt: string; // Timestamp when the contest was created (ISO string)
  updatedAt: string; // Timestamp when the contest was last updated (ISO string)
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  description: string;
}
