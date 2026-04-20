export type BaseResponse<T = object> = T & {
  message: string;
};

export interface ApiError {
  error?: {
    message?: string;
  };
  message?: string;
}
