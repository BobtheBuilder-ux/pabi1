import { REQUEST_TIMEOUT_DURATION, TIMEOUT_ERROR_MESSAGE } from '../constants';
import axios, { AxiosRequestConfig } from 'axios';
import { tokenValidation } from '../utils/token.util';
import { ENV_VALUES } from '../../config/env.config';

const options: AxiosRequestConfig = {
  baseURL: ENV_VALUES.BASE_URL,
  headers: {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: REQUEST_TIMEOUT_DURATION,
  timeoutErrorMessage: TIMEOUT_ERROR_MESSAGE,
  withCredentials: true, // Enable credentials for CORS
};

const axiosInstance = axios.create(options);

// Add a request interceptor to add Authorization
axiosInstance.interceptors.request.use(async (request) => {
  const { accessToken, isTokenValid } = await tokenValidation();

  if (isTokenValid) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }

  return request;
});

export default axiosInstance;
