import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';

/**
 * HTTP Error Interceptor
 *
 * Centralized error handling interceptor that:
 * - Catches all HTTP errors and displays user-friendly notifications
 * - Parses the backend's standardized ApiErrorResponse format
 * - Handles specific HTTP status codes appropriately
 * - Handles network errors (offline, timeout, connection refused)
 * - Re-throws errors so NgRx effects or components can handle them if needed
 *
 * Note: 401 errors are handled by auth.interceptor.ts, so we skip notifications for those
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip notification for 401 errors - handled by auth.interceptor.ts
      if (error.status === 401) {
        return throwError(() => error);
      }

      const errorMessage = getErrorMessage(error);
      notification.error(errorMessage);

      return throwError(() => error);
    }),
  );
};

/**
 * Extracts a user-friendly error message from the HTTP error response.
 *
 * @param error - The HttpErrorResponse from the failed request
 * @returns A human-readable error message
 */
function getErrorMessage(error: HttpErrorResponse): string {
  // Handle network errors (no internet, server unreachable)
  if (error.status === 0) {
    if (!navigator.onLine) {
      return 'No internet connection. Please check your network and try again.';
    }
    return 'Unable to connect to the server. Please try again later.';
  }

  // Try to parse the backend's ApiErrorResponse
  const apiError = error.error as ApiErrorResponse | null;

  // Handle validation errors (400, 422) with detailed field errors
  if (
    (error.status === 400 || error.status === 422) &&
    apiError?.errors?.length
  ) {
    // Return first validation error for concise notification
    return apiError.errors[0];
  }

  // Return backend message if available
  if (apiError?.message) {
    return apiError.message;
  }

  // Default messages based on HTTP status codes
  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. This resource may already exist.';
    case 422:
      return 'The data provided could not be processed.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'An unexpected server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
