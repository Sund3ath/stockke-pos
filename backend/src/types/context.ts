import { DataSource } from 'typeorm';
import { UserRole } from '../entity/User';

export interface Context {
  dataSource: DataSource;
  isPublicOperation: boolean;
  user?: {
    id: number;
    username: string;
    role: UserRole;
    parentUser: {
      id: number;
      username: string;
      role: UserRole;
    } | null;
  } | null;
} 