<template>
  <v-card>
    <v-card-title>
      Авторизация
      <v-spacer />
      <div v-if="error" class="errorText">
        {{ error }}
      </div>
    </v-card-title>
    <v-card-text>
      <div class="inputs">
        <v-text-field 
          v-model="user.login"
          class="mx-0"
          label="Логин"
          variant="underlined"
          placeholder="Введите логин"
          maxlength="50"
          hide-details
        />
        <v-text-field 
          class="mt-2"
          :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
          :type="show ? 'text' : 'password'"
          variant="underlined"
          label="Пароль"
          v-model="user.password"
          @keyup.enter="tryEnter"
          @click:append="show = !show"
        />
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue" outlined @click="tryEnter()">Войти</v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: 'authDialog',
  data: () => ({
    show: false,
    error: '',
    user: {
      login: null,
      password: null
    }
  }),

  methods: {
    setError(error) {
      this.error = error;
      setTimeout(() => (this.error = ''), 3000);
    },

    async tryEnter() {
      if (!this.user.login || !this.user.password) {
        this.setError('Заполните поля');
        return;
      }

      try {
        const response = await this.$api.$post('/users/login', {
          username: this.user.login,
          password: this.user.password
        });

        if (response.data === 'OK') {
          localStorage.setItem('isAuthenticated', 'true');
          this.$emit('close');
          window.location.href = '/admin-components/exchange-requests';
        } else {
          this.setError('Ошибка авторизации');
        }
      } catch (error) {
        if (error.response && error.response.data) {
          // Если сервер возвращает детали ошибки
          this.setError(error.response.data.message || 'Неверный логин или пароль');
        } else {
          this.setError('Ошибка соединения с сервером');
        }
      }
    }
  }
}
</script>
<style scoped>
.inputs {
  width: 100%;
}
.errorText {
  color: red;
  font-size: initial;
  font-weight: initial;
}
</style>