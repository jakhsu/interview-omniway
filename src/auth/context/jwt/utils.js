import axios, { endpoints } from 'src/utils/axios';

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

  const expiredTimer = setTimeout(async () => {
    alert('Token expired');
    // NOTE: I commented these two line out because now with refresh token strategy,
    // users can refresh their access token without having to log in again,
    // so loggging users out automatically is not necessary
    // sessionStorage.removeItem('accessToken');
    // logout();

    // NOTE: This is the logic to refresh token
    const { accessToken } = await getRefreshToken();
    setSession(accessToken);
  }, timeLeft);

  return () => clearTimeout(expiredTimer);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken, logout) => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
    const clearTimer = tokenExpired(exp, logout);
    return clearTimer;
  } else {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');

    delete axios.defaults.headers.common.Authorization;
  }
};

export const getRefreshToken = async () => {
  try {
    const response = await axios.post(endpoints.token.refresh, {
      withCredentials: true, // This ensures cookies are sent
    });
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
