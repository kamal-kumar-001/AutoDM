export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorDetail {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  timestamp: string;
}

export interface UserDto {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
}
