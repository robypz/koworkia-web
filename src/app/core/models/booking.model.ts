import { Space } from './space.model';
import { User } from './user.model';

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: number;
  user_id: number;
  space_id: number;
  date: string;
  start_hour: number;
  status: BookingStatus;
  user?: User;
  space?: Space;
}

export interface CreateBookingPayload {
  space_id: number;
  date: string;
  start_hour: number;
}

export interface AvailabilitySlot {
  start_hour: number;
  status: 'free' | 'occupied';
  booking?: Booking;
}

export interface DashboardSummary {
  today_bookings: number;
  occupancy_pct: number;
  active_members: number;
  upcoming: Booking[];
}
