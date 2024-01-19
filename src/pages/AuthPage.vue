<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { Loading, getCssVar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import Logo from '../components/svg/logo.vue';
import Illustration from 'src/components/svg/illustration.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { AuthLoginRequest } from 'src/types/auth';
import useError, { onErrorNotify } from 'src/composables/error';

const REACTIVE = reactive({
  redirectURL: null as string | null,
});

export default defineComponent({
  name: 'LoginPage',
  components: { Logo, Illustration },
  setup() {
    // Declare imported functions and create some variable
    const primary = getCssVar('primary'); // '#33F'
    const authStore = useAuthStore();
    const $router = useRouter();
    const $route = useRoute();
    const isDisableSubmitted = ref<boolean>(false);

    const record = ref<AuthLoginRequest>({
      username: '',
      password: '',
      remember: false,
    });

    const { errors, setErrorResponse } = useError();

    if ($route.query.directed) {
      REACTIVE.redirectURL = String($route.query.directed);
    }

    // Create function submit form for login
    const onSubmit = () => {
      Loading.show(); // show loading component
      isDisableSubmitted.value = true;

      authStore
        .login(record.value)
        .then(() => {
          if (REACTIVE.redirectURL) {
            void $router.replace(REACTIVE.redirectURL);
            REACTIVE.redirectURL = null;
          } else {
            void $router.replace('/admin');
          }
        })
        .catch(onErrorNotify(setErrorResponse))
        .finally(() => {
          Loading.hide(); // hide loading component
          isDisableSubmitted.value = false;
        });
    };

    return {
      primary,
      record,
      isDisableSubmitted,
      errors,
      onSubmit,
    };
  },
});
</script>

<template>
  <q-page
    padding
    :class="$q.dark.isActive ? 'bg-dark-1' : 'bg-grey-3'"
    style="height: 100vh"
  >
    <div v-if="!$q.screen.lt.md" class="flex flex-row gap-2">
      <div
        :class="$q.dark.isActive ? 'bg-dark-1' : 'bg-grey-3'"
        class="flex-none"
        style="width: 55%"
      >
        <!-- Company Logo Image -->
        <Logo class="w-40 h-36 text-grey ml-3" :color="String(primary)" />

        <div>
          <Illustration :color="String(primary)" />
        </div>
      </div>

      <div class="flex-grow">
        <div>
          <q-form @submit="onSubmit()" class="flex justify-center">
            <q-card
              class="mt-28 rounded-md shadow-sm w-8/12"
              :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
              style="height: 550px"
              flat
            >
              <q-card-section class="mb-10">
                <div class="full-width q-pa-lg">
                  <div
                    class="text-h4 text-center text-weight-bold q-my-md"
                    :class="$q.dark.isActive ? 'text-white' : 'text-primary'"
                  >
                    Sign In
                  </div>

                  <div
                    class="text-caption text-center no-padding"
                    :class="$q.dark.isActive ? 'text-white' : 'text-primary'"
                  >
                    Enter your credentials to access your account.
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <q-input
                  type="text"
                  label="Username"
                  v-model="record.username"
                  @update:model-value="() => errors.reset()"
                  :error="errors.has('username')"
                  :error-message="String(errors.get('username')) || ''"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input
                  type="password"
                  label="Password"
                  v-model="record.password"
                  @update:model-value="() => errors.reset()"
                  :error="errors.has('password')"
                  :error-message="String(errors.get('password'))"
                >
                  <template v-slot:prepend>
                    <q-icon name="vpn_key" />
                  </template>
                </q-input>

                <q-checkbox v-model="record.remember" label="Remember me" />

                <q-btn
                  color="primary"
                  label="Submit"
                  class="full-width mt-14"
                  type="submit"
                  :disable="isDisableSubmitted"
                />
              </q-card-section>
            </q-card>
          </q-form>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="">
        <q-img class="mt-4 ml-5" src="~assets/logo_custom.svg" width="85px" />
      </div>
      <q-form @submit="onSubmit()">
        <q-card class="pt-15" flat>
          <q-card-section class="mb-10">
            <div class="full-width q-pa-lg">
              <div
                class="text-h4 text-center text-weight-bold q-my-md"
                :class="$q.dark.isActive ? 'text-white' : 'text-primary'"
              >
                Sign In
              </div>

              <div
                class="text-caption text-center no-padding"
                :class="$q.dark.isActive ? 'text-white' : 'text-primary'"
              >
                Enter your credentials to access your account.
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-input
              type="text"
              label="Username"
              v-model="record.username"
              @update:model-value="() => errors.reset()"
              :error="errors.has('username')"
              :error-message="String(errors.get('username'))"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              type="password"
              label="Password"
              v-model="record.password"
              @update:model-value="() => errors.reset()"
              :error="errors.has('password')"
              :error-message="String(errors.get('password'))"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
            </q-input>

            <q-checkbox v-model="record.remember" label="Remember me" />

            <q-btn
              color="primary"
              label="Submit"
              class="full-width mt-14"
              type="submit"
              :disable="isDisableSubmitted"
            />
          </q-card-section>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// create max - min width class for responsive login form card
.max-width {
  width: 450px;
}
.min-width {
  width: 300px;
}
// set up for background image
.bg-kan {
  position: absolute;
  z-index: 1;
  height: 100%;
  width: 100%;
  overflow: hidden;

  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 10px;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-color: -var(--q-primary);
    box-shadow: inset 2000px 0 0 0 rgba(0, 0, 0, 0.7);
    background-size: cover;
    filter: blur(6px);
    transform: scale(1.1);
  }
}
</style>
