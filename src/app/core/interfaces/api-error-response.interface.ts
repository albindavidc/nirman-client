export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[] | null;
  timestamp: string;
  path: string;
  errorCode?: string;
}
