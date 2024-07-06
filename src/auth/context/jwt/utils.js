import axios, { endpoints } from 'src/utils/axios';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------------------------

function jwtDecode(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp, logout) => {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  const expiredTimer = setTimeout(
    () => {
      alert('Token expired');

      sessionStorage.removeItem('accessToken');

      logout();
    },
    1000 * 60 * 2
  );

  return () => clearTimeout(expiredTimer);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken, logout, refreshToken) => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);

    if (refreshToken) {
      const expires = new Date();
      expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
      document.cookie = `refreshToken=${refreshToken}; path=/; SameSite=Strict; expires=${expires.toUTCString()}`;
    }
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
    const clearTimer = tokenExpired(exp, logout);
    return clearTimer;
  } else {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    delete axios.defaults.headers.common.Authorization;
  }
};

// a function that simulates refresh token generation, normally this would be done on the server.
// The basic flow is for server to send an access token with a short expiration time and a refresh token with a long expiration time.
// and client stores the refresh token in a secure place (like httpOnly cookie) and the access token in session storage.
export const generateRefreshToken = () => {
  return uuidv4();
};

const getRefreshTokenFromCookie = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; refreshToken=`);
  const token = parts.length === 2 ? parts.pop().split(';').shift() : null;
  return token;
};

export const getRefreshToken = async () => {
  const accessToken = sessionStorage.getItem('accessToken');
  try {
    const response = await axios.post(
      endpoints.token.refresh,
      {
        refreshToken: accessToken,
      },
      { skipAuthRefresh: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
