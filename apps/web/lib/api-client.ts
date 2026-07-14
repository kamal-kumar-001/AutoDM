import { ApiResponse, ApiErrorResponse } from '@autodm/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      const errorData = result as ApiErrorResponse;
      throw new ApiError(
        errorData.error?.message || 'An unexpected error occurred',
        errorData.error?.code || 'SERVER_ERROR',
        errorData.error?.details,
      );
    }

    const successData = result as ApiResponse<T>;
    return successData.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'A connection error occurred',
      'CONNECTION_ERROR',
    );
  }
}
