import axios from 'axios';

import { HOST_API } from 'src/config-global';
import { TEST_API } from 'src/config-global';
import { getRefreshToken, setSession } from 'src/auth/context/jwt/utils';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: TEST_API, withCredentials: true });

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response.status === 401 && !originalRequest._retry) ||
      (error.response.status === 403 && !originalRequest._retry)
    ) {
      console.log('axios trying to refresh token');
      originalRequest._retry = true;
      try {
        const { accessToken } = await getRefreshToken();
        setSession(accessToken);

        // Update the Authorization header with the new token
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/local',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  figures: {
    list: '/api/figures',
  },
  token: {
    refresh: '/api/token/refresh',
  },
};
