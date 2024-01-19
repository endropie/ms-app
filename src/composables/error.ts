import { AxiosError } from 'axios';
import { Notify, QNotifyCreateOptions } from 'quasar';
import { ref } from 'vue';

export type ResponseError = AxiosError<{ message?: string }>;

export const onErrorNotify =
  (cb?: { (error: ResponseError): QNotifyCreateOptions | string | void }) =>
  (error: ResponseError) => {
    let data: QNotifyCreateOptions = {
      type: 'negative',
      message: error.response ? 'RESPONSE ERROR' : 'NETWORK ERROR',
      caption:
        error.response?.data.message ||
        error.response?.statusText ||
        'Please contact administrator !!',
    };
    if (cb) {
      const res = cb(error);
      if (typeof res === 'string') data.caption = res;
      if (typeof res === 'object') data = { ...data, ...res };
    }

    Notify.create(data);
  };

export default function useError() {
  // const $q = useQuasar();

  const errorsData = ref<Record<string, string[]>>({});
  // const errors = utils.useError();

  const errors = ref({
    // data: {},
    all: () => {
      return errorsData.value;
    },
    get: (property: string) => {
      return errorsData.value[property] as string[] | undefined;
    },
    set: (property: string | Record<string, string[]>, values?: string[]) => {
      if (typeof property === 'string') {
        errorsData.value[property] = values || [];
      } else {
        errorsData.value = property;
      }
    },
    reset: () => {
      errorsData.value = {};
    },
    message: (property: string, name: string | undefined = undefined) => {
      return errorsData.value[property] && errorsData.value[property]
        ? name
          ? errorsData.value[property][0].replace(property, name)
          : errorsData.value[property][0]
        : undefined;
    },
    has: (property: string) => {
      return Boolean(errorsData.value[property] && errorsData.value[property]);
    },
  });

  const setErrorResponse = (error: ResponseError) => {
    if (error.response && error.response.status === 422) {
      const responseData = error.response.data as Record<
        string,
        string[] | string
      >;

      Object.keys(responseData).forEach((x) => {
        if (typeof responseData[x] === 'string') {
          errors.value.set(x, [responseData[x] as string]);
        } else {
          errors.value.set(x, responseData[x] as string[]);
        }
      });
    }
  };

  return {
    errors,
    setErrorResponse,
  };
}
