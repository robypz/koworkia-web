export interface ApiResource<T> {
  data: T;
}

export interface ApiCollection<T> {
  data: T[];
}

/**
 * Shape of a Laravel `paginate()` response. Unlike single-resource endpoints,
 * the paginated list endpoints (spaces, plans, bookings, companies) return
 * this object directly at the top level — not wrapped in an outer `data` key.
 * Verified against the running koworkia-api instance (its OpenAPI doc claims
 * an extra wrapper that doesn't match reality).
 */
export interface LaravelPage<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
