export enum UserRole {
  CLIENT = 'CLIENT',
  SALES_AGENT = 'SALES_AGENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'agent' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'createdAt' | 'updatedAt'> {}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  country?: string;
  phone?: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
} 