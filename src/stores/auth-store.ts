/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { Cookies, Notify } from 'quasar';
import { api } from 'src/boot/axios';
import {
  AuthHeaderRequest,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthUserData,
} from 'src/types/auth';

const PREFIX = '/auth';

const REGISTER_ROUTE = `${PREFIX}/register`;
const VERIFICATION_ROUTE = `${PREFIX}/verify`;
const LOGIN_ROUTE = `${PREFIX}/login`;
const FETCH_USER_ROUTE = `${PREFIX}/user`;
const PASSWORD_CHANGE_ROUTE = `${PREFIX}/password/change`;
const PASSWORD_FORGOT_ROUTE = `${PREFIX}/password/forgot`;
const PASSWORD_RESET_ROUTE = `${PREFIX}/password/reset`;

interface AppTenantData {
  id: string;
  api_url: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUserData | null,
    tenant: null as AppTenantData | null,
  }),
  getters: {
    LOGGEDIN(state) {
      return Boolean(state.user);
    },

    CHECK: (state) => {
      // roles: role of abilities. superadmin: role of all access.
      return (roles: string | string[], superadmin = '*'): boolean => {
        if (typeof roles === 'string') roles = [roles];
        if (!roles.length) return true;
        const { user } = state;
        if (user) {
          const { ability } = user;

          if (superadmin && ability.find((x) => x === superadmin)) return true;

          return roles.some((x) => ability.includes(x));
        }
        return false;
      };
    },
  },
  actions: {
    setUser(user: AuthUserData) {
      this.user = {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        ability: user.ability,
      };
    },
    async fetch() {
      const token = Cookies.get('authorization_token');
      if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

      if (!api.defaults.headers.common.Authorization) {
        return new Promise((resolve, reject) => {
          reject({ response: { statusText: 'Unauthorized' } });
        });
      }

      try {
        const response = await api.get(FETCH_USER_ROUTE);
        this.setUser(response.data.data);
        return new Promise((resolve) => {
          resolve(undefined);
        });
      } catch (error) {
        if (process.env.DEV)
          console.error(
            '[APP] AUTH FETCH',
            (error as AxiosError).response || error
          );
        return new Promise((resolve, reject) => {
          reject(error as AxiosError);
        });
      }
    },

    login(data: AuthLoginRequest) {
      const promise = new Promise<void>((resolve, reject) => {
        api
          .post<AuthLoginResponse>(LOGIN_ROUTE, data)
          .then((response) => {
            const setup: AuthHeaderRequest = {
              token: response.data.access_token,
              /* eslint-disable  @typescript-eslint/no-unnecessary-type-assertion */
              remember: data.remember as boolean,
            };
            this.setHeader(setup);
            resolve();
          })
          .catch((e) => {
            const error = e as AxiosError<{
              message?: string;
              username?: string[];
              password?: string[];
            }>;
            let caption = 'Network Error';
            if (error.response) {
              console.error('[APP] LOGIN ERROR', error.response);
              caption =
                error.response.data.username?.[0] ||
                error.response.data.password?.[0] ||
                error.response.data.message ||
                error.message;
            }

            Notify.create({
              type: 'negative',
              message: 'LOGIN FAILED!',
              caption,
            });
            reject(error);
          });
      });
      return promise;
    },

    passwordChange(data: unknown) {
      return api.post(PASSWORD_CHANGE_ROUTE, data);
    },

    setHeader(data: AuthHeaderRequest) {
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      if (data.remember) {
        Cookies.set('authorization_token', data.token, {
          expires: 365,
        });
      } else {
        Cookies.set('authorization_token', data.token);
      }
    },

    logout() {
      return new Promise((resolve) => {
        delete api.defaults.headers.common.Authorization;
        Cookies.remove('authorization_token');
        this.user = null;
        resolve(undefined);
      });
    },

    register(data: Record<string, unknown>) {
      return api.post(REGISTER_ROUTE, data);
    },

    verify(token: string) {
      return api.get(`${VERIFICATION_ROUTE}?token=${token}`);
    },

    passwordForgot(data: Record<string, unknown>) {
      return api.post(PASSWORD_FORGOT_ROUTE, data);
    },

    passwordReset({ token, data }: { token: string; data: unknown }) {
      return api.post(`${PASSWORD_RESET_ROUTE}?token=${token}`, data);
    },
  },
});
