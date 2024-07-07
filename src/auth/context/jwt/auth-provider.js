'use client';

import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIAL':
      return {
        loading: false,
        user: action.payload.user,
      };
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
      };
    case 'REGISTER':
      return {
        ...state,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';
const USER_KEY = 'user';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    sessionStorage.removeItem(USER_KEY);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken, logout);

        const user = JSON.parse(sessionStorage.getItem(USER_KEY));

        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              ...user,
              accessToken,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, [logout]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(
    async (identifier, password) => {
      const data = {
        identifier,
        password,
      };

      const response = await axios.post(endpoints.auth.login, data);

      const { jwt: accessToken, user } = response.data;

      const clearTimer = setSession(accessToken, logout);

      sessionStorage.setItem(USER_KEY, JSON.stringify(user));

      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...user,
            accessToken,
          },
        },
      });

      return clearTimer;
    },
    [logout]
  );

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    const data = {
      email,
      password,
      firstName,
      lastName,
    };

    const response = await axios.post(endpoints.auth.register, data);

    const { accessToken, user } = response.data;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
