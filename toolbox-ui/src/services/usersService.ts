import axiosClient from '../api/axiosClient';

export interface AppUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

export const usersService = {
  getAll: (): Promise<AppUser[]> =>
    axiosClient.get('/users').then(r => r.data),
};
