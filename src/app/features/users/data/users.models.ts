import { Page } from '../../../shared/models/pagination.model';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export type UserPage = Page<User>;

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;   
  roles: string[];
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  roles: string[];
}

export interface ChangePasswordRequest {
  password: string;
}
