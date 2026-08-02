import { Space } from './space.model';
import { User } from './user.model';

export type BookingStatus = 'confirmed' | 'cancelled';

/**
 * Matches the real koworkia-api response. Note there is no `/availability`
 * endpoint and `GET /bookings` doesn't eager-load `user`/`space` — those two
 * fields are only ever populated by the (still hypothetical) `/dashboard`
 * endpoint, never by the real bookings list.
 */
export interface Booking {
  id: number;
  user_id: number;
  space_id: number;
  start_date_time: string;
  end_date_time: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  user?: User;
  space?: Space;
}

/**
 * The API now books on behalf of another platform user instead of always
 * defaulting to the authenticated caller: send exactly one of `user_id` or
 * `email` (never both), and it resolves the booking's owner from that.
 */
export interface CreateBookingPayload {
  space_id: number;
  status: BookingStatus;
  start_date_time: string;
  end_date_time: string;
  user_id?: number;
  email?: string;
}

export interface UpdateBookingPayload {
  status?: BookingStatus;
  start_date_time?: string;
  end_date_time?: string;
}

export interface DashboardSummary {
  today_bookings: number;
  occupancy_pct: number;
  active_members: number;
  upcoming: Booking[];
}
