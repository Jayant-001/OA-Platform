export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  organization?: string;
  college?: string;
  batch?: number;
  branch?: string;
}


export interface UserDetails extends User {
  college: string;
  batch: number;
  branch: string;
}