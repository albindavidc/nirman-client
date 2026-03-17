export type BaseResponse<T = {}> = T & {
  message: string;
};
