export type SpaceType = 'meeting_room' | 'fixed_desk' | 'flex_desk';

export interface Space {
  id: number;
  name: string;
  type: SpaceType;
  capacity: number;
  is_active: boolean;
}

export interface SpacePayload {
  name: string;
  type: SpaceType;
  capacity: number;
  is_active: boolean;
}

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  meeting_room: 'Sala de reuniones',
  fixed_desk: 'Puesto fijo',
  flex_desk: 'Puesto flex',
};
