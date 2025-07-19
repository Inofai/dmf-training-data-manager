
export type AppRole = 'admin' | 'user' | 'developer';

export interface RolePermission {
  id: string;
  role: AppRole;
  page_route: string;
  can_access: boolean;
  created_at: string | null;
  updated_at: string | null;
}
