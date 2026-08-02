export type SpaceType = 'meeting_room' | 'fixed_desk' | 'flex_desk';

export interface Space {
  id: number;
  company_id: number;
  name: string;
  type: SpaceType;
  capacity: number;
  is_active: boolean;
}

/**
 * `is_active` is intentionally absent: the real API doesn't accept it on
 * create/update (only `name`, `type`, `capacity`, and `company_id` for root
 * users — non-root users get their own company_id injected server-side).
 */
export interface SpacePayload {
  name: string;
  type: SpaceType;
  capacity: number;
  company_id?: number | null;
}

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  meeting_room: 'Sala de reuniones',
  fixed_desk: 'Puesto fijo',
  flex_desk: 'Puesto flex',
};
