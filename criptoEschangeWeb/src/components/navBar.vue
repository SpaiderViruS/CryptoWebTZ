<template>
  <nav>
    <div class="nav-wrapper">
      <div class="nav-header">
        <router-link to="/" class="nav-logo">CryptoExchange</router-link>
        <button class="burger" @click="toggleMenu">
          ☰
        </button>
      </div>

      <transition name="slide-fade">
        <div class="mobile-menu" v-if="menuOpen">
          <router-link to="/">Главная</router-link>
          <router-link to="/faq">FAQ</router-link>
          <router-link to="/contacts">Контакты</router-link>
          <router-link to="/reviews">Отзывы</router-link>

          <div v-if="isAuthenticated" class="mobile-admin-block">
            <strong>Админ панель</strong>
            <router-link
              v-for="(item, index) in adminRoutes"
              :key="index"
              :to="item.path"
              @click="closeMenu"
            >
              {{ item.title }}
            </router-link>
          </div>

          <v-btn
            class="nav_btn"
            variant="outlined"
            @click="isAuthenticated ? logout() : openAuthDialog()"
          >
            {{ isAuthenticated ? 'Выйти' : 'Войти' }}
          </v-btn>
        </div>
      </transition>

      <div class="nav-container">
        <div class="demo-note">
          🧪 Демо версия 10.04
        </div>
        <router-link to="/">Главная</router-link>
        <router-link to="/faq">FAQ</router-link>
        <router-link to="/contacts">Контакты</router-link>
        <router-link to="/reviews">Отзывы</router-link>

        <div class="admin-menu" v-if="isAuthenticated">
          <div class="admin-dropdown-trigger">
            Админ панель
            <div class="dropdown-menu">
              <router-link 
                v-for="(item, index) in adminRoutes" 
                :key="index" 
                :to="item.path"
              >
                {{ item.title }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="auth-buttons">
          <v-btn
            v-if="!isAuthenticated"
            class="nav_btn"
            variant="outlined"
            @click="openAuthDialog"
          >
            Войти
          </v-btn>
          <v-btn
            v-else
            class="nav_btn"
            variant="outlined"
            @click="logout"
          >
            Выйти
          </v-btn>
        </div>
      </div>
    </div>
  </nav>

  <v-dialog v-model="authDialog" width="600">
    <AuthorizationDialog
      @close="closeAuthDialog"
      @login-success="handleLoginSuccess"
    />
  </v-dialog>

  <div class="watermark">Демо версия CryptoExchange</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthorizationDialog from './dialogs/authorizationDialog.vue';

const adminRoutes = ref([
  { path: '/admin/exchange-requests', title: 'Заявки на обмен' },
  { path: '/admin/fees-limits', title: 'Комиссии и лимиты' },
  { path: '/admin/currency-pairs', title: 'Валютные пары' },
  { path: '/admin/notification-contacts', title: 'Уведомления и контакты' }
]);

const router = useRouter();
const authDialog = ref(false);
const isAuthenticated = ref(false);
const menuOpen = ref(false);

onMounted(() => {
  checkAuthStatus();
});

const checkAuthStatus = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true';
};

const openAuthDialog = () => {
  authDialog.value = true;
};

const closeAuthDialog = () => {
  authDialog.value = false;
};

const handleLoginSuccess = () => {
  checkAuthStatus();
  closeAuthDialog();
};

const logout = () => {
  localStorage.removeItem('isAuthenticated');
  isAuthenticated.value = false;
  router.push('/');
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};
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

.nav-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.auth-buttons {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.admin-menu {
  position: relative;
  cursor: pointer;
}

.admin-dropdown-trigger {
  color: white;
  text-decoration: none;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.admin-dropdown-trigger:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-radius: 4px;
  min-width: 200px;
  z-index: 1000;
}

.admin-menu:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  color: #2c3e50 !important;
  padding: 10px 15px;
  display: block;
  text-decoration: none;
  transition: 0.2s;
  text-shadow: none;
}

.dropdown-menu a:hover {
  background: #f5f5f5;
}

.dropdown-menu a.router-link-exact-active {
  background: #42b983;
  color: white !important;
}

a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

a:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

a.router-link-exact-active {
  background-color: rgba(0, 0, 0, 0.2);
}

.nav_btn {
  color: white !important;
  border-color: white !important;
}

.burger {
  display: none;
  font-size: 24px;
  background: none;
  border: none;
  color: white;
  margin-right: 10px;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 10px;
  background-color: #42b983;
  padding: 15px 20px;
  z-index: 999;
  border-top: 1px solid #ffffff33;
}

.mobile-menu a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  padding: 8px 0;
}

.mobile-admin-block {
  margin-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

@media (max-width: 768px) {
  .nav-container {
    display: none;
  }

  .burger {
    display: block;
    margin-left: auto;
    margin-right: 15px;
  }

  .mobile-menu {
    display: flex;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 42px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.07);
  pointer-events: none;
  user-select: none;
  z-index: 9999;
  white-space: nowrap;
}
.demo-note {
  font-size: 12px;
  margin-left: auto;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}
</style>