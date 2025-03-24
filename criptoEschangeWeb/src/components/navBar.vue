<template>
  <nav>
    <div class="nav-container">
      <router-link to="/">Главная</router-link>
      <router-link to="/faq">FAQ</router-link>
      <router-link to="/contacts">Контакты</router-link>
      <router-link to="/reviews">Отзывы</router-link>
      <router-link to="/admin">Админка</router-link>
      <v-btn class="nav_btn" variant="outlined" @click="auth = !auth">Войти</v-btn>
    </div>
  </nav>
  <v-dialog v-model="auth" width="600">
    <authorizationDialog @close="closeAuthDialog()"></authorizationDialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import authorizationDialog from './dialogs/authorizationDialog.vue';
name: 'navBar';

components: { authorizationDialog };

let auth = ref(false)
const isAdmin = localStorage.getItem('isAuthenticated')

const closeAuthDialog = () => {
  auth.value = false;
}
</script>

<style scoped>
nav {
  background-color: #42b983;
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 20px;
}
.nav_btn {
  margin-left: auto;
  margin-right: 0;
}

a {
  color: white; /* Белый текст */
  text-decoration: none;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Тень для текста */
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

a:hover {
  background-color: rgba(0, 0, 0, 0.1); /* Легкий фон при наведении */
}

a.router-link-exact-active {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2); /* Активная ссылка */
}
</style>