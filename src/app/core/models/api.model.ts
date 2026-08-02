export interface ApiResource<T> {
  data: T;
}

export interface ApiCollection<T> {
  data: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
