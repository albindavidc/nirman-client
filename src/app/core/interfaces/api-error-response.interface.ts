/**
 * API Error Response Interface
 *
 * Mirrors the backend's ApiErrorResponse interface for type-safe error handling.
 * This interface represents the standardized error format returned by the NestJS backend.
 */
export interface ApiErrorResponse {
  /** HTTP status code */
  statusCode: number;

  /** Human-readable error message */
  message: string;

  /** Array of validation errors or detailed error messages */
  errors?: string[] | null;

  /** ISO timestamp when the error occurred */
  timestamp: string;

  /** API path that triggered the error */
  path: string;

  /** Optional error code (e.g., Prisma error codes like 'P2002') */
  errorCode?: string;
}
