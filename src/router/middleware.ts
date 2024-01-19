import { AxiosError } from 'axios';
import { Loading, Notify, QSpinnerGrid } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
} from 'vue-router';
export interface MiddlewareProp {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
}
export interface MiddlewareRawInterface {
  auth?: boolean;
  call: (prop: MiddlewareProp) => RouteLocationRaw | undefined;
}
export const setMiddlewares = async (prop: MiddlewareProp) => {
  if (prop.to.meta?.guest) {
    prop.next();
    return;
  }
  const store = useAuthStore();
  const redirectLogin = () => {
    const query =
      prop.to.fullPath === '/' ? {} : { directed: prop.to.fullPath };
    prop.next({ path: '/authentication', query });
  };

  if (prop.to.matched.find((x) => x.meta.auth)) {
    if (!store.LOGGEDIN) {
      Loading.show({
        message: 'Authorization...',
        spinner: QSpinnerGrid,
        customClass: 'bg-white',
        messageColor: 'primary',
        spinnerColor: 'primary',
        backgroundColor: 'grey-3',
      });
      try {
        await store.fetch();
        if (!store.LOGGEDIN) {
          redirectLogin();
        }
      } catch (err) {
        const error = err as AxiosError;
        const caption = error.message || 'Authorization is required!';
        Notify.create({
          message: 'AUTHORIZATION FAILED',
          caption,
          type: 'negative',
        });
        if (
          error.response?.statusText === 'Unauthorized' ||
          error.response?.status === 401
        ) {
          redirectLogin();
        }
        return;
      } finally {
        setTimeout(() => Loading.hide(), 1000);
      }
    }
  }

  if (!prop.to.meta.middlewares) {
    prop.next();
    return;
  }

  const middlewares = prop.to.meta.middlewares as MiddlewareRawInterface[];

  const promises = middlewares.map((middleware) => middleware.call(prop)) as [];

  const redirect = (await Promise.all(promises)).find(
    (location) => location
  ) as unknown;

  if (redirect) {
    prop.next(redirect);
    return;
  }

  prop.next();
};

export const ability = (roles: string | string[]) => {
  const store = useAuthStore();

  const raw: MiddlewareRawInterface = {
    call: ({ from }) => {
      if (!store.CHECK(roles)) {
        return {
          path: '/error',
          query: {
            code: '403',
            message: 'Access forbidden!',
            directed: from.fullPath,
          },
        };
      }
      return undefined;
    },
  };

  return raw;
};
