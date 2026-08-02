import { Plan } from './plan.model';

export type RoleName = 'root' | 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface Role {
  id: number;
  name: RoleName;
  guard_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  phone: string | null;
  plan_id: number | null;
  plan?: Plan | null;
  status: UserStatus;
}

export interface CreateMemberPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  plan_id: number | null;
}

export interface UpdateMemberPayload {
  name: string;
  email: string;
  phone?: string | null;
  plan_id: number | null;
}
