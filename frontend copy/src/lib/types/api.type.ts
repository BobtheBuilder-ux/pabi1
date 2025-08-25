import { AxiosError, AxiosResponse } from "axios";

export type API_SuccessResponse<T> = Promise<
  AxiosResponse<API_SuccessPayload<T>>
>;

export type API_SuccessPayload<T> = {
  payload: any;
  message: string;
  data: T;
  success: boolean;
  timestamp: string;
};

export type API_ErrorResponse = Promise<AxiosError<API_ErrorPayload>>;

export type API_ErrorPayload = {
  path: string;
  error: string;
  message: string;
  timestamp: string;
  statusCode: number;
};
