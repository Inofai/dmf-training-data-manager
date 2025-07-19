
export interface JwtConfig {
  id: string;
  timeout_minutes: number;
  refresh_threshold_minutes: number;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}
