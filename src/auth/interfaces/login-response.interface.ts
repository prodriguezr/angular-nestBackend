import { User } from '../entities';

export interface LoginResponse {
  user: User;
  token: string;
}
